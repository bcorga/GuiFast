import { test, expect } from '@playwright/test';

const CONTACTO_URL = 'http://localhost:3000/contacto';
const API_CONTACTO_URL = 'http://localhost:5000/api/contacto';

test.describe('CP-23.03: Validación de campos en Contacto', () => {

  test('Bloquea envío si el correo es inválido y muestra error en la UI', async ({ page }) => {
    
    // 1️⃣ Navegar a la página de Contacto
    await page.goto(CONTACTO_URL);

    // 2️⃣ Rellenar el formulario con datos inválidos
    await page.fill('input[placeholder="Nombre"]', 'Usuario Prueba');
    await page.fill('input[placeholder="Correo electrónico"]', 'correo-invalido'); // Email inválido
    await page.fill('input[placeholder="Asunto"]', 'Prueba de validación');
    await page.selectOption('select', 'Soporte Técnico');
    await page.fill('textarea[placeholder="Mensaje"]', 'Este es un mensaje de prueba.');

    // 3️⃣ Interceptar la llamada al backend para asegurarnos que no se envía
    let apiCalled = false;
    await page.route(API_CONTACTO_URL, route => {
      apiCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No debería enviarse' })
      });
    });

    // 4️⃣ Hacer clic en Enviar
    await page.click('button:text("Enviar Mensaje")');

    // 5️⃣ Validar que se muestra el mensaje de error HTML5 de email
    const emailInput = page.locator('input[placeholder="Correo electrónico"]');
    const isValid = await emailInput.evaluate(input => input.checkValidity());
    expect(isValid).toBeFalsy();

    // 6️⃣ Validar que no se llamó a la API
    expect(apiCalled).toBeFalsy();

    console.log('✅ CP-23.03 completado: La validación de campos funciona correctamente.');
  });

});