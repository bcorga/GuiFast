import { test, expect } from '@playwright/test';

test.describe('CP-15.03: Estado vacío en vista Favoritos', () => {
  test('Debe mostrar el mensaje "No hay guiones." cuando no existen favoritos', async ({ page }) => {
    // 1️⃣ Ir al login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 2️⃣ Esperar redirección al dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 3️⃣ Ir a la vista "favoritos"
    await page.click('button:has-text("Favoritos")');

    // 4️⃣ Validar que se muestre el título de la vista
    await expect(page.getByRole('heading', { name: 'Favoritos' })).toBeVisible();

    // 5️⃣ Verificar que no haya guiones visibles
    const guiones = await page.locator('.bg-white.border.rounded-lg.p-4.shadow').count();
    expect(guiones).toBe(0);

    // 6️⃣ Validar que se muestre el mensaje de estado vacío
    await expect(page.getByText('No hay guiones.')).toBeVisible();

    // 7️⃣ Validar que no haya errores visibles en consola
    page.on('pageerror', (err) => {
      throw new Error(`Error en la consola detectado: ${err.message}`);
    });
  });
});