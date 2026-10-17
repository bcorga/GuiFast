import { test, expect } from '@playwright/test';

test.describe('CP-23.01: Mostrar información de contacto', () => {

  test('Verifica la presencia y exactitud de la información estática de contacto', async ({ page }) => {
    // 1️⃣ Navegar a la página de contacto
    await page.goto('http://localhost:3000/contacto');

    // 2️⃣ Verificar encabezado principal
    await expect(page.getByRole('heading', { name: 'Contacto', level: 1 })).toBeVisible();

    // 3️⃣ Verificar texto principal con la información de contacto
    const infoContacto = page.locator('p', { hasText: 'contacto@plataforma.com' });
    await expect(infoContacto).toBeVisible();

    // 4️⃣ Validar el contenido completo del párrafo (texto exacto)
    await expect(infoContacto).toHaveText(
      'Puedes escribirnos a contacto@plataforma.com o llamarnos al +51 999 999 999. Horario de atención: Lun-Vie, 9am - 6pm.'
    );

    // 5️⃣ Validar presencia de los tres datos clave por separado
    await expect(page.getByText('contacto@plataforma.com')).toBeVisible();
    await expect(page.getByText('+51 999 999 999')).toBeVisible();
    await expect(page.getByText('Horario de atención: Lun-Vie, 9am - 6pm.')).toBeVisible();

    // 6️⃣ Validar que el formulario se renderice correctamente
    await expect(page.getByPlaceholder('Nombre')).toBeVisible();
    await expect(page.getByPlaceholder('Correo electrónico')).toBeVisible();
    await expect(page.getByPlaceholder('Asunto')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar Mensaje' })).toBeVisible();

    console.log('✅ CP-23.01 completado: Información de contacto visible y correcta.');
  });
});