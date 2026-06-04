import { expect, test } from "@playwright/test";

test.describe("Login", () => {
  test("debe permitir iniciar sesión como administrador y navegar al dashboard", async ({
    page,
  }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL;
    const adminPassword = process.env.E2E_ADMIN_PASSWORD;

    test.skip(
      !adminEmail || !adminPassword,
      "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para probar el login real.",
    );

    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Ingreso al dashboard" }),
    ).toBeVisible();
    await expect(page.getByLabel(/email|usuario/i)).toBeVisible();
    await expect(page.getByLabel(/contrase|password/i)).toBeVisible();

    await page.getByLabel(/email|usuario/i).fill(adminEmail!);
    await page.getByLabel(/contrase|password/i).fill(adminPassword!);

    await page
      .getByRole("button", { name: /ingresar|iniciar sesión|login/i })
      .click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
