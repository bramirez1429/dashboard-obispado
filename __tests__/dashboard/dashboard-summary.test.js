import {
  getDashboardSpeechSummary,
  getNextSpeakingSundayFromActiveSunday,
} from "@/lib/dashboard-summary";

describe("Resumen de discursos del dashboard", () => {
  test("si hay 2 discursos, 1 shared y 1 pending, devuelve total 2, compartidos 1 y pendientes 1", () => {
    const summary = getDashboardSpeechSummary([
      { status: "shared" },
      { status: "pending" },
    ]);

    expect(summary).toEqual({
      total: 2,
      shared: 1,
      pending: 1,
    });
  });

  test("si no hay discursos, devuelve total 0, compartidos 0 y pendientes 0", () => {
    const summary = getDashboardSpeechSummary([]);

    expect(summary).toEqual({
      total: 0,
      shared: 0,
      pending: 0,
    });
  });
});

describe("Domingo de discursos", () => {
  test("si el domingo activo es primer domingo del mes, salta al domingo siguiente", () => {
    const firstSunday = new Date(Date.UTC(2026, 5, 7));
    const nextSpeakingSunday =
      getNextSpeakingSundayFromActiveSunday(firstSunday);

    expect(nextSpeakingSunday.toISOString().slice(0, 10)).toBe("2026-06-14");
  });

  test("si el domingo activo no es primer domingo del mes, usa ese mismo domingo", () => {
    const regularSunday = new Date(Date.UTC(2026, 5, 14));
    const nextSpeakingSunday =
      getNextSpeakingSundayFromActiveSunday(regularSunday);

    expect(nextSpeakingSunday.toISOString().slice(0, 10)).toBe("2026-06-14");
  });
});
