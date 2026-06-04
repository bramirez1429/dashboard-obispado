import { expect, test } from "@playwright/test";

test.describe("Vista PDF de minuta autenticada", () => {
  test("debe abrir la vista PDF de la minuta y mostrar controles principales", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar PDF de minuta.",
    );

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });

    const pdfButton = page.getByRole("button", {
      name: "Ver minuta para PDF",
    });
    const hasExistingMinute = await pdfButton.isVisible();

    test.skip(
      !hasExistingMinute,
      "Requiere una minuta existente para el domingo activo.",
    );

    await pdfButton.click();

    await expect(page).toHaveURL(/\/dashboard\/minuta\/pdf\/[^/]+$/);
    await expect(page.locator(".minute-pdf-print-area")).toBeVisible();
    await expect(page.getByText(/Fecha|Preside|Dirige/).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Imprimir / Guardar PDF" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Volver a minuta" })).toBeVisible();
  });
});
