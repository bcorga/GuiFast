// CP-14.02: Persistencia de favorito
import { test, expect } from "@playwright/test";

test.describe("CP-14.02: Persistencia de favorito", () => {
  test("Debe mantener el estado de favorito tras recargar la página", async ({ page }) => {

    // 1️⃣ Ir al login e ingresar credenciales
    await page.goto("http://localhost:3000/login");
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 2️⃣ Esperar la carga del dashboard y navegar a "Mis Guiones"
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Mis Guiones")');

    // 3️⃣ Asegurarse de que haya guiones visibles
    const guionCard = page.locator(".bg-white.border.rounded-lg").first();
    await expect(guionCard).toBeVisible();

    // 4️⃣ Si el primer guion no es favorito, marcarlo
    const favButton = guionCard.getByRole("button", { name: "☆ Añadir a Favoritos" });
    if (await favButton.isVisible()) {
      await favButton.click();
      await expect(guionCard.getByRole("button", { name: "★ Favorito" })).toBeVisible();
    }

    // 5️⃣ Recargar la página
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 6️⃣ Volver a “Mis Guiones” (si no está ya en la vista)
    if (await page.getByRole("button", { name: "Mis Guiones" }).isVisible()) {
      await page.click('button:has-text("Mis Guiones")');
    }

    // 7️⃣ Verificar que el guion sigue marcado como favorito tras recargar
    const favButtonAfterReload = guionCard.getByRole("button", { name: "★ Favorito" });
    await expect(favButtonAfterReload).toBeVisible();

    // 8️⃣ (Opcional) Desmarcar al final para mantener el entorno limpio
    await favButtonAfterReload.click();
    await expect(guionCard.getByRole("button", { name: "☆ Añadir a Favoritos" })).toBeVisible();
  });
});
