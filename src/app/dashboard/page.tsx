import { auth } from "@/auth";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getNextSpeakingSundayFromActiveSunday } from "@/lib/dashboard-summary";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

type DashboardSpeech = {
  id: string;
  name: string | null;
  speech: string | null;
  time: number | null;
  status: string | null;
};

function getArgentinaDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
  };
}

function formatDateToDDMMYYYY(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

function formatDateToYYYYMMDD(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${year}-${month}-${day}`;
}

function formatDateToSlashDDMMYYYY(date: string) {
  const [day, month, year] = date.split("-");
  return `${day}/${month}/${year}`;
}

function getActiveSundayUTCDate() {
  const { year, month, day, hour } = getArgentinaDateParts();
  const today = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = today.getUTCDay();
  const activeSunday = new Date(today);

  if (dayOfWeek === 0) {
    activeSunday.setUTCDate(today.getUTCDate() + (hour >= 13 ? 7 : 0));
  } else {
    activeSunday.setUTCDate(today.getUTCDate() + (7 - dayOfWeek));
  }

  return activeSunday;
}

function getActiveSundayDate() {
  return formatDateToDDMMYYYY(getActiveSundayUTCDate());
}

function getNextSpeakingSundayUTCDate() {
  return getNextSpeakingSundayFromActiveSunday(getActiveSundayUTCDate());
}

async function getDashboardSummary() {
  const activeSundayDate = getActiveSundayDate();
  const nextSpeakingSunday = getNextSpeakingSundayUTCDate();
  const nextSpeakingSundayDisplayDate = formatDateToDDMMYYYY(nextSpeakingSunday);
  const nextSpeakingSundayQueryDate = formatDateToYYYYMMDD(nextSpeakingSunday);
  const { supabase } = await import("@/lib/supabase/client");

  const [{ data: activeMinute }, { data: speeches }] = await Promise.all([
    supabase
      .from("Meeting_minutes")
      .select("id")
      .eq("date", activeSundayDate)
      .maybeSingle(),
    supabase
      .from("Speeches")
      .select("id, name, speech, time, status")
      .eq("date", nextSpeakingSundayQueryDate)
      .order("date", { ascending: false })
  ]);

  return {
    minute: {
      status: activeMinute?.id ? "Minuta completa" : "Minuta en preparación",
      sunday: formatDateToSlashDDMMYYYY(activeSundayDate),
    },
    speeches: {
      sunday: formatDateToSlashDDMMYYYY(nextSpeakingSundayDisplayDate),
      items: ((speeches || []) as DashboardSpeech[]).map((speech) => ({
        id: String(speech.id),
        name: speech.name || "Sin nombre",
        speech: speech.speech || "Sin tema",
        time: speech.time ?? null,
        status:
          speech.status === "shared" ? ("shared" as const) : ("pending" as const),
      })),
    },
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const fullName =
    `${session?.user?.name || ""} ${session?.user?.lastname || ""}`.trim() ||
    "Usuario";
  const summary = await getDashboardSummary();

  return <DashboardHome fullName={fullName} summary={summary} />;
}
