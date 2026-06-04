import { expect, test } from "@playwright/test";

test.describe("Edición de minuta autenticada", () => {
  test("debe abrir la edición y permitir agregar otro asunto sin guardar cambios", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar edición autenticada.",
    );

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });

    const editButton = page.getByRole("button", { name: "Editar minuta" });
    const hasExistingMinute = await editButton.isVisible();

    test.skip(
      !hasExistingMinute,
      "Requiere una minuta existente para el domingo activo.",
    );

    await editButton.click();
    await expect(page).toHaveURL(/\/dashboard\/minuta\/editar\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "Editar minuta" }),
    ).toBeVisible();

    await expect(page.getByText("Datos principales")).toBeVisible();
    await expect(page.getByText(/Inicio de la reunión|Himnos y oraciones/i)).toBeVisible();
    await expect(page.getByText("Anuncios")).toBeVisible();
    await expect(page.getByText(/Asuntos del barrio/i)).toBeVisible();
    await expect(page.getByText(/Discursos\s*\/?\s*mensajes/i)).toBeVisible();
    await expect(page.getByText("Himno sacramental")).toBeVisible();
    await expect(page.getByText(/Final de la reunión|Cierre\/asistencia/i)).toBeVisible();

    const addBusinessButton = page.getByRole("button", {
      name: "Agregar asunto",
    });
    await expect(addBusinessButton).toBeVisible();

    const businessSubjectLabels = page.locator("label", { hasText: /^Asunto/ });
    const initialBusinessSubjectCount = await businessSubjectLabels.count();

    await addBusinessButton.click();

    await expect
      .poll(async () => businessSubjectLabels.count())
      .toBeGreaterThan(initialBusinessSubjectCount);
  });
});
