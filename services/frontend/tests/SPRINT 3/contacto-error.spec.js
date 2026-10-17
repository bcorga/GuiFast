import { test, expect } from '@playwright/test';

const CONTACT_API_URL = 'http://localhost:5000/api/contacto';

test.describe('CP-23.04: Manejo de error en el servicio de email', () => {

    test('Muestra advertencia al usuario si el envío de contacto falla', async ({ page }) => {

        // 1️⃣ Interceptar la llamada al API y forzar un error
        await page.route(CONTACT_API_URL, route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: "Error del servidor" }),
            });
        });

        // 2️⃣ Navegar a la página de contacto
        await page.goto('http://localhost:3000/contacto');

        // 3️⃣ Rellenar el formulario con datos válidos
        await page.fill('input[placeholder="Nombre"]', 'Test User');
        await page.fill('input[placeholder="Correo electrónico"]', 'test.user@playwright.com');
        await page.fill('input[placeholder="Asunto"]', 'Prueba de Error');
        await page.selectOption('select', 'Soporte Técnico');
        await page.fill('textarea[placeholder="Mensaje"]', 'Este es un mensaje de prueba para simular un fallo.');

        // 4️⃣ Hacer clic en enviar
        await page.click('button:has-text("Enviar Mensaje")');

        // 5️⃣ Verificar que se muestra el mensaje de error en la UI
        const mensajeError = page.locator('text=Error del servidor');
        await expect(mensajeError).toBeVisible();

        console.log('✅ CP-23.04 completado: Error del servicio de email mostrado correctamente al usuario.');
    });
});