import { test, expect } from '@playwright/test';

const DASHBOARD_URL = 'http://localhost:3000/dashboard';
const API_GENERATE_URL = 'http://localhost:8000/generate';

test.describe('CP-29.01 - Mostrar indicador al iniciar', () => {

  test('Debe mostrar el texto "Generando guion..." inmediatamente después de hacer clic en "Generar IA"', async ({ page }) => {

    // 1️⃣ Configurar estado simulado de usuario autenticado
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'nuevo'); // Abrir directamente la vista del generador
    });

    // 2️⃣ Interceptar la API de generación y retrasar la respuesta
    //    para asegurar que el estado "loading" se mantenga visible
    await page.route(API_GENERATE_URL, async route => {
      await new Promise(res => setTimeout(res, 2000)); // simula procesamiento del backend
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generated_text: "Guion generado correctamente por IA"
        })
      });
    });

    // 3️⃣ Ir al Dashboard
    await page.goto(DASHBOARD_URL);

    // 4️⃣ Llenar el título requerido antes de generar
    const titleInput = page.locator('input[placeholder="Título del Guion (Requerido para guardar)"]');
    await titleInput.fill('Guion de prueba IA');

    // 5️⃣ Clic en el botón "Generar IA"
    const generarBtn = page.getByRole('button', { name: 'Generar IA' });
    await generarBtn.click();

    // 6️⃣ Verificar de inmediato que aparezca el indicador de carga
    await expect(page.getByText('Generando guion...')).toBeVisible();

    // 7️⃣ Esperar que termine el proceso y el indicador desaparezca
    await expect(page.getByText('Generando guion...')).toBeHidden({ timeout: 4000 });

    // 8️⃣ Verificar que el texto generado se muestre en el editor
    const editor = page.locator('textarea');
    await expect(editor).toHaveValue(/Guion generado correctamente por IA/);
  });
});