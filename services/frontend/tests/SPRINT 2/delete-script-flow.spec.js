// ✅ CP-13.02 - Eliminación y actualización de guion (flujo completo)
import { test, expect } from "@playwright/test";

test.describe("CP-13.02: Eliminación y actualización del listado", () => {
  test("Debe confirmar la eliminación, mostrar mensaje de éxito y actualizar la lista", async ({ page, request }) => {
    // 1️⃣ Navegar al login
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Iniciar sesión con el usuario de prueba
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');
    
    await page.waitForURL("**/dashboard");

    // 3️⃣ Ir a la vista "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');
    await expect(page.locator("h1")).toHaveText("Mis Guiones");

    // 4️⃣ Esperar al menos un guion visible
    const guionItem = page.locator("div.bg-white.border.rounded-lg").first();
    await expect(guionItem).toBeVisible();

    // 5️⃣ Capturar el título del guion a eliminar
    const tituloGuion = await guionItem.locator("h3").innerText();

    // 6️⃣ Interceptar confirm() → Aceptar eliminación
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("¿Seguro?");
      await dialog.accept();
    });

    // 7️⃣ Clic en "Eliminar"
    await guionItem.locator('button:has-text("Eliminar")').click();

    // 8️⃣ Esperar el toast o alerta de éxito
    const successAlert = page.locator("text=Guion eliminado");
    await expect(successAlert).toBeVisible({ timeout: 10000 });

    // 9️⃣ Esperar que el guion desaparezca del DOM
    await expect(page.getByText(tituloGuion)).not.toBeVisible({ timeout: 10000 });

    // 🔟 Validar (opcional) que el guion ya no exista en la API del backend
    // Esto asume que el backend expone GET /api/scripts/:email
    const response = await request.get(
      `http://localhost:5000/api/scripts/${encodeURIComponent("pruebas@guifastest.com")}`
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const existe = data.scripts.some((s) => s.title === tituloGuion);
    expect(existe).toBeFalsy(); // Ya no debe existir en BD

    console.log(`✅ Guion "${tituloGuion}" eliminado correctamente.`);
  });
});