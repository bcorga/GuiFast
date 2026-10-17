// tests/export-txt-error.spec.js
import { test, expect } from '@playwright/test';

const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")';
const TXT_BUTTON = 'button:has-text("TXT")';

test.describe('CP-10.04: Manejo de error en exportación TXT', () => {

  test('Debe mostrar alerta de error al fallar la exportación TXT', async ({ page }) => {
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    // 1️⃣ Instalar listener ANTES del fallo para evitar bloqueo
    const dialogPromise = new Promise(resolve => {
      page.on('dialog', async dialog => {
        resolve(dialog.message());
        await dialog.dismiss(); // cerrar inmediatamente
      });
    });

    // 2️⃣ Inyectar fallo del Blob (después del render)
    await page.evaluate(() => {
      window.Blob = function() {
        throw new Error('Fallo simulado al crear Blob');
      };
    });

    // 3️⃣ Ejecutar clic en el botón TXT
    await page.click(TXT_BUTTON);

    // 4️⃣ Esperar y validar mensaje de error
    const msg = await dialogPromise;
    expect(msg.toLowerCase()).toContain('error al generar el archivo txt');
  });
});