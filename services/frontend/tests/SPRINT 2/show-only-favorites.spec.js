import { test, expect } from "@playwright/test";

test.describe("CP-15.01: Mostrar solo favoritos", () => {
  test("Debe mostrar únicamente los guiones marcados como favoritos", async ({ page }) => {
    // 1️⃣ Ir al login
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Iniciar sesión
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // Esperar la redirección al dashboard
    await page.waitForURL("**/dashboard");
    await expect(page).toHaveURL(/.*dashboard/);

    // 3️⃣ Ir a “Mis Guiones” y marcar un guion como favorito (si no lo está)
    await page.click('button:has-text("Mis Guiones")');
    await page.waitForSelector("h3.font-bold");

    const favoriteButton = page.locator('button:has-text("☆ Añadir a Favoritos")').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await page.waitForTimeout(1000); // esperar actualización visual
    }

    // 4️⃣ Navegar a la vista de “Favoritos”
    await page.click('button:has-text("Favoritos")');
    await page.waitForSelector("h1:has-text('Favoritos')");

    // 5️⃣ Verificar que solo se muestren guiones favoritos
    const allFavoriteButtons = page.locator('button:has-text("★ Favorito")');
    const countFavorites = await allFavoriteButtons.count();

    expect(countFavorites).toBeGreaterThan(0); // debe haber al menos uno

    // Validar que no aparezcan guiones con “☆ Añadir a Favoritos”
    const nonFavoriteButtons = page.locator('button:has-text("☆ Añadir a Favoritos")');
    await expect(nonFavoriteButtons).toHaveCount(0);

    // 6️⃣ Validar que los títulos de guiones visibles sean consistentes
    const titles = await page.locator("h3.font-bold").allInnerTexts();
    console.log("✅ Guiones mostrados en vista Favoritos:", titles);

    expect(titles.length).toBe(countFavorites);

    // 7️⃣ Captura final (para debug o evidencia)
    await page.screenshot({ path: "test-results/show-only-favorites.png", fullPage: true });
  });
});