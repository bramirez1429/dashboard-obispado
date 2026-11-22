import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTaskAccess, parseTaskInput, TASK_COLUMNS } from "@/lib/tasks-api";

export const dynamic = "force-dynamic";

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET() {
  const access = await getTaskAccess();
  if (!access.authorized) {
    return privateJson({ success: false, error: access.error }, access.status);
  }

  const { data, error } = await supabaseAdmin
    .from("Bishorpc_tasks")
    .select(TASK_COLUMNS)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error consultando tareas:", error.message);
    return privateJson({ success: false, error: "No se pudieron cargar las tareas" }, 500);
  }

  return privateJson({ success: true, data: data ?? [], canWrite: access.canWrite });
}

export async function POST(request: Request) {
  const access = await getTaskAccess();
  if (!access.authorized) {
    return privateJson({ success: false, error: access.error }, access.status);
  }
  if (!access.canWrite) {
    return privateJson({ success: false, error: "No tenés permiso para crear tareas" }, 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const input = parseTaskInput(body, false);
  if (!input) {
    return privateJson({ success: false, error: "Datos de tarea inválidos" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("Bishorpc_tasks")
    .insert(input)
    .select(TASK_COLUMNS)
    .single();

  if (error) {
    console.error("Error creando tarea:", error.message);
    return privateJson({ success: false, error: "No se pudo crear la tarea" }, 500);
  }

  return privateJson({ success: true, data }, 201);
}
