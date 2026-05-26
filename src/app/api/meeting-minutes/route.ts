import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { MeetingMinute } from "@/types/meeting-minute";

const MEETING_MINUTES_TABLE = 'Meeting_minutes';

const emptyHymn = {
  number: "",
  title: "",
};

const emptyWardAndStakeBusiness = {
  subject: "",
  name: "",
  details: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDateToDDMMYYYY(value: string): string {
  if (!value) return '';

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
  }

  return '';
}

function hymn(value: unknown) {
  if (!isRecord(value)) return emptyHymn;

  return {
    number: text(value.number),
    title: text(value.title),
  };
}

function wardAndStakeBusiness(value: unknown) {
  if (!isRecord(value)) return emptyWardAndStakeBusiness;

  return {
    subject: text(value.subject),
    name: text(value.name),
    details: text(value.details),
  };
}

function messages(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    if (!isRecord(item)) {
      return {
        name: "",
        time: 0,
        topic: "",
      };
    }

    return {
      name: text(item.name),
      time: numberValue(item.time),
      topic: text(item.topic),
    };
  });
}

function buildMeetingMinutePayload(body: Record<string, unknown>): MeetingMinute {
  return {
    attendance: numberValue(body.attendance),
    date: formatDateToDDMMYYYY(text(body.date)),
    presides: text(body.presides),
    leads: text(body.leads),
    welcomeAndAcknowledgmentsOfAuthorities: text(
      body.welcomeAndAcknowledgmentsOfAuthorities
    ),
    announcements: text(body.announcements),
    firstHymn: hymn(body.firstHymn),
    director: text(body.director),
    pianist: text(body.pianist),
    openingPrayer: text(body.openingPrayer),
    wardAndStakeBusiness: wardAndStakeBusiness(body.wardAndStakeBusiness),
    sacramentalHymn: hymn(body.sacramentalHymn),
    messages: messages(body.messages),
    lastHymn: hymn(body.lastHymn),
    closingPrayer: text(body.closingPrayer),
  };
}

function logSupabaseError(action: string, error: unknown) {
  console.error(`Meeting_minutes Supabase error while ${action}`, error);
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from(MEETING_MINUTES_TABLE)
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    logSupabaseError("reading Meeting_minutes", error);

    return NextResponse.json(
      {
        success: false,
        error: `No se pudo leer Meeting_minutes: ${error.message}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data?.[0] ?? null,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const payload = buildMeetingMinutePayload(body);

  console.log('Saving Meeting_minutes payload:', payload);

  const { data, error } = await supabaseAdmin
    .from(MEETING_MINUTES_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    logSupabaseError("inserting into Meeting_minutes", error);

    return NextResponse.json(
      {
        success: false,
        error: `No se pudo guardar en Meeting_minutes: ${error.message}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const minuteId = body.id;

  if (!minuteId) {
    return NextResponse.json(
      { success: false, error: "Falta el id de la minuta para actualizar" },
      { status: 400 }
    );
  }

  const payload = buildMeetingMinutePayload(body);

  console.log('Saving Meeting_minutes payload:', payload);

  const { data, error } = await supabaseAdmin
    .from(MEETING_MINUTES_TABLE)
    .update(payload)
    .eq("id", minuteId)
    .select("*")
    .single();

  if (error) {
    logSupabaseError("updating Meeting_minutes", error);

    return NextResponse.json(
      {
        success: false,
        error: `No se pudo actualizar Meeting_minutes: ${error.message}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}
