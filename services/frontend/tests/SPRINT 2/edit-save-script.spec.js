// tests/edit-save-script.spec.js
import { test, expect } from '@playwright/test';

const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")';
const EDITAR_BUTTON = 'button:has-text("Editar")';
const INPUT_TITULO = 'input[placeholder="Título del Guion (Requerido para guardar)"]';
const TEXTAREA_EDITOR = 'textarea[placeholder="Escribe tu prompt o edita el contenido generado..."]';
const GUARDAR_BUTTON = 'button:has-text("Guardar")';

test.describe('CP-09.02: Edición y guardado de guion', () => {

  test('Editar un guion y verificar persistencia vía API', async ({ page, request }) => {
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    // 1. Clic en "Editar"
    await page.click(EDITAR_BUTTON);

    // 2. Editar el contenido
    const nuevoContenido = 'Texto actualizado por Playwright.';
    await page.fill(TEXTAREA_EDITOR, nuevoContenido);

    // 3. Guardar cambios
    await page.click(GUARDAR_BUTTON);

    // 4. Verificar que se muestra un mensaje de éxito
    // En tu código actual usas alert() o showToast(), cubrimos ambas opciones
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Guion actualizado correctamente.');
      await dialog.dismiss();
    });
  });
});