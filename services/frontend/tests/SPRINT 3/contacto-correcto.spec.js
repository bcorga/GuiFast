import { test, expect } from '@playwright/test';

const CONTACT_API_URL = 'http://localhost:5000/api/contacto';

test.describe('CP-23.02: Envío de formulario válido en Contacto', () => {

    test('Envía datos correctos y muestra mensaje de confirmación', async ({ page }) => {

        // 1️⃣ Navegar a la página de Contacto
        await page.goto('http://localhost:3000/contacto');

        // 2️⃣ Interceptar la llamada al backend y simular respuesta exitosa
        await page.route(CONTACT_API_URL, route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: "Tu mensaje ha sido enviado exitosamente." })
            });
        });

        // 3️⃣ Llenar el formulario con datos válidos
        await page.fill('input[placeholder="Nombre"]', 'Test User');
        await page.fill('input[placeholder="Correo electrónico"]', 'test.user@playwright.com');
        await page.fill('input[placeholder="Asunto"]', 'Prueba E2E');
        await page.selectOption('select', 'Soporte Técnico');
        await page.fill('textarea[placeholder="Mensaje"]', 'Este es un mensaje de prueba para verificar el flujo.');

        // 4️⃣ Enviar el formulario
        await page.click('button:has-text("Enviar Mensaje")');

        // 5️⃣ Verificar que se muestre el mensaje de confirmación
        const confirmationMessage = page.locator('p:has-text("Tu mensaje ha sido enviado exitosamente.")');
        await expect(confirmationMessage).toBeVisible();

        console.log('✅ CP-23.02 completado: Formulario enviado correctamente y mensaje de éxito mostrado.');
    });

});