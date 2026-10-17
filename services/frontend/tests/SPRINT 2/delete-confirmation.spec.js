// ✅ CP-13.01 - Confirmación antes de eliminar un guion
import { test, expect } from "@playwright/test";

test.describe("CP-13.01: Confirmación antes de eliminar", () => {
  test("Debe mostrar el modal '¿Seguro?' al intentar eliminar un guion", async ({ page }) => {
    // 1️⃣ Navegar al login
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Iniciar sesión con el usuario de prueba
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 3️⃣ Esperar redirección al dashboard
    await page.waitForURL("**/dashboard");

    // 4️⃣ Ir a "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');
    await expect(page.locator("h1")).toHaveText("Mis Guiones");

    // 5️⃣ Esperar que haya al menos un guion disponible
    const guionItem = page.locator("div.bg-white.border.rounded-lg").first();
    await expect(guionItem).toBeVisible();

    // 6️⃣ Preparar interceptación del confirm() para capturar el mensaje
    let confirmMessage = null;
    page.on("dialog", async (dialog) => {
      confirmMessage = dialog.message();
      await dialog.dismiss(); // No eliminar realmente
    });

    // 7️⃣ Hacer clic en el botón "Eliminar"
    await guionItem.locator('button:has-text("Eliminar")').click();

    // 8️⃣ Validar que el mensaje del confirm es correcto
    await expect
      .poll(() => confirmMessage, { timeout: 5000 })
      .toBe("¿Seguro?");
  });
});
