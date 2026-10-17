import { test, expect } from '@playwright/test';

const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts';
const API_SHARE_URL = 'http://localhost:5000/api/scripts/share/';
const SHARE_PAGE_URL = 'http://localhost:3000/shared/2f9d31a3-1727-4440-bb02-0915352fc664';

test.describe('CP-28.02 - Acceso público solo lectura', () => {
  test('El enlace compartido abre una vista pública sin opciones de edición o login', async ({ browser, page }) => {

    // 1️⃣ Configurar estado inicial del usuario autenticado
    await page.addInitScript(() => {
      localStorage.setItem('userEmail', 'test.user@playwright.com');
      localStorage.setItem('jwt', 'fake-jwt-token');
      localStorage.setItem('currentView', 'mis-guiones');
    });

    // 2️⃣ Interceptar la API principal para listar guiones
    await page.route(API_SCRIPTS_URL, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          scripts: [
            { id: 1, title: "Guion Compartible", content: "Texto de ejemplo para compartir.", estilo: "narrativo" }
          ]
        }),
      });
    });

    // 3️⃣ Navegar al dashboard del usuario
    await Promise.all([
      page.goto('http://localhost:3000/dashboard'),
      page.waitForResponse(API_SCRIPTS_URL)
    ]);

    await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();
    await expect(page.getByText('Guion Compartible')).toBeVisible();

    // 4️⃣ Interceptar la creación del enlace de compartición
    const expectedShareLink = SHARE_PAGE_URL;
    await page.route('**/api/scripts/*/share', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ link: expectedShareLink })
      });
    });

    // 5️⃣ Simular clic en el botón "Compartir" del guion
    const compartirBtn = page.locator('button:has-text("Compartir")').first();
    await compartirBtn.click();

    // Esperar el modal de enlace compartido
    const modal = page.locator('text=Guion compartido');
    await expect(modal).toBeVisible();

    // 6️⃣ Capturar el enlace del input
    const inputLink = page.locator('input[readonly]');
    const enlace = await inputLink.inputValue();
    expect(enlace).toBe(expectedShareLink);

    // 7️⃣ Abrir nueva instancia del navegador en modo anónimo
    const anonContext = await browser.newContext();
    const anonPage = await anonContext.newPage();

    // 7.1 Interceptar el contenido público del guion compartido
    const API_SHARED_CONTENT_URL = 'http://localhost:3000/shared/2f9d31a3-1727-4440-bb02-0915352fc664'; // URL de intercepción
    const mockSharedContent = {
        title: "Guion Compartible",
        content: "Texto de ejemplo para compartir.",
        estilo: "narrativo"
    };

    // 7.2 Crear la promesa de espera ANTES de navegar
    const sharedApiPromise = anonPage.waitForResponse(response => 
        response.url().includes(API_SHARED_CONTENT_URL.slice(0, -1)) && response.status() === 200
    );

    await anonPage.route(API_SHARED_CONTENT_URL, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockSharedContent)
        });
    });

    // 8️⃣ Navegar a la URL compartida Y ESPERAR la respuesta del contenido
    // Esto asegura que el frontend tiene los datos para renderizar antes de la aserción.
    await Promise.all([
        anonPage.goto(enlace), // 8.1 Inicia la navegación (y el fetch de la API)
        sharedApiPromise       // 8.2 Espera a que el fetch de la API se complete
    ]);

    // 9️⃣ Verificar que el contenido se haya renderizado
    await expect(anonPage.getByText(mockSharedContent.title)).toBeVisible();
    await expect(anonPage.getByText(mockSharedContent.content)).toBeVisible();

    // 🔟 Verificar que NO existan botones de edición ni login
    const editarBtn = anonPage.locator('button:has-text("Editar")');
    const guardarBtn = anonPage.locator('button:has-text("Guardar")');
    const loginBtn = anonPage.locator('a:has-text("Acceder")'); // Usar 'a' si el login es un enlace

    // 11️⃣ Cerrar el contexto anónimo
    await anonContext.close();

    // 12️⃣ Cerrar modal original
    const cerrarBtn = page.getByRole('button', { name: 'Cerrar', exact: true });
    await cerrarBtn.click();
    await expect(modal).toBeHidden();
  });
});