import { test, expect } from '@playwright/test';

// URL del endpoint usada por el dashboard
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts';

test.describe('CP-22.02: Filtro por estilo en "Mis Guiones"', () => {

  test('Aplica correctamente el filtro por estilo y mantiene orden cronológico', async ({ page }) => {

    // 1️⃣ Autenticación simulada y configuración inicial
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'mis-guiones');
    });

    // 2️⃣ Interceptar y simular respuesta API con varios estilos
    const scriptsMock = [
      { id: 1, title: "Guion Aventura Épica", content: "Una historia heroica...", estilo: "narrativo", createdAt: new Date('2025-10-20T10:00:00Z').toISOString() },
      { id: 2, title: "Comedia Urbana", content: "Un sketch divertido...", estilo: "comico", createdAt: new Date('2025-10-21T12:00:00Z').toISOString() },
      { id: 3, title: "Drama Familiar", content: "Relaciones intensas y emociones...", estilo: "narrativo", createdAt: new Date('2025-10-22T09:00:00Z').toISOString() },
      { id: 4, title: "Documental Marino", content: "Sobre la vida bajo el mar", estilo: "educativo", createdAt: new Date('2025-10-19T15:00:00Z').toISOString() },
    ];

    await page.route(API_SCRIPTS_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ scripts: scriptsMock }),
      });
    });

    // 3️⃣ Navegar al dashboard y esperar carga
    const navigationPromise = page.goto('http://localhost:3000/dashboard');
    await Promise.all([
      page.waitForResponse(API_SCRIPTS_URL),
      navigationPromise
    ]);

    // 4️⃣ Verificar encabezado de vista
    await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();

    // 5️⃣ Localizar el componente de filtro (dropdown o select)
    // 💡 CORRECCIÓN: Usamos .nth(0) ya que es el primer <select> visible.
    const filtroEstilo = page.locator('select').nth(0); 
    await expect(filtroEstilo).toBeVisible();

    // 6️⃣ Aplicar el filtro “narrativo”
    await filtroEstilo.selectOption('narrativo');

    // 7️⃣ Verificar que solo se muestren guiones con estilo "narrativo"
    const visibleTitles = page.locator('.grid > div h3');
    await expect(visibleTitles).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Guion Aventura Épica' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Drama Familiar' })).toBeVisible();

    // 8️⃣ Confirmar que los estilos filtrados sean correctos y ordenados por fecha (más reciente primero)
    const guionTitles = await visibleTitles.allTextContents();
    // Basado en las fechas mock: Drama Familiar (Oct 22) es más reciente que Guion Aventura Épica (Oct 20)
    expect(guionTitles).toEqual(['Drama Familiar', 'Guion Aventura Épica']);

    // 9️⃣ Limpiar el filtro (mostrar todos)
    await filtroEstilo.selectOption('todos'); 
    const allCards = page.locator('.grid > div');
    await expect(allCards).toHaveCount(4);

    console.log('✅ CP-22.02 completado: Filtro por estilo y orden cronológico verificados correctamente.');
  });
});