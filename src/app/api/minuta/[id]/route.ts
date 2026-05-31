import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PUT(
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

  const { id } = await params;
  const payload = await request.json();
  const valuesToUpdate = { ...payload };
  delete valuesToUpdate.id;

  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .update(valuesToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
