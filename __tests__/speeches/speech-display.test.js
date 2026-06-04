import {
  getSpeechStatusLabel,
  getSpeechTreatment,
} from "@/lib/speeches";

describe("Género de discursos", () => {
  test('masculine debe mostrar "Hermano"', () => {
    expect(getSpeechTreatment("masculine")).toBe("Hermano");
  });

  test('feminine debe mostrar "Hermana"', () => {
    expect(getSpeechTreatment("feminine")).toBe("Hermana");
  });
});

describe("Estado de discursos", () => {
  test('status shared debe mostrarse como "Compartido"', () => {
    expect(getSpeechStatusLabel("shared")).toBe("Compartido");
  });

  test('status pending debe mostrarse como "Pendiente"', () => {
    expect(getSpeechStatusLabel("pending")).toBe("Pendiente");
  });

  test('status vacío, null o undefined debe tratarse como "Pendiente"', () => {
    expect(getSpeechStatusLabel("")).toBe("Pendiente");
    expect(getSpeechStatusLabel(null)).toBe("Pendiente");
    expect(getSpeechStatusLabel(undefined)).toBe("Pendiente");
  });
});
