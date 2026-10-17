import { test, expect } from "@playwright/test";

test.describe("CP-16.01: Update sin duplicar", () => {
  test("Debe actualizar el guion existente sin crear un duplicado en 'Mis Guiones'", async ({ page }) => {
    // 1️⃣ Ir al login e ingresar con el usuario de prueba
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    // 2️⃣ Esperar redirección al dashboard
    await page.waitForURL("**/dashboard");
    //await expect(page.getByText("Mis Guiones")).toBeVisible();

    // 3️⃣ Ir a la vista Mis Guiones
    //await page.click('button:has-text("Mis Guiones")');
    //await expect(page.getByText("Mis Guiones")).toBeVisible();

    // 4️⃣ Contar la cantidad actual de guiones visibles
    const guionesAntes = await page.locator("div.bg-white.border.rounded-lg").count();
    expect(guionesAntes).toBeGreaterThan(0);

    // 5️⃣ Seleccionar el primer guion y presionar “Editar”
    const primerGuion = page.locator("div.bg-white.border.rounded-lg").first();
    const tituloOriginal = await primerGuion.locator("h3").textContent();
    await primerGuion.getByRole("button", { name: "Editar" }).click();

    // 6️⃣ Editar el título del guion
    await page.waitForSelector('input[placeholder*="Título del Guion"]');
    await page.fill('input[placeholder*="Título del Guion"]', `${tituloOriginal} (Editado)`);
    await page.click('button:has-text("Guardar")');

    // 7️⃣ Confirmar alerta de actualización
    page.once("dialog", (dialog) => dialog.accept());
    await page.waitForTimeout(1000); // permitir que se actualicen los datos

    // 8️⃣ Volver manualmente a "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');
    //await expect(page.getByText("Mis Guiones")).toBeVisible();

    // 9️⃣ Validar que la cantidad total de guiones siga igual
    const guionesDespues = await page.locator("div.bg-white.border.rounded-lg").count();
    expect(guionesDespues).toBe(guionesAntes);

    // 🔟 Obtener todos los títulos actuales
    const titulos = await page.locator("div.bg-white.border.rounded-lg h3").allTextContents();

    // ✅ Verificar que el nuevo título aparece
    expect(titulos).toContain(`${tituloOriginal} (Editado)`);

    // ✅ Verificar que el título original exacto ya no aparece (sin el sufijo)
    const existeOriginal = titulos.some(t => t.trim() === tituloOriginal);
    expect(existeOriginal).toBeFalsy();
  });
});