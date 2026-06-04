import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test } from "@playwright/test";

const adminStorageStatePath = "playwright/.auth/admin.json";

test("autentica al administrador y guarda storageState", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPassword = process.env.E2E_ADMIN_PASSWORD;
  const missingCredentials = !adminEmail || !adminPassword;

  if (missingCredentials) {
    mkdirSync(dirname(adminStorageStatePath), { recursive: true });
    writeFileSync(
      adminStorageStatePath,
      JSON.stringify({ cookies: [], origins: [] }),
    );
  }

  test.skip(
    missingCredentials,
    "Requiere E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para crear storageState.",
  );

  await page.goto("/login", { waitUntil: "domcontentloaded" });

  await page.getByLabel(/email|usuario/i).fill(adminEmail!);
  await page.getByLabel(/contrase|password/i).fill(adminPassword!);
  await page
    .getByRole("button", { name: /ingresar|iniciar sesión|login/i })
    .click();

  await expect(page).toHaveURL(/\/dashboard/);

  mkdirSync(dirname(adminStorageStatePath), { recursive: true });
  await page.context().storageState({ path: adminStorageStatePath });
});
