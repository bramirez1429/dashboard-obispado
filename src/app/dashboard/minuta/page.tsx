import ModernMinutesSection from "./components/ModernMinutesSection";
import type { ModernMinuteCard } from "./components/ModernMinutesSection";
import NewMinuteExperience from "./components/NewMinuteExperience";

export const revalidate = 120;

function parseDDMMYYYYToUTCDate(date: string) {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getDDMMYYYYTime(date: string) {
  const parsedDate = parseDDMMYYYYToUTCDate(date);
  const time = parsedDate.getTime();

  return Number.isFinite(time) ? time : 0;
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
  const minutes = await getModernMinutes();
  const newMinuteExperience = (
    <NewMinuteExperience>
      <ModernMinutesSection minutes={minutes} />
    </NewMinuteExperience>
  );

  return (
    <div className="minute-page">
      {newMinuteExperience}
    </div>
  );
}
