import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return privateJson({ success: false, error: "No autorizado" }, 401);
  }

  // La sesión es de NextAuth; comprobar el rol activo antes de escribir
  // con service_role, sin otorgar UPDATE público en Supabase.
  const { data: user, error: accessError } = await supabaseAdmin
    .from("Users")
    .select("role, active")
    .eq("user_uuid", session.user.id)
    .maybeSingle();

  if (accessError) {
    console.error("Error validando permisos de misioneros:", accessError.message);
    return privateJson({ success: false, error: "No se pudieron validar los permisos" }, 500);
  }

  const role = typeof user?.role === "string" ? user.role.toLowerCase().trim() : "";
  if (!user || user.active === false || (role !== "admin" && role !== "leader")) {
    return privateJson({ success: false, error: "No tenés permiso para actualizar misioneros" }, 403);
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return privateJson({ success: false, error: "Datos inválidos" }, 400);
  }

  const values = body as Record<string, unknown>;
  const chacabuco1 = typeof values.chacabuco_1_elders === "string"
    ? values.chacabuco_1_elders.trim()
    : "";
  const chacabuco2 = typeof values.chacabuco_2_elders === "string"
    ? values.chacabuco_2_elders.trim()
    : "";

  if (!chacabuco1 || !chacabuco2 || chacabuco1.length > 200 || chacabuco2.length > 200) {
    return privateJson({ success: false, error: "Ingresá los nombres de ambos compañerismos" }, 400);
  }

  // Mantiene la lógica actual: los nombres asignados se aplican a los
  // registros existentes sin cambiar fechas, horarios ni reservas.
  const { error } = await supabaseAdmin
    .from("Missionary_lunches")
    .update({
      chacabuco_1_elders: chacabuco1,
      chacabuco_2_elders: chacabuco2,
    })
    .not("id", "is", null);

  if (error) {
    console.error("Error actualizando misioneros:", error.message);
    return privateJson({ success: false, error: "No se pudieron actualizar los nombres" }, 500);
  }

  return privateJson({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return privateJson({ success: false, error: "No autorizado" }, 401);
  }

  // NextAuth no inicia una sesión de Supabase: validar el rol vigente
  // antes de usar service_role para modificar el calendario.
  const { data: user, error: accessError } = await supabaseAdmin
    .from("Users")
    .select("role, active")
    .eq("user_uuid", session.user.id)
    .maybeSingle();

  if (accessError) {
    console.error("Error validando permisos de almuerzos:", accessError.message);
    return privateJson({ success: false, error: "No se pudieron validar los permisos" }, 500);
  }

  const role = typeof user?.role === "string" ? user.role.toLowerCase().trim() : "";
  if (!user || user.active === false || (role !== "admin" && role !== "leader")) {
    return privateJson({ success: false, error: "No tenés permiso para borrar almuerzos" }, 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const lunchDate = body && typeof body === "object" && !Array.isArray(body)
    ? (body as { lunch_date?: unknown }).lunch_date
    : null;

  if (!isValidDate(lunchDate)) {
    return privateJson({ success: false, error: "Fecha inválida" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("Missionary_lunches")
    .update({
      status: "available",
      person_name: null,
      lunch_time: null,
      companionship: null,
      chacabuco_1_elders: null,
      chacabuco_2_elders: null,
    })
    .eq("lunch_date", lunchDate)
    .eq("status", "occupied")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error liberando almuerzo:", error.message);
    return privateJson({ success: false, error: "No se pudo borrar el registro" }, 500);
  }

  if (!data) {
    return privateJson({ success: false, error: "El registro ya no está ocupado" }, 404);
  }

  return privateJson({ success: true });
}
