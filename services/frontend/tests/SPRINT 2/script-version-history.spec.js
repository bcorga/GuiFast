// services/frontend/tests/SPRINT 3/script-version-history.spec.js
import { test, expect } from "@playwright/test";

const TEXTAREA_EDITOR = 'textarea[placeholder="Escribe tu prompt o edita el contenido generado..."]';

test.describe("CP-18.01: Registro de versión (Historial de guion)", () => {
  test("Debe registrar dos versiones nuevas con fecha y hora correctas tras dos ediciones", async ({ page }) => {
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL("**/dashboard");

    // 3️⃣ Seleccionar el primer guion y editarlo
    const primerGuion = page.locator("div.bg-white.border.rounded-lg.p-4.shadow").first();
    const tituloOriginal = await primerGuion.locator("h3").textContent();
    console.log("📝 Guion original:", tituloOriginal);

    // ---- Primera edición ----
    await primerGuion.locator('button:has-text("Editar")').click();
    const nuevoContenido = 'Primera edición automática realizada por Playwright.';
    await page.fill(TEXTAREA_EDITOR, nuevoContenido);
    await page.click('button:has-text("Guardar")');

    // Confirmar mensaje o éxito de guardado
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Guion actualizado correctamente.');
      await dialog.dismiss();
    });


    // Regresar a Mis Guiones
    await page.click('text=Mis Guiones');

    // ---- Segunda edición ----
    await primerGuion.locator('button:has-text("Editar")').click();
    const segundoContenido = 'Segunda edición automática realizada por Playwright.';
    await page.fill(TEXTAREA_EDITOR, segundoContenido);
    await page.click('button:has-text("Guardar")');



    // Regresar a Mis Guiones
    await page.click('text=Mis Guiones');

    // 4️⃣ Abrir historial del primer guion
    await primerGuion.locator('button:has-text("Ver Historial")').click();

const historial = page.locator('ul > li');
    await expect(historial.first()).toBeVisible();

    const totalEntradas = await historial.count();
    console.log(`📄 Total de versiones en historial: ${totalEntradas}`);
    expect(totalEntradas).toBeGreaterThanOrEqual(2);

    // 4️⃣ Extraer solo los textos del <pre> (contenido del guion)
    const versiones = await page.locator('ul li pre').allTextContents();
    console.log('🧾 Últimas versiones detectadas:', versiones.slice(0, 3));

    // ✅ Verificar que las dos ediciones automáticas existan
    const tienePrimera = versiones.some(t => t.includes('Primera edición automática realizada por Playwright.'));
    const tieneSegunda = versiones.some(t => t.includes('Segunda edición automática realizada por Playwright.'));
    expect(tienePrimera).toBeTruthy();
    expect(tieneSegunda).toBeTruthy();

    // 5️⃣ Validar formato de fecha (dd/mm/yyyy, hh:mm:ss AM/PM)
    const fechas = await page.locator('ul li span.text-gray-500').allTextContents();
    const formatoFecha = /^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2}(?: [AP]M)?$/;

    for (const fecha of fechas.slice(0, 2)) {
      expect(fecha.trim()).toMatch(formatoFecha);
      console.log(`🕒 Fecha válida detectada: ${fecha}`);
    }

    console.log('✅ Se confirmaron las dos versiones nuevas en el historial con fecha válida.');
  });
});