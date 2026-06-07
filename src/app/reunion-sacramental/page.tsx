import { connection } from "next/server";
import MinuteRealtimeRefresh from "./MinuteRealtimeRefresh";
import { auth } from "@/auth";
import { MeetingMinuteView } from "@/components/meeting-minutes/MeetingMinuteView";
import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";

type MeetingMinutesResponse = {
  success: boolean;
  table?: string;
  count?: number | null;
  data?: MeetingMinute[];
  error?: string;
};

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const getArgentinaDateParts = () => {
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
};

const formatDateToDDMMYYYY = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};

const getSundayDates = () => {
  const { year, month, day, hour } = getArgentinaDateParts();

  const today = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = today.getUTCDay();
  const isCurrentSundayActive = dayOfWeek === 0 && hour < 13;

  const previousSunday = new Date(today);
  previousSunday.setUTCDate(
    today.getUTCDate() - (dayOfWeek === 0 ? 7 : dayOfWeek)
  );

  const nextSunday = new Date(today);
  nextSunday.setUTCDate(
    today.getUTCDate() + (dayOfWeek === 0 ? 7 : 7 - dayOfWeek)
  );

  return {
    isCurrentSundayActive,
    today: formatDateToDDMMYYYY(today),
    previousSunday: formatDateToDDMMYYYY(previousSunday),
    nextSunday: isCurrentSundayActive
      ? formatDateToDDMMYYYY(today)
      : formatDateToDDMMYYYY(nextSunday),
  };
};

const selectMeetingMinuteByDate = (minutes: MeetingMinute[]) => {
  const { isCurrentSundayActive, today, previousSunday, nextSunday } =
    getSundayDates();

  if (isCurrentSundayActive) {
    return minutes.find((minute) => minute.date === today) ?? null;
  }

  const nextSundayMinute = minutes.find(
    (minute) => minute.date === nextSunday
  );

  if (nextSundayMinute) {
    return nextSundayMinute;
  }

  return minutes.find((minute) => minute.date === previousSunday) ?? null;
};

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

const getMeetingMinutes = async (): Promise<MeetingMinutesResponse> => {
  const response = await fetch(`${getBaseUrl()}/api/meeting-minutes`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      error: "No se pudo cargar la reunión sacramental.",
      data: [],
    };
  }

  return response.json();
};

const SacramentalMeetingPage = async () => {
  await connection();

  const session = await auth();
  const showDashboardBackButton = session?.user?.role === "Admin";
  const result = await getMeetingMinutes();

  console.log("Resultado GET /api/meeting-minutes:", result);

  const minutes = result.data ?? [];
  const minute = selectMeetingMinuteByDate(minutes);

  console.log("Minutas recibidas:", minutes);
  console.log("Minuta seleccionada:", minute);

  return (
    <>
      <MinuteRealtimeRefresh minuteId={minute?.id ? String(minute.id) : undefined} />
      <MeetingMinuteView
        minute={minute}
        showDashboardBackButton={showDashboardBackButton}
      />
    </>
  );
};

export default SacramentalMeetingPage;
