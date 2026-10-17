// ✅ tests/e2e/cp-28.03-desactivar-enlace.spec.js
import { test, expect } from '@playwright/test';

// Constantes
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts';
const API_SHARE_URL = 'http://localhost:5000/api/scripts/share/';
const SHARE_TOKEN = '2f9d31a3-1727-4440-bb02-0915352fc664'; 
const SHARE_PAGE_URL = `http://localhost:3000/shared/${SHARE_TOKEN}`;
const API_SHARE_ENDPOINT = `**/api/scripts/1/share`; // Endpoint específico para el ID 1
const API_SHARED_CONTENT_URL = `**/shared/${SHARE_TOKEN}`; 

test.describe('CP-28.03 - Desactivar enlace', () => {
 test('El usuario desactiva un enlace compartido y este deja de ser accesible públicamente', async ({ browser, page }) => {

  // Estados del guion para el mock
  const scriptInitial = { id: 1, title: "Guion Desactivable", content: "Texto del guion a compartir.", estilo: "drama", isFavorite: false, isShared: false };
    const scriptShared = { ...scriptInitial, shareToken: SHARE_TOKEN, isShared: true };
    const scriptUnshared = { ...scriptInitial, shareToken: null, isShared: false };

  // 1️⃣ Configurar el entorno del usuario autenticado
  await page.addInitScript(() => {
   localStorage.setItem('userEmail', 'test.user@playwright.com');
   localStorage.setItem('jwt', 'fake-jwt-token');
   localStorage.setItem('currentView', 'mis-guiones');
  });

  // 2️⃣ Interceptar la API principal de guiones (Mock de lista inicial)
    // Usamos 'page.route' para la carga inicial (el guion NO está compartido)
  await page.route(API_SCRIPTS_URL, route => {
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ scripts: [scriptInitial] }),
   });
  }, { times: 1 }); // Solo para la primera carga

  // 3️⃣ Navegar al dashboard del usuario
  await Promise.all([
   page.goto('http://localhost:3000/dashboard'),
   page.waitForResponse(API_SCRIPTS_URL)
  ]);

  await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();
  await expect(page.getByText('Guion Desactivable')).toBeVisible();
    
  // --- COMPARTIR EL GUION (POST) ---

  // 4️⃣ Configurar la intercepción para la acción de compartir
  const expectedShareLink = SHARE_PAGE_URL;
  
    // 4.1 Mock para el POST de compartir, esperando la respuesta.
    const shareApiPromise = page.waitForResponse(response => 
        response.url().includes(API_SHARE_URL) && response.request().method() === 'POST'
    );
    await page.route(API_SHARE_ENDPOINT, route => {
        route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ link: expectedShareLink })
        });
    }, { times: 1 }); // Solo para la creación

    // 4.2 Mock para el refresh de la lista (GET /scripts) después de COMPARTIR
    const refreshSharedPromise = page.waitForResponse(response => 
        response.url().includes(API_SCRIPTS_URL) && response.request().method() === 'GET'
    );
    await page.route(API_SCRIPTS_URL, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ scripts: [scriptShared] }), // Guion ahora compartido
        });
    }, { times: 1 }); 

  // 5️⃣ Clic en "Compartir" y esperar las respuestas
  const compartirBtn = page.locator('button:has-text("Compartir")').first();
    await compartirBtn.click();
    
    // Esperar el modal y la actualización de la lista
  const modal = page.locator('text=Guion compartido');
  await Promise.all([
        expect(modal).toBeVisible(),
        shareApiPromise, // Esperamos el POST
        refreshSharedPromise, // Esperamos la actualización del estado del guion
    ]);

  // Verificar el enlace en el modal
  const inputLink = page.locator('input[readonly]');
  const enlace = await inputLink.inputValue();
  expect(enlace).toBe(expectedShareLink);
    
  // --- ACCESO PÚBLICO INICIAL (Verificar que funciona) ---

  // 6️⃣ Simular contexto de un usuario anónimo
  const anonContext = await browser.newContext();
  const anonPage = await anonContext.newPage();

  // 6.1 Mock inicial: contenido válido
  await anonPage.route(API_SHARED_CONTENT_URL, route => {
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(scriptInitial) 
   });
  });

    const anonPageLoadPromise = anonPage.waitForResponse(API_SHARED_CONTENT_URL);

  // 6.2 Visitar enlace compartido y esperar la carga
    await Promise.all([
        anonPage.goto(enlace),
        anonPageLoadPromise,
    ]);
  await expect(anonPage.getByText(scriptInitial.title)).toBeVisible();

    // --- DESACTIVAR EL ENLACE (DELETE) ---

  // 7️⃣ Configurar la intercepción para la desactivación
    
    // 7.1 Definimos la intercepción de DELETE para la desactivación
    const stopSharingApiPromise = page.waitForResponse(response => 
        response.url().includes(API_SHARE_URL) && response.request().method() === 'DELETE'
    );
    await page.route(API_SHARE_ENDPOINT, route => {
        route.fulfill({
            status: 204, // No Content
        });
    }, { times: 1 }); // Solo para la desactivación

    // 7.2 Mock para el refresh de la lista (GET /scripts) después de DESACTIVAR
    const refreshUnsharedPromise = page.waitForResponse(response => 
        response.url().includes(API_SCRIPTS_URL) && response.request().method() === 'GET'
    );
    await page.route(API_SCRIPTS_URL, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ scripts: [scriptUnshared] }), // Guion ya NO compartido
        });
    }, { times: 1 }); 

  // 7.3 Clic en el botón "Dejar de Compartir" y esperar las respuestas
    // El botón se encuentra dentro del modal (o en la lista de guiones que se actualizó)
  const desactivarBtn = page.locator('button:has-text("Dejar de Compartir")');
  
    // Cerrar el modal para que el clic apunte al botón de la lista,
    // o clic en el botón del modal si existe allí.
    const cerrarModalBtn = page.getByRole('button', { name: 'Cerrar', exact: true });
    await cerrarModalBtn.click(); // Primero cerramos el modal de compartir

    // Ahora el botón 'Dejar de Compartir' debe estar visible en la lista
    const stopSharingListBtn = page.locator('button:has-text("Dejar de Compartir")').first();


    await Promise.all([
        stopSharingListBtn.click(), 
        stopSharingApiPromise, // Esperamos el DELETE 
        refreshUnsharedPromise, // Esperamos la lista refrescada
    ]);
    
  // 7.4 Verificar mensaje de confirmación (si lo muestra showToast, que no es parte de este test)
  // El test pasa si las llamadas de red se completan correctamente.

    // --- ACCESO PÚBLICO (Verificar que falla) ---

  // 8️⃣ En el contexto anónimo, el enlace ya no debe ser válido
  await anonPage.route(API_SHARED_CONTENT_URL, route => {
   route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: "Este enlace ya no está disponible" })
   });
  });

    // 8.1 Recargar para simular intento de acceso posterior
    const anonPageFailPromise = anonPage.waitForResponse(response => 
        response.url().includes(API_SHARED_CONTENT_URL) && response.status() === 404
    );
  
    await Promise.all([
        anonPage.reload(),
        anonPageFailPromise
    ]);

  // 8.2 Verificar mensaje de error
  await expect(anonPage.getByText(/no está disponible|404|Error/i)).toBeVisible();

  // 9️⃣ Cerrar contextos
  await anonContext.close();
 });
});