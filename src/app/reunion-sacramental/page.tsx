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
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
  };
};

const formatDateToDDMMYYYY = (date: Date) => {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};

const getSundayDates = () => {
  const { year, month, day } = getArgentinaDateParts();

  const today = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = today.getUTCDay();

  const previousSunday = new Date(today);
  previousSunday.setUTCDate(today.getUTCDate() - dayOfWeek);

  const nextSunday = new Date(today);
  nextSunday.setUTCDate(
    today.getUTCDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek)
  );

  return {
    isSunday: dayOfWeek === 0,
    today: formatDateToDDMMYYYY(today),
    previousSunday: formatDateToDDMMYYYY(previousSunday),
    nextSunday: formatDateToDDMMYYYY(nextSunday),
  };
};

const selectMeetingMinuteByDate = (minutes: MeetingMinute[]) => {
  const { isSunday, today, previousSunday, nextSunday } = getSundayDates();

  if (isSunday) {
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
  const result = await getMeetingMinutes();

  console.log("Resultado GET /api/meeting-minutes:", result);

  const minutes = result.data ?? [];
  const minute = selectMeetingMinuteByDate(minutes);

  console.log("Minutas recibidas:", minutes);
  console.log("Minuta seleccionada:", minute);

  return <MeetingMinuteView minute={minute} />;
};

export default SacramentalMeetingPage;
