import { expect, test } from "@playwright/test";

test.describe("Actualización de estado de discursos E2E", () => {
  test("debe marcar un discurso Test E2E como compartido y discursado", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para actualizar discursos E2E.",
    );

    await page.goto("/dashboard/discursos", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Discursos" }),
    ).toBeVisible();

    const testSpeechRow = page.locator("tr", { hasText: "Test E2E" }).first();
    const hasTestSpeech = await testSpeechRow.isVisible();

    test.skip(
      !hasTestSpeech,
      'Requiere un registro de prueba que contenga "Test E2E".',
    );

    const statusButton = testSpeechRow.locator(".speech-status-button");

    if (await testSpeechRow.getByText("Pendiente").isVisible()) {
      await statusButton.click();

      const loadingIndicator = testSpeechRow.locator(".ant-spin");
      try {
        await expect(loadingIndicator).toBeVisible({ timeout: 1000 });
      } catch {
        // El update puede terminar antes de que Playwright observe el loading.
      }
    }

    await expect(testSpeechRow.getByText("Compartido")).toBeVisible();

    const didSpeakCheckbox = testSpeechRow.getByRole("checkbox").first();

    if (!(await didSpeakCheckbox.isChecked())) {
      await didSpeakCheckbox.check();
      await expect(page.getByText("Discurso completado")).toBeVisible();
    }

    await expect(didSpeakCheckbox).toBeChecked();
  });
});
