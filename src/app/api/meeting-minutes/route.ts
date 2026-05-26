export async function GET() {
  try {
    const { supabase } = await import("@/lib/supabase/client");

    const { data, error, count } = await supabase
      .from("Meeting_minutes")
      .select("*", { count: "exact" });

    if (error) {
      console.error("❌ Error trayendo Meeting_minutes", error);

      return Response.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    console.log("✅ Meeting_minutes traídas correctamente", { data, count });

    return Response.json({
      success: true,
      table: "Meeting_minutes",
      count,
      data,
    });
  } catch (error) {
    console.error("❌ Error trayendo Meeting_minutes", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
        details: error,
      },
      { status: 500 }
    );
  }
}
