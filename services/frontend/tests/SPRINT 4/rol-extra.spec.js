import { test, expect } from '@playwright/test';

// 💡 URL de la API que el componente /checkout llama para confirmar la compra.
const API_PURCHASE_URL = 'http://localhost:5000/api/purchase'; 
// La URL de navegación no es necesaria, pero la dejamos para claridad
// const PRODUCTS_URL = 'http://localhost:3000/products'; 

test.describe('CP-27.01: Asignación Extra', () => {
    
    test('Flujo de compra del paquete Extra y verificación del mensaje', async ({ page }) => {
        
        // 1️⃣ Preparar entorno y autenticación simulada (sin cambios)
        await page.addInitScript(() => {
            localStorage.setItem('userEmail', 'test.user@playwright.com');
            localStorage.setItem('jwt', 'fake-jwt-token');
            localStorage.setItem('isLoggedIn', 'true');
        });

        // 2️⃣ Navegar al index y luego a Productos (sin cambios)
        await page.goto('http://localhost:3000/');
        const productosLink = page.locator('header nav >> text=Productos');
        await productosLink.click();
        await expect(page).toHaveURL('http://localhost:3000/products');

        // 3️⃣ Localizar botón Extra (sin cambios)
        const inicialButton = page.locator('button:has-text("Seleccionar Paquete Extra")');
        await expect(inicialButton).toBeVisible();

        // 4️⃣ Interceptar la LLAMADA API que se disparará DESDE /checkout (sin cambios)
        // La intercepción debe hacerse ANTES de la acción que la dispara.
        const apiCallPromise = page.waitForResponse(response => 
            response.url().includes(API_PURCHASE_URL) && response.request().method() === 'POST'
        );
        
        // 4.1 SIMULACIÓN DE ÉXITO DE LA API: (sin cambios)
        await page.route(API_PURCHASE_URL, route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    message: 'Tu plan ha sido actualizado a Extra', 
                    token: 'new-jwt-token', 
                    role: 'Extra' 
                }), // Aseguramos que data.token y data.role existan
            });
        });

        // 5️⃣ Hacer clic en "Seleccionar Extra" (redirige a /checkout)
        await inicialButton.click();
        await page.waitForURL('**/checkout**');
        
        // 🔑 CORRECCIÓN: Localizar y hacer clic en el botón de Confirmación en la página de Checkout.
        const confirmButton = page.locator('button:has-text("Confirmar Compra")');
        await expect(confirmButton).toBeVisible();
        await confirmButton.click(); 

        // 6️⃣ Esperar que la llamada API de confirmación se haya completado
        // Ahora, la promesa se cumplirá porque el clic anterior disparó el fetch.
        await apiCallPromise; 

        // 7️⃣ Verificar que se muestre el mensaje de confirmación
        // Nota: Después de mostrar el mensaje, el código de checkout.js redirige a /dashboard 
        // después de 2 segundos, por lo que debemos ser rápidos.
        const successMessage = page.locator('text=Tu plan ha sido actualizado a Extra');
        await expect(successMessage).toBeVisible();

        console.log('✅ CP-27.01 completado: flujo de asignación extra verificado correctamente.');
    });
});