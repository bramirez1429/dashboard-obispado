import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const TASK_COLUMNS =
  "id, task_name, responsible_name, category, created_date, delivery_date, completed";

type TaskAccess =
  | { authorized: false; status: 401 | 403 | 500; error: string }
  | { authorized: true; canWrite: boolean };

export async function getTaskAccess(): Promise<TaskAccess> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: "No autorizado" };
  }

  // La sesión es de NextAuth, no de Supabase. Se comprueba el rol
  // vigente en el servidor antes de usar la clave service_role.
  const { data: user, error } = await supabaseAdmin
    .from("Users")
    .select("role, active")
    .eq("user_uuid", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error validando permisos de tareas:", error.message);
    return {
      authorized: false,
      status: 500,
      error: "No se pudieron validar los permisos",
    };
  }

  if (!user || user.active === false) {
    return { authorized: false, status: 403, error: "Acceso denegado" };
  }

  const role = typeof user.role === "string" ? user.role.toLowerCase().trim() : "";
  if (role !== "admin" && role !== "bishopric" && role !== "viewer") {
    return { authorized: false, status: 403, error: "Acceso denegado" };
  }

  return { authorized: true, canWrite: role === "admin" || role === "bishopric" };
}

export type TaskInput = {
  task_name: string;
  responsible_name: string;
  category: string;
  created_date: string;
  delivery_date: string;
  completed: boolean;
};

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseTaskInput(body: unknown, editing: boolean): TaskInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const value = body as Record<string, unknown>;
  const name = typeof value.task_name === "string" ? value.task_name.trim() : "";
  const responsible =
    typeof value.responsible_name === "string" ? value.responsible_name.trim() : "";
  const category = typeof value.category === "string" ? value.category.trim() : "";

  if (
    !name || name.length > 500 ||
    !responsible || responsible.length > 150 ||
    !category || category.length > 150 ||
    !isValidDate(value.created_date) ||
    !isValidDate(value.delivery_date) ||
    (editing && typeof value.completed !== "boolean")
  ) {
    return null;
  }

  return {
    task_name: name,
    responsible_name: responsible,
    category,
    created_date: value.created_date,
    delivery_date: value.delivery_date,
    completed: editing ? (value.completed as boolean) : false,
  };
}

export function isValidTaskId(id: string): boolean {
  return /^[1-9]\d{0,18}$/.test(id);
}
