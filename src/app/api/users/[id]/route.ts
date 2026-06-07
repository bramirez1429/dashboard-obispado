import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type UpdateUserRequestBody = {
  name?: string;
  username?: string;
  role?: string;
};

const allowedRoles = new Set(["Admin", "Bishopric", "Leader", "Viewer"]);
const userSelect =
  "id, user_uuid, name, lastname, callings, username, phone, role, active";

function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
}

async function getUserId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return id;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const id = await getUserId(params);
  const { data, error } = await supabaseAdmin
    .from("Users")
    .select(userSelect)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message || "Usuario no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const id = await getUserId(params);
  const body = (await request.json()) as UpdateUserRequestBody;
  const name = cleanOptionalText(body.name);
  const username = cleanOptionalText(body.username);
  const role = cleanOptionalText(body.role);

  if (!name) {
    return NextResponse.json(
      { success: false, error: "El nombre es requerido" },
      { status: 400 }
    );
  }

  if (!username) {
    return NextResponse.json(
      { success: false, error: "El email es requerido" },
      { status: 400 }
    );
  }

  if (!role || !allowedRoles.has(role)) {
    return NextResponse.json(
      { success: false, error: "El rol es requerido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("Users")
    .update({
      name,
      username,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(userSelect)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const id = await getUserId(params);
  const { data: user, error: lookupError } = await supabaseAdmin
    .from("Users")
    .select("id, user_uuid")
    .eq("id", id)
    .single();

  if (lookupError || !user) {
    return NextResponse.json(
      { success: false, error: lookupError?.message || "Usuario no encontrado" },
      { status: 404 }
    );
  }

  if (String(user.user_uuid) === session.user.id) {
    return NextResponse.json(
      { success: false, error: "No podés borrar tu propio usuario" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("Users").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
