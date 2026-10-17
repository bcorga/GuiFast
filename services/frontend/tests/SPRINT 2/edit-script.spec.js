// tests/edit-script.spec.js
import { test, expect } from '@playwright/test';

// --- Selectores reutilizables ---
const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")';
const EDITAR_BUTTON = 'button:has-text("Editar")';
const NUEVO_EDITOR_TITLE = 'h1:has-text("Editar:")';
const INPUT_TITULO = 'input[placeholder="Título del Guion (Requerido para guardar)"]';
const TEXTAREA_EDITOR = 'textarea[placeholder="Escribe tu prompt o edita el contenido generado..."]';

test.describe('CP-09.01: Edición de un guion desde "Mis Guiones"', () => {
  test('Al hacer clic en "Editar" se abre el editor con datos precargados', async ({ page }) => {
    
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    // 1. Verificar que estamos en la vista "Mis Guiones"
    await expect(page.locator(MIS_GUIONES_TITLE)).toBeVisible();

    // 2. Esperar a que aparezca el guion de prueba
    await expect(page.getByText('Guion de prueba')).toBeVisible();

    // 3. Hacer clic en el botón "Editar"
    await page.click(EDITAR_BUTTON);

    // 4. Verificar que el editor se abre (view = "nuevo")
    await expect(page.locator(NUEVO_EDITOR_TITLE)).toBeVisible();

    // 5. Validar que el campo título tiene el valor cargado
    const tituloValue = await page.locator(INPUT_TITULO).inputValue();
    expect(tituloValue).toBe('Guion de prueba');

    // 6. Validar que el textarea contiene el contenido cargado
    const contenidoValue = await page.locator(TEXTAREA_EDITOR).inputValue();
    expect(contenidoValue).toBe('Contenido generado automáticamente');
  });
});