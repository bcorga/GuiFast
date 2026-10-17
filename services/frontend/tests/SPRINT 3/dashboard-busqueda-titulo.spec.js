import { test, expect } from '@playwright/test';

// 💡 La URL de la API obtenida de dashboard.js
const API_SCRIPTS_URL = 'http://localhost:5000/api/scripts'; 

test.describe('CP-22.01: Búsqueda por título en "Mis Guiones"', () => {

    test('Filtra dinámicamente los guiones por coincidencias en el título', async ({ page }) => {
        
        // 1️⃣ Preparar entorno y autenticación simulada (Debe ir antes de navegar)
        await page.addInitScript(() => {
            // Se inyecta la autenticación que el dashboard.js espera leer de localStorage
            localStorage.setItem('userEmail', 'test.user@playwright.com');
            localStorage.setItem('jwt', 'fake-jwt-token');
            localStorage.setItem('currentView', 'mis-guiones'); // Para ir directo a la vista
        });

        // 2️⃣ Interceptar la llamada API y simular la respuesta con los guiones de prueba
        await page.route(API_SCRIPTS_URL, route => { 
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                // Simulamos la estructura de datos que setScripts(data.scripts) espera
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
        
        // Sincronización: Esperamos a que la navegación y la respuesta de la API terminen
        await Promise.all([
            page.waitForResponse(API_SCRIPTS_URL),
            navigationPromise
        ]);

        // 4️⃣ Verificación de carga y elementos iniciales
        await expect(page.getByRole('heading', { name: 'Mis Guiones' })).toBeVisible();
        
        // Esperamos a que el primer guion se renderice usando el rol semántico <h3>
        const guionAventura = page.getByRole('heading', { name: 'Guion Aventura Épica' });
        await expect(guionAventura).toBeVisible(); 

        // 5️⃣ Esperar a que el campo de búsqueda esté disponible
        const searchInput = page.getByPlaceholder('Buscar por título o contenido...');
        await expect(searchInput).toBeVisible();

        // 6️⃣ Escribir la consulta parcial (“Comedia”)
        await searchInput.fill('Comedia');

        // 7️⃣ Verificar el filtro dinámico
        const guionVisible = page.getByRole('heading', { name: 'Comedia Urbana' });
        const guionOculto1 = page.getByRole('heading', { name: 'Guion Aventura Épica' });
        const guionOculto2 = page.getByRole('heading', { name: 'Documental Marino' });
        
        // Verificamos que el guion buscado es visible
        await expect(guionVisible).toBeVisible(); 
        
        // Verificamos que los otros guiones están ocultos (o desaparecen/tienen conteo 0)
        // Usamos .not.toBeVisible() que es robusto si los elementos se ocultan con CSS.
        await expect(guionOculto1).not.toBeVisible();
        await expect(guionOculto2).not.toBeVisible();

        // 8️⃣ Limpiar la búsqueda y verificar que se muestran todos nuevamente
        await searchInput.fill('');
        
        // Verificamos que los guiones reaparecen
        await expect(guionOculto1).toBeVisible(); 
        await expect(guionOculto2).toBeVisible(); 
        
        // Verificamos el conteo total de guiones renderizados (se usa el selector del HTML real)
        const allScripts = page.locator('.grid > div'); 
        await expect(allScripts).toHaveCount(3); 

        console.log('✅ CP-22.01 completado: Filtro dinámico por título verificado correctamente.');
    });
});