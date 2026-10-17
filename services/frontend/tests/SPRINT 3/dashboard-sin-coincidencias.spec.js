import { test, expect } from '@playwright/test';

// 💡 La URL del endpoint de scripts (según dashboard.js)
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts';

test.describe('CP-22.04: Sin coincidencias en la búsqueda de "Mis Guiones"', () => {

    test('Debe mostrar el mensaje "No hay resultados" cuando la búsqueda no encuentra coincidencias', async ({ page }) => {

        // 1️⃣ Inyectar autenticación simulada
        await page.addInitScript(() => {
            localStorage.setItem('userEmail', 'test.user@playwright.com');
            localStorage.setItem('jwt', 'fake-jwt-token');
            localStorage.setItem('currentView', 'mis-guiones');
        });

        // 2️⃣ Interceptar la llamada a la API y simular los guiones disponibles
        await page.route(API_SCRIPTS_URL, route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    scripts: [
                        { id: 1, title: "Guion de Comedia", content: "Sketch humorístico", estilo: "comico", createdAt: new Date().toISOString() },
                        { id: 2, title: "Guion de Terror", content: "Una historia espeluznante", estilo: "terror", createdAt: new Date().toISOString() },
                    ]
                }),
            });
        });

        // 3️⃣ Navegar al dashboard
        const navigationPromise = page.goto('http://localhost:3000/dashboard');

        await Promise.all([
            page.waitForResponse(API_SCRIPTS_URL),
            navigationPromise
        ]);

        // 4️⃣ Verificar que se haya cargado el encabezado
        await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();

        // 5️⃣ Esperar a que los guiones iniciales se muestren
        const guion1 = page.getByRole('heading', { name: 'Guion de Comedia' });
        const guion2 = page.getByRole('heading', { name: 'Guion de Terror' });

        await expect(guion1).toBeVisible();
        await expect(guion2).toBeVisible();

        // 6️⃣ Localizar el campo de búsqueda
        const searchInput = page.getByPlaceholder('Buscar por título o contenido...');
        await expect(searchInput).toBeVisible();

        // 7️⃣ Ingresar una búsqueda sin coincidencias
        await searchInput.fill('Ciencia Ficción');

        // 8️⃣ Verificar que aparezca el mensaje de "No ha guardado ningún guión."
        const noResultsMsg = page.getByText('No ha guardado ningún guión.', { exact: true });
        await expect(noResultsMsg).toBeVisible();

        // 9️⃣ Asegurar que la lista de guiones desaparezca
        const allScripts = page.locator('.grid > div');
        await expect(allScripts).toHaveCount(0);

        // 🔟 Limpiar búsqueda y verificar que los guiones vuelven a mostrarse
        await searchInput.fill('');
        await expect(guion1).toBeVisible();
        await expect(guion2).toBeVisible();

        console.log('✅ CP-22.04 completado: Se muestra "No ha guardado ningún guión." correctamente cuando no hay coincidencias.');
    });
});