// 📁 services/frontend/tests/SPRINT 2/unmark-favorite.spec.js
import { test, expect } from "@playwright/test";

test.describe("CP-14.03: Quitar de favorito", () => {
  test("Debe revertir el estado de favorito al hacer clic en '★ Favorito'", async ({ page }) => {
    // 1️⃣ Ir al login
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Iniciar sesión con el usuario de pruebas
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 3️⃣ Esperar la vista principal
    await page.waitForSelector('text=Mis Guiones', { timeout: 10000 });

    // 4️⃣ Ir a la vista "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');

    // 5️⃣ Esperar que cargue al menos un guion
    const guionCard = page.locator("div.bg-white.border.rounded-lg").first();
    await expect(guionCard).toBeVisible();

    // 6️⃣ Si el guion no está marcado como favorito, marcarlo primero
    const botonFavorito = guionCard.locator('button:has-text("☆ Añadir a Favoritos")');
    if (await botonFavorito.isVisible()) {
      await botonFavorito.click();
      await expect(guionCard.locator('button:has-text("★ Favorito")')).toBeVisible();
    }

    // 7️⃣ Ahora hacer clic en el botón "★ Favorito" para desmarcarlo
    const botonQuitarFavorito = guionCard.locator('button:has-text("★ Favorito")');
    await botonQuitarFavorito.click();

    // 8️⃣ Validar que el ícono vuelve al estado original
    await expect(guionCard.locator('button:has-text("☆ Añadir a Favoritos")')).toBeVisible();

    // 9️⃣ Recargar la página
    await page.reload();

    // 🔟 Ir nuevamente a "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');

    // 1️⃣1️⃣ Confirmar que el estado se mantuvo desmarcado
    const botonEstadoFinal = page.locator('button:has-text("☆ Añadir a Favoritos")').first();
    await expect(botonEstadoFinal).toBeVisible();
  });
});
