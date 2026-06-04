export type SpeechGender = "masculine" | "feminine" | null | undefined;
export type SpeechStatus = "pending" | "shared" | "" | null | undefined;
export type NormalizedSpeechStatus = "pending" | "shared";

export function getSpeechTreatment(gender: SpeechGender) {
  return gender === "feminine" ? "Hermana" : "Hermano";
}

export function normalizeSpeechStatus(
  status: SpeechStatus,
): NormalizedSpeechStatus {
  return status === "shared" ? "shared" : "pending";
}

export function getSpeechStatusLabel(status: SpeechStatus) {
  return normalizeSpeechStatus(status) === "shared"
    ? "Compartido"
    : "Pendiente";
}
