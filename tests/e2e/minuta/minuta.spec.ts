import { expect, test } from "@playwright/test";

test.describe("Dashboard minuta autenticado", () => {
  test("debe mostrar acciones de una minuta existente y navegar a sus vistas", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar minuta autenticada.",
    );

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/minuta/);

    const existingMinuteTitle = page.getByText(/Ya est/);
    const hasExistingMinute = await existingMinuteTitle.isVisible();

    test.skip(
      !hasExistingMinute,
      "Requiere una minuta existente para el domingo activo.",
    );

    await expect(existingMinuteTitle).toBeVisible();
    await expect(page.getByRole("button", { name: "Ver minuta" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Editar minuta" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear minuta siguiente" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ver minuta para PDF" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Ver minuta" }).click();
    await expect(page).toHaveURL(/\/reunion-sacramental$/);

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Editar minuta" }).click();
    await expect(page).toHaveURL(/\/dashboard\/minuta\/editar\/[^/]+$/);

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Ver minuta para PDF" }).click();
    await expect(page).toHaveURL(/\/dashboard\/minuta\/pdf\/[^/]+$/);

    await page.goto("/dashboard/minuta", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Crear minuta siguiente" }).click();
    await expect(page).toHaveURL(/\/dashboard\/minuta\?createNext=true$/);
    await expect(
      page.getByRole("button", { name: /Guardar minuta|Actualizar minuta/ }),
    ).toBeVisible();
  });
});
