import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import EditActiveMinuteButton from "./components/EditActiveMinuteButton";

export const revalidate = 120;

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

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

function getActiveSundayDate() {
  const { year, month, day, hour } = getArgentinaDateParts();
  const today = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = today.getUTCDay();
  const activeSunday = new Date(today);

  if (dayOfWeek === 0) {
    activeSunday.setUTCDate(today.getUTCDate() + (hour >= 13 ? 7 : 0));
  } else {
    activeSunday.setUTCDate(today.getUTCDate() + (7 - dayOfWeek));
  }

  return formatDateToDDMMYYYY(activeSunday);
}

async function getActiveMinuteId() {
  const activeSundayDate = getActiveSundayDate();
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("id")
    .eq("date", activeSundayDate)
    .maybeSingle();

  if (error || !data?.id) {
    return undefined;
  }

  return String(data.id);
}

export default async function MinutaPage() {
  const activeMinuteId = await getActiveMinuteId();

  return (
    <div className="minute-page">
      <EditActiveMinuteButton minuteId={activeMinuteId} />
      <SacramentalMinuteSheet />
    </div>
  );
}
