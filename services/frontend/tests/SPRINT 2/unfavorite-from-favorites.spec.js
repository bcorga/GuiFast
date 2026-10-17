// 📘 CP-15.02 - Desmarcar desde la vista "favoritos"
// Objetivo: Verificar que al quitar el estado de favorito en la vista de "favoritos",
// el guion desaparece inmediatamente de la lista.

import { test, expect } from "@playwright/test";

test.describe("CP-15.02: Desmarcar desde la vista 'favoritos'", () => {

  test("Debe eliminar el guion de la vista favoritos al desmarcarlo", async ({ page }) => {
    // 1️⃣ Iniciar sesión con el usuario de prueba
    await page.goto("http://localhost:3000/login");
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 2️⃣ Esperar a que cargue el dashboard
    await page.waitForSelector('text=Mis Guiones', { timeout: 10000 });

    // 3️⃣ Ir a la vista "Favoritos"
    await page.click('button:has-text("Favoritos")');
    await expect(page.getByRole("heading", { name: "Favoritos" })).toBeVisible();

    // 4️⃣ Verificar que exista al menos un guion marcado como favorito
    const favoritos = await page.locator('button:has-text("★ Favorito")').count();
    expect(favoritos).toBeGreaterThan(0);

    // 5️⃣ Obtener el título del primer guion favorito
    const tituloGuion = await page.locator("h3.font-bold").first().innerText();

    // 6️⃣ Hacer clic en el botón para quitar de favoritos
    await page.locator('button:has-text("★ Favorito")').first().click();

    // 7️⃣ Esperar a que desaparezca de la lista (debe actualizarse dinámicamente)
    await expect(page.getByRole("heading", { name: tituloGuion })).not.toBeVisible({ timeout: 2000 });

    // 8️⃣ Validar que ya no hay ningún botón “★ Favorito” visible si era el único
    const favoritosRestantes = await page.locator('button:has-text("★ Favorito")').count();
    expect(favoritosRestantes).toBeLessThan(favoritos);
  });
});