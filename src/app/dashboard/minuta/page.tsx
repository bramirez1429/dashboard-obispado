import ExistingMinuteCard from "./components/ExistingMinuteCard";
import ModernMinutesSection from "./components/ModernMinutesSection";
import type { ModernMinuteCard } from "./components/ModernMinutesSection";
import NewMinuteExperience from "./components/NewMinuteExperience";

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

function parseDDMMYYYYToUTCDate(date: string) {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
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

function getDDMMYYYYTime(date: string) {
  const parsedDate = parseDDMMYYYYToUTCDate(date);
  const time = parsedDate.getTime();

  return Number.isFinite(time) ? time : 0;
}

async function getActiveMinute() {
  const activeSundayDate = getActiveSundayDate();
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("id")
    .eq("date", activeSundayDate)
    .maybeSingle();

  if (error || !data?.id) {
    return null;
  }

  return {
    id: String(data.id),
  };
}

async function getPreviousMinutes(activeSundayDate: string) {
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("id, date");

  if (error || !data) {
    return [];
  }

  const activeSundayTime = getDDMMYYYYTime(activeSundayDate);

  return (data as { id?: string | number; date?: string }[])
    .filter(
      (minute): minute is { id: string | number; date: string } =>
        minute.id !== undefined &&
        typeof minute.date === "string" &&
        getDDMMYYYYTime(minute.date) < activeSundayTime
    )
    .sort(
      (firstMinute, secondMinute) =>
        getDDMMYYYYTime(secondMinute.date) - getDDMMYYYYTime(firstMinute.date)
    )
    .map((minute) => ({
      id: String(minute.id),
      date: String(minute.date),
    }));
}

const getModernMinutes = async (): Promise<ModernMinuteCard[]> => {
  const { supabase } = await import("@/lib/supabase/client");
  const { data, error } = await supabase
    .from("Meeting_minutes")
    .select("id, date, leads, presides, attendance");

  if (error || !data) {
    return [];
  }

  return (
    data as {
      id?: string | number;
      date?: string;
      leads?: string | null;
      presides?: string | null;
      attendance?: number | null;
    }[]
  )
    .filter(
      (minute): minute is {
        id: string | number;
        date: string;
        leads?: string | null;
        presides?: string | null;
        attendance?: number | null;
      } => minute.id !== undefined && typeof minute.date === "string"
    )
    .sort(
      (firstMinute, secondMinute) =>
        getDDMMYYYYTime(secondMinute.date) - getDDMMYYYYTime(firstMinute.date)
    )
    .map((minute) => ({
      id: minute.id,
      date: minute.date,
      leads: minute.leads?.trim() || "-",
      presides: minute.presides?.trim() || "-",
      attendance: minute.attendance,
    }));
};

export default async function MinutaPage() {
  const activeMinute = await getActiveMinute();
  const activeSundayDate = getActiveSundayDate();
  const previousMinutes = activeMinute
    ? await getPreviousMinutes(activeSundayDate)
    : [];
  const minutes = await getModernMinutes();
  const newMinuteExperience = (
    <NewMinuteExperience>
      <ModernMinutesSection minutes={minutes} />
    </NewMinuteExperience>
  );

  if (activeMinute) {
    return (
      <div className="minute-page">
        <ExistingMinuteCard
          activeMinuteId={activeMinute.id}
          previousMinutes={previousMinutes}
        />
        {newMinuteExperience}
      </div>
    );
  }

  return (
    <div className="minute-page">
      {newMinuteExperience}
    </div>
  );
}
