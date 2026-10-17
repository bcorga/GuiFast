import { test, expect } from '@playwright/test';

const API_PUBLISH_URL = 'http://localhost:5000/api/scripts/publish';
const API_FEED_URL = 'http://localhost:5000/api/scripts/feed';

test.describe('CP-30.03 - Publicar en muro', () => {
  test('El usuario Premium publica un guion y se refleja en el muro', async ({ page }) => {

    // 1️⃣ Simular entorno autenticado con usuario Premium
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('userRole', 'premium');
      localStorage.setItem('currentView', 'dashboard');
    });

    // 2️⃣ Mock inicial del muro con guiones previos
    const mockFeedBefore = {
      scripts: [
        { id: 1, title: "Guion Aventura", author: "autor1", content: "Explorando mundos...", createdAt: new Date().toISOString() },
        { id: 2, title: "Guion Comedia", author: "autor2", content: "Una historia divertida", createdAt: new Date().toISOString() }
      ]
    };

    // 3️⃣ Mock después de publicar (guion nuevo incluido)
    const mockFeedAfter = {
      scripts: [
        ...mockFeedBefore.scripts,
        { id: 3, title: "Guion Publicado", author: "test.user@playwright.com", content: "Nuevo contenido publicado.", createdAt: new Date().toISOString() }
      ]
    };

    // 4️⃣ Interceptar feed inicial
    await page.route(API_FEED_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFeedBefore)
      });
    });

    // 5️⃣ Navegar al Muro de Guiones
    await Promise.all([
      page.goto('http://localhost:3000/muro'),
      page.waitForResponse(API_FEED_URL)
    ]);

    await expect(page.getByRole('heading', { name: 'Muro de Guiones' })).toBeVisible();
    await expect(page.getByText('Guion Aventura')).toBeVisible();
    await expect(page.getByText('Guion Comedia')).toBeVisible();

    // 6️⃣ Interceptar la publicación del nuevo guion
    await page.route(API_PUBLISH_URL, route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 3 })
      });
    });

    // 7️⃣ Interceptar actualización del feed tras publicar
    await page.route(API_FEED_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFeedAfter)
      });
    });

    // 8️⃣ Simular clic en botón “Publicar” (por ejemplo dentro del dashboard)
    const publicarBtn = page.locator('button:has-text("Publicar")');
    await expect(publicarBtn).toBeVisible();
    await publicarBtn.click();

    // 9️⃣ Esperar el mensaje de confirmación
    await expect(page.getByText('Guion publicado exitosamente')).toBeVisible();

    // 🔟 Verificar que el nuevo guion aparece en el muro
    await expect(page.getByText('Guion Publicado')).toBeVisible();
    await expect(page.getByText('Nuevo contenido publicado.')).toBeVisible();

    console.log('✅ Guion publicado correctamente y visible en el muro.');

  });
});