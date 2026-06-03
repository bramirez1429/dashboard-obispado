import { Button, Card } from "antd";
import Link from "next/link";
import { SacramentalMinuteSheet } from "@/components/minuta/SacramentalMinuteSheet";
import EditActiveMinuteButton from "./components/EditActiveMinuteButton";
import PreviousMinutesSelect from "./components/PreviousMinutesSelect";

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

function getNextSundayDate(activeSundayDate: string) {
  const nextSunday = parseDDMMYYYYToUTCDate(activeSundayDate);
  nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);

  return formatDateToDDMMYYYY(nextSunday);
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

export default async function MinutaPage({
  searchParams,
}: {
  searchParams?: Promise<{ createNext?: string; date?: string }>;
}) {
  const params = await searchParams;
  const activeMinute = await getActiveMinute();
  const activeSundayDate = getActiveSundayDate();
  const nextSundayDate = getNextSundayDate(activeSundayDate);
  const previousMinutes = activeMinute
    ? await getPreviousMinutes(activeSundayDate)
    : [];
  const creationDate =
    params?.createNext === "true" || params?.date === nextSundayDate
      ? nextSundayDate
      : undefined;

  if (activeMinute && !creationDate) {
    return (
      <div className="minute-page">
        <Card>
          <h2 className="existing-minute-title">
            Ya está hecha una minuta. ¿Te gustaría poder verla?
          </h2>
          <div className="existing-minute-actions">
            <Link href="/reunion-sacramental" prefetch={false}>
              <Button type="primary">Ver minuta</Button>
            </Link>
            <Link
              href={`/dashboard/minuta/editar/${activeMinute.id}`}
              prefetch={false}
            >
              <Button>Editar minuta</Button>
            </Link>
            <Link
              href={`/dashboard/minuta/pdf/${activeMinute.id}`}
              prefetch={false}
            >
              <Button>Ver minuta para PDF</Button>
            </Link>
            <Link
              href="/dashboard/minuta?createNext=true"
              prefetch={false}
            >
              <Button>Crear minuta siguiente</Button>
            </Link>
          </div>
          <PreviousMinutesSelect minutes={previousMinutes} />
        </Card>
      </div>
    );
  }

  return (
    <div className="minute-page">
      {creationDate ? (
        <Link
          className="public-minute-back-button"
          href="/dashboard/minuta"
          prefetch={false}
          aria-label="Volver a minuta"
        >
          ←
        </Link>
      ) : null}
      <EditActiveMinuteButton minuteId={undefined} />
      <SacramentalMinuteSheet
        key={creationDate ?? "active-minute-form"}
        initialDate={creationDate}
      />
    </div>
  );
}
