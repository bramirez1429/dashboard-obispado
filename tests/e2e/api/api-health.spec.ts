import { expect, test } from "@playwright/test";

test.describe("Health de rutas públicas e internas", () => {
  test("GET /reunion-sacramental debe responder 200", async ({ request }) => {
    const response = await request.get("/reunion-sacramental");

    expect(response.status()).toBe(200);
  });

  test("GET /m/[id] debe responder 200 con un ID público de discurso de prueba", async ({
    request,
  }) => {
    const speechId = process.env.E2E_PUBLIC_SPEECH_ID;

    test.skip(
      !speechId,
      "Requiere E2E_PUBLIC_SPEECH_ID para probar una página pública de discurso por ID.",
    );

    const response = await request.get(`/m/${speechId}`);

    expect(response.status()).toBe(200);
  });
});
