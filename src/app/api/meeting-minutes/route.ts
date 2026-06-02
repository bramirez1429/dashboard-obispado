import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { supabase } = await import("@/lib/supabase/client");

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("id");
    const targetDate = searchParams.get("date");

    if (targetId) {
      const { data, error } = await supabase
        .from("Meeting_minutes")
        .select("*")
        .eq("id", targetId)
        .maybeSingle();

      if (error) {
        console.error("Error trayendo Meeting_minutes", error);

        return Response.json(
          {
            success: false,
            error: error.message,
            details: error,
          },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        table: "Meeting_minutes",
        targetId,
        data,
      });
    }

    let query = supabase
      .from("Meeting_minutes")
      .select("*", { count: "exact" });

    if (targetDate) {
      query = query.eq("date", targetDate).limit(1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error trayendo Meeting_minutes", error);

      return Response.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      table: "Meeting_minutes",
      targetDate,
      count,
      data,
    });
  } catch (error) {
    console.error("Error inesperado en GET Meeting_minutes", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const { supabase } = await import("@/lib/supabase/client");

    const payload = await request.json();

    console.log("Payload recibido para guardar Meeting_minutes:", payload);

    const { data, error } = await supabase
      .from("Meeting_minutes")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error guardando Meeting_minutes", error);

      return Response.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Minuta guardada correctamente",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inesperado en POST Meeting_minutes", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase } = await import("@/lib/supabase/client");

    const payload = await request.json();

    console.log("Payload recibido para actualizar Meeting_minutes:", payload);

    if (!payload?.id) {
      return Response.json(
        {
          success: false,
          error: "Falta el id de la minuta para actualizar",
        },
        { status: 400 }
      );
    }

    const { id, ...valuesToUpdate } = payload;

    const { data, error } = await supabase
      .from("Meeting_minutes")
      .update(valuesToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando Meeting_minutes", error);

      return Response.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Minuta actualizada correctamente",
      data,
    });
  } catch (error) {
    console.error("Error inesperado en PATCH Meeting_minutes", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
