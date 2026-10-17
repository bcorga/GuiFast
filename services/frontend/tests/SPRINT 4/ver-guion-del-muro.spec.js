import { test, expect } from '@playwright/test';

const API_MURO_URL = 'http://localhost:5000/api/muro';
const API_DETALLE_URL = 'http://localhost:5000/api/muro/1';

test.describe('CP-30.04 - Ver guion del muro', () => {

  test('El usuario Premium visualiza el contenido completo de un guion al seleccionarlo', async ({ page }) => {

    // 1️⃣ Estado inicial de sesión
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-premium-token');
      localStorage.setItem('rol', 'Premium');
    });

    // 2️⃣ Mock de la lista del muro
    await page.route(API_MURO_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scripts: [
            { id: 1, title: 'Guion Épico del Muro', resumen: 'Una historia heroica...' },
            { id: 2, title: 'Guion Cómico', resumen: 'Un sketch divertido...' }
          ]
        })
      });
    });

    // 3️⃣ Navegar al muro
    await Promise.all([
      page.goto('http://localhost:3000/muro'),
      page.waitForResponse(API_MURO_URL)
    ]);

    // 4️⃣ Verificar que se cargue el muro
    await expect(page.getByRole('heading', { name: 'Muro de Guiones' })).toBeVisible();
    await expect(page.getByText('Guion Épico del Muro')).toBeVisible();
    await expect(page.getByText('Guion Cómico')).toBeVisible();

    // 5️⃣ Interceptar la llamada para obtener detalle del guion seleccionado
    await page.route(API_DETALLE_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Guion Épico del Muro',
          content: 'Este es el contenido completo del guion épico.',
          autor: 'test.user@playwright.com',
          fecha: new Date().toISOString()
        })
      });
    });

    // 6️⃣ Simular clic en el guion para abrir su vista completa
    const guionCard = page.locator('text=Guion Épico del Muro').first();
    await guionCard.click();

    // 7️⃣ Esperar la carga del detalle
    await page.waitForResponse(API_DETALLE_URL);

    // 8️⃣ Validar la vista de detalle
    await expect(page.getByRole('heading', { name: 'Guion Épico del Muro' })).toBeVisible();
    await expect(page.getByText('Este es el contenido completo del guion épico.')).toBeVisible();
    await expect(page.getByText('test.user@playwright.com')).toBeVisible();

    // 9️⃣ Verificar que no haya errores ni loaders
    await expect(page.locator('.loading-indicator')).toHaveCount(0);
  });
});