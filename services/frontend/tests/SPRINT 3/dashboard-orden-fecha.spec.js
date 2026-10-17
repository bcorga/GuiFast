import { test, expect } from '@playwright/test';

// Endpoint del backend, usado por Dashboard
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts';

test.describe('CP-22.03: Orden por fecha en "Mis Guiones"', () => {

  test('Cambia el orden de los guiones al alternar entre "Más recientes" y "Más antiguos"', async ({ page }) => {

    // 1️⃣ Simulación de entorno y autenticación
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'mis-guiones');
    });

    // 2️⃣ Interceptar la llamada al backend y devolver guiones simulados con distintas fechas
    const scriptsMock = [
      { id: 1, title: 'Guion A', content: 'Contenido A', estilo: 'comico', createdAt: '2025-10-31T10:00:00Z' },
      { id: 2, title: 'Guion B', content: 'Contenido B', estilo: 'narrativo', createdAt: '2025-11-01T09:00:00Z' },
      { id: 3, title: 'Guion C', content: 'Contenido C', estilo: 'educativo', createdAt: '2025-11-01T12:00:00Z' },
    ];

    await page.route(API_SCRIPTS_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ scripts: scriptsMock }),
      });
    });

    // 3️⃣ Navegar al Dashboard
    const navigationPromise = page.goto('http://localhost:3000/dashboard');
    await Promise.all([
      page.waitForResponse(API_SCRIPTS_URL),
      navigationPromise,
    ]);

    // 4️⃣ Confirmar que la vista "Mis Guiones" está cargada
    await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();

    // 5️⃣ Verificar orden inicial (por defecto: "Más recientes" → orden descendente)
    const guionesIniciales = page.locator('.grid > div h3');
    const textosIniciales = await guionesIniciales.allTextContents();
    console.log('Orden inicial:', textosIniciales);

    // Esperamos que el orden inicial sea: Guion C → Guion B → Guion A
    expect(textosIniciales).toEqual(['Guion C', 'Guion B', 'Guion A']);

    // 6️⃣ Cambiar el select de orden a "Más antiguos"
    const ordenSelect = page.locator('select', { hasText: 'Más recientes' });
    await ordenSelect.selectOption('asc');

    // 7️⃣ Verificar que el orden cambia correctamente
    const guionesReordenados = page.locator('.grid > div h3');
    const textosReordenados = await guionesReordenados.allTextContents();
    console.log('Orden después del cambio:', textosReordenados);

    // Orden esperado ascendente: Guion A → Guion B → Guion C
    expect(textosReordenados).toEqual(['Guion A', 'Guion B', 'Guion C']);

    console.log('✅ CP-22.03 completado: Ordenación por fecha verificada correctamente.');
  });
});