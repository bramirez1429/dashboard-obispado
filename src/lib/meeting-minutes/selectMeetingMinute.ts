import type { MeetingMinute } from "@/components/meeting-minutes/MeetingMinuteView";

const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

type ArgentinaDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type ParsedMeetingMinute = {
  minute: MeetingMinute;
  expiresAtTimestamp: number;
  expiresAtFormatted: string;
};

const getArgentinaDateParts = (date: Date): ArgentinaDateParts => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
    second: Number(getPart("second")),
  };
};

const toTimestamp = ({
  year,
  month,
  day,
  hour,
  minute,
  second,
}: ArgentinaDateParts) => {
  return Date.UTC(year, month - 1, day, hour, minute, second);
};

const formatParts = ({
  year,
  month,
  day,
  hour,
  minute,
  second,
}: ArgentinaDateParts) => {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}:${String(second).padStart(2, "0")} ${ARGENTINA_TIME_ZONE}`;
};

const parseMinuteDate = (value?: string) => {
  const match = value?.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
};

const getMinuteExpiration = (date?: string) => {
  const parsedDate = parseMinuteDate(date);

  if (!parsedDate) {
    return null;
  }

  const expiresAtParts = {
    ...parsedDate,
    hour: 13,
    minute: 0,
    second: 0,
  };

  return {
    timestamp: toTimestamp(expiresAtParts),
    formatted: formatParts(expiresAtParts),
  };
};

export const getCurrentArgentinaTimestamp = (date = new Date()) => {
  const parts = getArgentinaDateParts(date);

  return {
    timestamp: toTimestamp(parts),
    formatted: formatParts(parts),
  };
};

export const getParsedMeetingMinutes = (
  minutes: MeetingMinute[]
): ParsedMeetingMinute[] => {
  return minutes
    .flatMap((minute) => {
      const expiration = getMinuteExpiration(minute.date);

      if (!expiration) {
        return [];
      }

      return [
        {
          minute,
          expiresAtTimestamp: expiration.timestamp,
          expiresAtFormatted: expiration.formatted,
        },
      ];
    })
    .sort((a, b) => a.expiresAtTimestamp - b.expiresAtTimestamp);
};

export const sortMeetingMinutesByDate = (minutes: MeetingMinute[]) => {
  return getParsedMeetingMinutes(minutes).map(({ minute }) => minute);
};

export const selectMeetingMinuteByDate = (
  minutes: MeetingMinute[],
  now = new Date()
) => {
  const currentTimestamp = getCurrentArgentinaTimestamp(now).timestamp;
  const parsedMinutes = getParsedMeetingMinutes(minutes);
  const currentOrFutureMinute = parsedMinutes.find(
    (minute) => minute.expiresAtTimestamp > currentTimestamp
  );

  if (currentOrFutureMinute) {
    return currentOrFutureMinute.minute;
  }

  return parsedMinutes.at(-1)?.minute ?? null;
};

export const selectPublicCurrentMeetingMinute = (
  minutes: MeetingMinute[],
  now = new Date()
) => {
  const currentTimestamp = getCurrentArgentinaTimestamp(now).timestamp;

  return (
    getParsedMeetingMinutes(minutes).find(
      (minute) => minute.expiresAtTimestamp > currentTimestamp
    )?.minute ?? null
  );
};
