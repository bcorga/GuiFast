// tests/export-doc.spec.js
import { test, expect } from '@playwright/test';
import fs from 'fs';

const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")';
const DOC_BUTTON = 'button:has-text("DOC")';

test.describe('CP-10.01: Exportación a DOC', () => {

  test('Generar y validar exportación en DOC', async ({ page }) => {
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    // 1. Esperar evento de descarga
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(DOC_BUTTON) // disparar descarga
    ]);

    // 2. Guardar archivo en una ruta temporal
    const downloadPath = await download.path();
    const savePath = 'downloads/test-export.doc';
    await download.saveAs(savePath);

    // 3. Validar que el archivo existe
    expect(fs.existsSync(savePath)).toBeTruthy();

    // 4. Validar cabecera de archivo DOC (%DOC-)
    const fileBuffer = fs.readFileSync(savePath);
    const fileHeader = fileBuffer.slice(0, 5).toString();
    expect(fileHeader).toBe('%DOC-');

    // Opcional: validar que el nombre incluye el título del guion
    //const suggestedName = download.suggestedFilename();
    //expect(suggestedName).toContain('Guion_para_Exportar');
  });
});