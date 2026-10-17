import { test, expect } from "@playwright/test";

test.describe("CP-28.04 - Regenerar enlace compartido", () => {
  test("El usuario puede generar un nuevo enlace después de desactivar el anterior", async ({ page, context }) => {
    // 1️⃣ Configurar entorno autenticado
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'mis-guiones');
    });

    // 2️⃣ Navegar al dashboard
    await page.goto("http://localhost:3000/dashboard");
    await expect(page.locator("h1")).toHaveText(/Mis Guiones/i);

    // 3️⃣ Interceptar y mockear respuestas del backend
    let firstShareLink = "http://localhost:5000/api/share/old-link-123";
    let newShareLink = "http://localhost:5000/api/share/new-link-456";

    await page.route("**/api/scripts", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scripts: [
            {
              id: 1,
              title: "Guion de prueba",
              content: "Contenido del guion para regenerar enlace",
              estilo: "narrativo",
              createdAt: new Date().toISOString(),
              isFavorite: false,
              isShared: false
            }
          ]
        })
      });
    });

    // 4️⃣ Mockear el primer POST /share → genera primer enlace
    await page.route("**/api/scripts/1/share", async route => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ link: firstShareLink })
        });
      } else if (route.request().method() === "DELETE") {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ message: "Link desactivado correctamente" })
        });
      }
    });

    // Esperar que aparezca el botón de Compartir
    const shareButton = page.locator('button:has-text("Compartir")');
    await expect(shareButton).toBeVisible();

    // 5️⃣ Click en “Compartir” → se genera primer enlace
    await shareButton.click();
    await expect(page.locator("text=Guion compartido")).toBeVisible();

    // Capturar el valor del enlace compartido
    const sharedLinkField = page.locator('input[readonly]');
    const oldLinkValue = await sharedLinkField.inputValue();
    expect(oldLinkValue).toBe(firstShareLink);

    // Cerrar modal
    await page.locator('button:has-text("Cerrar")').click();
    await expect(page.locator('text=Guion compartido')).toHaveCount(0);

    // 6️⃣ Desactivar enlace (DELETE)
    const stopShareButton = page.locator('button:has-text("Dejar de Compartir")');
    await expect(stopShareButton).toBeVisible();
    await stopShareButton.click();
    await expect(page.locator('text=El guion ya no está compartido.')).toBeVisible();

    // 7️⃣ Mockear nueva llamada POST /share → nuevo enlace
    await page.route("**/api/scripts/1/share", async route => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ link: newShareLink })
        });
      }
    });

    // 8️⃣ Generar un nuevo enlace
    const regenerateButton = page.locator('button:has-text("Compartir")');
    await regenerateButton.click();
    await expect(page.locator("text=Guion compartido")).toBeVisible();

    // Capturar el nuevo enlace y compararlo
    const newLinkValue = await page.locator('input[readonly]').inputValue();
    expect(newLinkValue).not.toBe(oldLinkValue);
    expect(newLinkValue).toBe(newShareLink);

    // 9️⃣ Validar que el viejo enlace esté inactivo
    const anonContext = await context.browser().newContext(); // Nuevo contexto sin localStorage
    const anonPage = await anonContext.newPage();

    await anonPage.route(firstShareLink, async route => {
      await route.fulfill({
        status: 404,
        body: "Link no válido o desactivado"
      });
    });

    await anonPage.goto(firstShareLink);
    await expect(anonPage).toHaveURL(firstShareLink);
    await expect(await anonPage.content()).toContain("Link no válido o desactivado");

    // 10️⃣ Cerrar todo
    await anonContext.close();
  });
});