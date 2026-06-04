import { expect, test } from "@playwright/test";

test.describe("Página pública de reunión sacramental", () => {
  test("debe mostrar la minuta pública y validar módulos principales", async ({
    page,
  }) => {
    await page.goto("/reunion-sacramental", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/reunion-sacramental$/);
    await expect(page.getByText("Hna./Hno")).toHaveCount(0);

    const publicMinuteTitle = page.getByRole("heading", {
      name: /Reunión Sacramental/i,
    });
    const hasPublicMinute = await publicMinuteTitle.isVisible();

    test.skip(
      !hasPublicMinute,
      "Requiere una minuta pública disponible para validar sus módulos.",
    );

    await expect(publicMinuteTitle).toBeVisible();
    await expect(page.getByText("Fecha")).toBeVisible();
    await expect(page.getByText("Preside")).toBeVisible();
    await expect(page.getByText("Dirige")).toBeVisible();
    await expect(page.getByText("Inicio de la reunión")).toBeVisible();
    await expect(page.getByText("Himno sacramental")).toBeVisible();
    await expect(page.getByText("Mensajes")).toBeVisible();
    await expect(page.getByText("Final de la reunión")).toBeVisible();

    const hymnLinks = page.locator("a.public-hymn-link");
    const hymnLinkCount = await hymnLinks.count();

    for (let index = 0; index < hymnLinkCount; index += 1) {
      const hymnLink = hymnLinks.nth(index);

      await expect(hymnLink).toBeVisible();
      await expect(hymnLink).toHaveAttribute("href", /.+/);
      await expect(hymnLink).toHaveAttribute("target", "_blank");
    }
  });
});
