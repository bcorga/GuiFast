// tests/save-script-with-session.spec.js
import { test, expect } from "@playwright/test";

test.describe("CP-11.01: Guardar Guion con sesión", () => {

  test("Debe asociar el guion al usuario autenticado y mostrarlo en 'Mis Guiones'", async ({ page }) => {
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    // 1️⃣ Navegar al formulario de guiones
    await page.getByText("Nuevo Guion").click().catch(() => {});
    await expect(page.getByText(/Generador y Editor de Guiones|Editar:/)).toBeVisible();

    // 2️⃣ Completar campos obligatorios
    await page.fill('input[placeholder*="Título del Guion"]', "Guion de prueba E2E");
    await page.fill("textarea", "Contenido generado automáticamente");

    // 3️⃣ Capturar el alert
    const alertMessage = new Promise(resolve => {
      page.on("dialog", async dialog => {
        resolve(dialog.message());
        await dialog.accept();
      });
    });

    // 4️⃣ Guardar
    await page.click('button:has-text("Guardar")');

    // 5️⃣ Verificar alert de éxito
    const msg = await alertMessage;
    expect(msg).toContain("Guion guardado correctamente.");

    // 6️⃣ Esperar que el formulario vuelva a renderizarse limpio
    const inputTitulo = page.locator('input[placeholder*="Título del Guion"]');
    await inputTitulo.waitFor({ state: "visible", timeout: 10000 });
    await expect(inputTitulo).toHaveValue("", { timeout: 10000 });

    const textArea = page.locator("textarea");
    await textArea.waitFor({ state: "visible", timeout: 10000 });
    await expect(textArea).toHaveValue("", { timeout: 10000 });

    // 7️⃣ Simular clic en "Mis Guiones"
    await page.getByText("Mis Guiones").click();

    // 8️⃣ Validar que el nuevo guion aparece en la lista
    await expect(page.getByText("Guion de prueba E2E")).toBeVisible();
  });
});