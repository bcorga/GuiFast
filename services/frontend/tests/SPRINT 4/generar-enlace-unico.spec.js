import { test, expect } from '@playwright/test';

// 💡 URLs de la API
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts'; 
// 💡 URL asumida para generar el enlace de compartición
const API_SHARE_URL = 'http://localhost:5000/api/scripts/share/'; 

test.describe('CP-28.01 - Generar enlace único', () => {
 test('El usuario comparte un guion y visualiza el enlace y botón Copiar', async ({ page }) => {
  // ... (Pasos 1 a 3: Autenticación, Simulación de guiones iniciales, Navegación) ...

  // 1️⃣ Preparar entorno y autenticación simulada
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'mis-guiones');
    });

  // 2️⃣ Interceptar la llamada API y simular la respuesta con los guiones de prueba
    await page.route(API_SCRIPTS_URL, route => { 
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scripts: [
            { id: 1, title: "Guion Aventura Épica", content: "Una historia heroica...", estilo: "narrativo", createdAt: new Date().toISOString() },
            { id: 2, title: "Comedia Urbana", content: "Un sketch divertido...", estilo: "comico", createdAt: new Date().toISOString() },
            { id: 3, title: "Documental Marino", content: "Sobre la vida bajo el mar", estilo: "educativo", createdAt: new Date().toISOString() },
          ]
        }),
      });
    });

  // 3️⃣ Navegar al dashboard y esperar la respuesta de la API
      const navigationPromise = page.goto('http://localhost:3000/dashboard');
      await Promise.all([
        page.waitForResponse(API_SCRIPTS_URL),
        navigationPromise
      ]);
  
      // 4️⃣ Verificación de carga y elementos iniciales
      await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();
      const guionAventura = page.getByRole('heading', { name: 'Guion Aventura Épica' });
      await expect(guionAventura).toBeVisible(); 

  // 4.1 Localizar el primer botón "Compartir"
const compartirBtn = page.locator('button:has-text("Compartir")').first();
await expect(compartirBtn).toBeVisible();

// ----------------------------------------------------
// 🔑 CORRECCIÓN DEL ORDEN DE SINCRONIZACIÓN:
// 1. Definir el enlace esperado
const expectedShareLink = 'http://localhost:3000/share/fake-share-token-12345';
const API_SHARE_URL = 'http://localhost:5000/api/scripts/'; // Usar la URL base

// 2. Definir la intercepción de la respuesta (Simulación)
await page.route('**/api/scripts/*/share', route => {
    route.fulfill({
        status: 201, 
        contentType: 'application/json',
        // El dashboard.js espera 'data.link', así que usamos 'link'
        body: JSON.stringify({ link: expectedShareLink }),
    });
});

// 3. Crear la promesa de espera ANTES del clic.
// Esto garantiza que Playwright esté "escuchando" cuando se haga la llamada.
const shareApiPromise = page.waitForResponse(response => 
    // Usamos includes para capturar http://localhost:5000/api/scripts/{id}/share
    response.url().includes('api/scripts/') && 
    response.url().includes('/share') &&
    response.request().method() === 'POST'
);

// 4. Simular clic en "Compartir" (ESTO DISPARA el fetch en handleShare)
await compartirBtn.click();

// 5. Esperar la respuesta de la API de compartir.
// Si el fetch fue disparado por el clic, esta promesa se resolverá inmediatamente.
await shareApiPromise;

// ----------------------------------------------------

// 6️⃣ Esperar a que aparezca el modal con el enlace generado (Ya con la respuesta recibida)
const modal = page.locator('text=Guion compartido');
await expect(modal).toBeVisible();

  // 7️⃣ Capturar el enlace generado dentro del input y verificar que sea el simulado
  const inputLink = page.locator('input[readonly]');
  const enlace = await inputLink.inputValue();

  console.log('🔗 Enlace generado:', enlace);
  expect(enlace).toBe(expectedShareLink); // Verificamos que sea el que simulamos
  expect(enlace).toContain('http');

  // 8️⃣ Verificar la presencia del botón “Copiar”
const copiarBtn = page.locator('button', { hasText: 'Copiar' });
await expect(copiarBtn).toBeVisible();

// 🔑 CORRECCIÓN: Mockear el portapapeles antes de hacer clic
await page.evaluate(() => {
    // Sobreescribe navigator.clipboard.writeText para que siempre resuelva sin error.
    navigator.clipboard.writeText = async (text) => {
        console.log(`Portapapeles mockeado: ${text}`);
    };
});

// 9️⃣ Simular clic en “Copiar” y validar mensaje de confirmación
await copiarBtn.click(); 
// Este clic ahora llama a la función mockeada, que no genera el NotAllowedError.
await expect(page.locator('text=Enlace copiado al portapapeles')).toBeVisible();

// 🔟 Cerrar el modal
const cerrarBtn = page.getByRole('button', { name: 'Cerrar', exact: true });

await cerrarBtn.click();
await expect(modal).toBeHidden();
 });
});