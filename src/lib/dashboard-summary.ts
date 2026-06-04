import { normalizeSpeechStatus, type SpeechStatus } from "@/lib/speeches";

export type AssignedSpeechSummaryItem = {
  status?: SpeechStatus;
};

export function getDashboardSpeechSummary(
  assignedSpeeches: AssignedSpeechSummaryItem[],
) {
  const total = assignedSpeeches.length;
  const shared = assignedSpeeches.filter(
    (speech) => normalizeSpeechStatus(speech.status) === "shared",
  ).length;

  return {
    total,
    shared,
    pending: total - shared,
  };
}

export function isFirstSundayOfMonth(date: Date) {
  return date.getUTCDay() === 0 && date.getUTCDate() <= 7;
}

export function getNextSpeakingSundayFromActiveSunday(activeSunday: Date) {
  const nextSpeakingSunday = new Date(activeSunday);

  if (isFirstSundayOfMonth(activeSunday)) {
    nextSpeakingSunday.setUTCDate(activeSunday.getUTCDate() + 7);
  }

  return nextSpeakingSunday;
}
