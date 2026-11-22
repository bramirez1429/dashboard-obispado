import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTaskAccess, isValidTaskId, parseTaskInput } from "./tasks-api";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: { from: jest.fn() },
}));

const mockedAuth = auth as jest.Mock;
const mockedFrom = supabaseAdmin.from as jest.Mock;

function mockUserLookup(user: { role: string; active: boolean } | null, error: unknown = null) {
  const maybeSingle = jest.fn().mockResolvedValue({ data: user, error });
  const eq = jest.fn().mockReturnValue({ maybeSingle });
  const select = jest.fn().mockReturnValue({ eq });
  mockedFrom.mockReturnValue({ select });
  return { select, eq };
}

const validInput = {
  task_name: "Organizar reunión",
  responsible_name: "Obispo",
  category: "Minuta",
  created_date: "2026-11-22",
  delivery_date: "2026-11-28",
  completed: false,
};

describe("getTaskAccess", () => {
  beforeEach(() => jest.clearAllMocks());

  it("bloquea solicitudes sin sesión, sin consultar la base", async () => {
    mockedAuth.mockResolvedValue(null);
    expect(await getTaskAccess()).toEqual({
      authorized: false,
      status: 401,
      error: "No autorizado",
    });
    expect(mockedFrom).not.toHaveBeenCalled();
  });

  it("permite leer y editar tareas a Admin", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-id" } });
    const { eq } = mockUserLookup({ role: "Admin", active: true });
    expect(await getTaskAccess()).toEqual({ authorized: true, canWrite: true });
    expect(eq).toHaveBeenCalledWith("user_uuid", "user-id");
  });

  it("permite leer y editar tareas a Bishopric", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-id" } });
    mockUserLookup({ role: "Bishopric", active: true });
    expect(await getTaskAccess()).toEqual({ authorized: true, canWrite: true });
  });

  it("permite solo lectura a Viewer", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-id" } });
    mockUserLookup({ role: "Viewer", active: true });
    expect(await getTaskAccess()).toEqual({ authorized: true, canWrite: false });
  });

  it("rechaza Leader y usuarios inactivos", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-id" } });
    mockUserLookup({ role: "Leader", active: true });
    expect((await getTaskAccess()).authorized).toBe(false);
    mockUserLookup({ role: "Admin", active: false });
    expect((await getTaskAccess()).authorized).toBe(false);
  });

  it("deniega acceso si no puede validar el usuario", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "user-id" } });
    mockUserLookup(null, { message: "Database not reachable" });
    expect(await getTaskAccess()).toMatchObject({ authorized: false, status: 500 });
  });
});

describe("parseTaskInput", () => {
  it("acepta una tarea válida y crea con completed=false", () => {
    expect(parseTaskInput({ ...validInput, completed: true }, false)).toEqual({
      ...validInput,
      completed: false,
    });
  });

  it("acepta una edición válida", () => {
    expect(parseTaskInput({ ...validInput, completed: true }, true)?.completed).toBe(true);
  });

  it("rechaza datos inválidos", () => {
    expect(parseTaskInput(null, false)).toBeNull();
    expect(parseTaskInput({ ...validInput, task_name: "" }, false)).toBeNull();
    expect(parseTaskInput({ ...validInput, delivery_date: "2026-02-30" }, false)).toBeNull();
    expect(parseTaskInput({ ...validInput, completed: "true" }, true)).toBeNull();
  });
});

describe("isValidTaskId", () => {
  it("acepta IDs positivos y rechaza valores no válidos", () => {
    expect(isValidTaskId("21")).toBe(true);
    expect(isValidTaskId("0")).toBe(false);
    expect(isValidTaskId("-1")).toBe(false);
    expect(isValidTaskId("1;drop table")).toBe(false);
  });
});
