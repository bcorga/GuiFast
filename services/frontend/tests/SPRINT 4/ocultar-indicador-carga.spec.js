import { test, expect } from '@playwright/test';

const API_GENERAR_URL = 'http://localhost:5000/api/generate';

test.describe('CP-29.02 - Ocultar al completar', () => {

  test('El indicador de carga se oculta tras completarse la generación del guion', async ({ page }) => {

    // 1️⃣ Simular sesión del usuario autenticado
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'dashboard');
    });

    // 2️⃣ Interceptar la llamada al backend de generación IA
    await page.route(API_GENERAR_URL, async route => {
      // Simulamos retardo de 2 segundos para observar el indicador
      await new Promise(r => setTimeout(r, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: 'Guion generado con éxito por IA: Una historia inspiradora.'
        })
      });
    });

    // 3️⃣ Ir al Dashboard
    await page.goto('http://localhost:3000/dashboard');

    // 4️⃣ Llenar el título requerido antes de generar
    const titleInput = page.locator('input[placeholder="Título del Guion (Requerido para guardar)"]');
    await titleInput.fill('Guion de prueba IA');

    // 5️⃣ Clic en el botón "Generar IA"
    const generarBtn = page.getByRole('button', { name: 'Generar IA' });

    // 5️⃣ Simular clic en el botón para iniciar la generación
    await generarBtn.click();

    // 6️⃣ Verificar que el indicador de carga aparece inmediatamente
    const indicadorCarga = page.locator('text=Generando guion...');
    await expect(indicadorCarga).toBeVisible();

    // 7️⃣ Esperar a que la llamada al backend finalice
    await page.waitForResponse(API_GENERAR_URL);

    // 8️⃣ Confirmar que el indicador se haya ocultado al terminar
    await expect(indicadorCarga).toBeHidden();

    // 9️⃣ Verificar que el resultado final esté visible
    await expect(page.getByText('Guion generado con éxito por IA')).toBeVisible();
  });
});