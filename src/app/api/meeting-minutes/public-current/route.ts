import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";
import {
  getCurrentArgentinaTimestamp,
  getParsedMeetingMinutes,
} from "@/lib/meeting-minutes/selectMeetingMinute";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { supabase } = await import("@/lib/supabase/client");
    const { data, error } = await supabase.from("Meeting_minutes").select("*");

    if (error) {
      console.error(
        "Error trayendo Meeting_minutes para minuta publica vigente",
        error
      );

      return Response.json(
        {
          success: false,
          error: error.message,
          data: null,
        },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const now = getCurrentArgentinaTimestamp();
    const parsedMinutes = getParsedMeetingMinutes(
      (data ?? []) as MeetingMinute[]
    );

    console.log("NOW", now.formatted);

    for (const parsedMinute of parsedMinutes) {
      console.log(
        "MINUTE",
        parsedMinute.minute.date,
        "EXPIRES",
        parsedMinute.expiresAtFormatted,
        "VALID",
        parsedMinute.expiresAtTimestamp > now.timestamp
      );
    }

    const currentMinute =
      parsedMinutes.find(
        (parsedMinute) => parsedMinute.expiresAtTimestamp > now.timestamp
      )?.minute ?? null;

    return Response.json(
      {
        success: true,
        table: "Meeting_minutes",
        count: parsedMinutes.length,
        data: currentMinute,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Error inesperado en GET public-current Meeting_minutes", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
        details: String(error),
        data: null,
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
