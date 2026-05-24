import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { auth } from "@/auth";

type CreateUserRequestBody = {
  name?: string;
  lastname?: string;
  callings?: string;
  username?: string;
  phone?: string;
  password?: string;
  role?: string;
  active?: boolean;
};

const allowedRoles = new Set(["Admin", "Bishopric", "Leader", "Viewer"]);

function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as CreateUserRequestBody;
  const name = cleanOptionalText(body.name);
  const lastname = cleanOptionalText(body.lastname);
  const callings = cleanOptionalText(body.callings);
  const username = cleanOptionalText(body.username);
  const phone = cleanOptionalText(body.phone);
  const password = typeof body.password === "string" ? body.password : "";
  const role = cleanOptionalText(body.role);
  const active = typeof body.active === "boolean" ? body.active : true;

  if (!name) {
    return NextResponse.json(
      { success: false, error: "El nombre es requerido" },
      { status: 400 }
    );
  }

  if (!username && !phone) {
    return NextResponse.json(
      { success: false, error: "Ingrese usuario o teléfono" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { success: false, error: "La contraseña es requerida" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      },
      { status: 400 }
    );
  }

  if (!role || !allowedRoles.has(role)) {
    return NextResponse.json(
      { success: false, error: "El rol es requerido" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("Users")
    .insert({
      name,
      lastname,
      callings,
      username,
      phone,
      password_hash: passwordHash,
      role,
      active,
      updated_at: new Date().toISOString(),
    })
    .select("id, user_uuid, name, lastname, callings, username, phone, role, active")
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
