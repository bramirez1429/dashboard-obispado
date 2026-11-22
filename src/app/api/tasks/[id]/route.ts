import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTaskAccess, isValidTaskId, parseTaskInput, TASK_COLUMNS } from "@/lib/tasks-api";

type TaskRouteContext = { params: Promise<{ id: string }> };

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function PATCH(request: Request, { params }: TaskRouteContext) {
  const access = await getTaskAccess();
  if (!access.authorized) {
    return privateJson({ success: false, error: access.error }, access.status);
  }
  if (!access.canWrite) {
    return privateJson({ success: false, error: "No tenés permiso para editar tareas" }, 403);
  }

  const { id } = await params;
  if (!isValidTaskId(id)) {
    return privateJson({ success: false, error: "ID de tarea inválido" }, 400);
  }

  const body: unknown = await request.json().catch(() => null);
  const input = parseTaskInput(body, true);
  if (!input) {
    return privateJson({ success: false, error: "Datos de tarea inválidos" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("Bishorpc_tasks")
    .update(input)
    .eq("id", id)
    .select(TASK_COLUMNS)
    .maybeSingle();

  if (error) {
    console.error("Error editando tarea:", error.message);
    return privateJson({ success: false, error: "No se pudo guardar la tarea" }, 500);
  }
  if (!data) {
    return privateJson({ success: false, error: "Tarea no encontrada" }, 404);
  }

  return privateJson({ success: true, data });
}

export async function DELETE(_request: Request, { params }: TaskRouteContext) {
  const access = await getTaskAccess();
  if (!access.authorized) {
    return privateJson({ success: false, error: access.error }, access.status);
  }
  if (!access.canWrite) {
    return privateJson({ success: false, error: "No tenés permiso para borrar tareas" }, 403);
  }

  const { id } = await params;
  if (!isValidTaskId(id)) {
    return privateJson({ success: false, error: "ID de tarea inválido" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("Bishorpc_tasks")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error borrando tarea:", error.message);
    return privateJson({ success: false, error: "No se pudo borrar la tarea" }, 500);
  }
  if (!data) {
    return privateJson({ success: false, error: "Tarea no encontrada" }, 404);
  }

  return privateJson({ success: true });
}
