import { expect, test } from "@playwright/test";

const testSpeechName = "Test E2E Discurso";
const testSpeechTopic = "Prueba automatizada";

function getNextValidSpeakingSunday() {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const daysUntilNextSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;

  date.setDate(date.getDate() + daysUntilNextSunday);

  if (date.getDay() === 0 && date.getDate() <= 7) {
    date.setDate(date.getDate() + 7);
  }

  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getFullYear()),
  ].join("/");
}

test.describe("Creación de discursos autenticada", () => {
  test("debe crear un discurso de prueba y mostrarlo pendiente en el listado", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para crear discursos E2E.",
    );

    await page.goto("/dashboard/discursos", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/discursos$/);
    await expect(
      page.getByRole("heading", { name: "Discursos" }),
    ).toBeVisible();

    const newSpeechButton = page.getByRole("button", {
      name: /Nuevo mensaje|Nuevo discurso/i,
    });
    await expect(newSpeechButton).toBeVisible();

    await newSpeechButton.click();
    await expect(page).toHaveURL(/\/dashboard\/discursos\/nuevo$/);
    await expect(
      page.getByRole("heading", { name: "Nuevo mensaje" }),
    ).toBeVisible();
    await expect(page.getByText("Masculino")).toBeVisible();

    await page.getByPlaceholder(/Juan/).fill(testSpeechName);
    await page.locator(".ant-picker input").fill(getNextValidSpeakingSunday());
    await page.locator(".ant-picker input").press("Enter");
    await page.getByPlaceholder(/Fe/).fill(testSpeechTopic);
    await page.getByRole("spinbutton").fill("5");
    await page
      .getByPlaceholder(/Escrituras|referencia/i)
      .fill("Test E2E referencia");

    await page
      .getByRole("button", { name: "Generar mensaje para compartir" })
      .click();

    await expect(page.getByText("Link para compartir")).toBeVisible();

    await page.goto("/dashboard/discursos", { waitUntil: "domcontentloaded" });

    const createdSpeechRow = page
      .locator("tr")
      .filter({ hasText: testSpeechName })
      .filter({ hasText: testSpeechTopic })
      .first();

    await expect(createdSpeechRow).toBeVisible();
    await expect(createdSpeechRow).toContainText("Pendiente");
  });
});
