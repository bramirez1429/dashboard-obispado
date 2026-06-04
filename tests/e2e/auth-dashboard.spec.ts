import { expect, type Page, test } from "@playwright/test";

const gotoAppRoute = async (page: Page, url: string) => {
  await page.goto(url, { waitUntil: "domcontentloaded" });
};

test.describe("Protección del dashboard", () => {
  test("redirige a login cuando un usuario sin sesión intenta abrir el dashboard", async ({
    page,
  }) => {
    await gotoAppRoute(page, "/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Ingreso al dashboard" }),
    ).toBeVisible();
  });
});

test.describe("Pantalla de login", () => {
  test("muestra los campos necesarios para iniciar sesión", async ({ page }) => {
    await gotoAppRoute(page, "/login");

    await expect(
      page.getByRole("heading", { name: "Ingreso al dashboard" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox").first()).toBeVisible();
    await expect(page.getByPlaceholder("Ingrese su contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });

  test("mantiene al usuario en login si intenta enviar el formulario vacío", async ({
    page,
  }) => {
    await gotoAppRoute(page, "/login");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Ingreso al dashboard" }),
    ).toBeVisible();
  });
});
