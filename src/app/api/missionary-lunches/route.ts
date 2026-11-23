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
