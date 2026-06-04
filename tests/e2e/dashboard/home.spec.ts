import { expect, test } from "@playwright/test";

test.describe("Dashboard home autenticado", () => {
  test("debe cargar el home y mostrar las cards principales del resumen", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar dashboard autenticado.",
    );

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Minuta sacramental")).toBeVisible();
    await expect(
      page.getByText(/Minuta completa|Minuta en preparación/),
    ).toBeVisible();

    await expect(page.getByText("Discursos asignados")).toBeVisible();
    await expect(page.getByText(/Total:/)).toBeVisible();
    await expect(page.getByText(/Compartidos:/)).toBeVisible();
    await expect(page.getByText(/Pendientes:/)).toBeVisible();

    await expect(page.getByText("Mensajes temporales")).toBeVisible();
    await expect(page.getByText("Trabajando")).toBeVisible();
  });
});
