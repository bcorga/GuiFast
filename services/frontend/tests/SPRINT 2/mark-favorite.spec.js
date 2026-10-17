// 📄 CP-14.01 - Marcar favorito
import { test, expect } from "@playwright/test";

test.describe("CP-14.01: Marcar favorito", () => {
  test("Debe cambiar el estado del guion a favorito y reflejar el cambio visualmente", async ({ page }) => {
    // 1️⃣ Acceder al login
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Autenticarse con usuario de prueba
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 3️⃣ Esperar redirección al Dashboard
    await page.waitForURL("**/dashboard");

    // 4️⃣ Ir a “Mis Guiones”
    await page.getByRole("button", { name: "Mis Guiones" }).click();
    await page.waitForSelector("h1:text('Mis Guiones')");

    // 5️⃣ Esperar que haya al menos un guion visible
    const scriptCard = page.locator(".bg-white.border.rounded-lg").first();
    await expect(scriptCard).toBeVisible();

    // 6️⃣ Localizar botón de favoritos dentro del primer guion
    const favButton = scriptCard.getByRole("button", { name: "☆ Añadir a Favoritos" });
    await expect(favButton).toBeVisible();

    // 7️⃣ Click para marcar como favorito
    await favButton.click();

    // 8️⃣ Verificar que el botón cambia de texto y estilo visual
    const favActiveButton = scriptCard.getByRole("button", { name: "★ Favorito" });
    await expect(favActiveButton).toBeVisible();

    // 9️⃣ Recargar o volver a “Mis Guiones” para validar persistencia
    await page.reload();
    await page.getByRole("button", { name: "Mis Guiones" }).click();
    await page.waitForSelector("h1:text('Mis Guiones')");

    // 🔟 Confirmar que sigue marcado como favorito después del refresco
    const favPersistedButton = page.locator(".bg-white.border.rounded-lg").first()
      .getByRole("button", { name: "★ Favorito" });
    await expect(favPersistedButton).toBeVisible();
  });
});