import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;

  const { data, error } = await supabase
    .from("Speeches")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return Response.json(
      { success: false, error: "Mensaje no encontrado" },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data,
  });
};
