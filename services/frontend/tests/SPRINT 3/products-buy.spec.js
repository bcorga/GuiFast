import { test, expect } from '@playwright/test';

// URL de la página de Productos
const PRODUCTS_URL = 'http://localhost:3000/products';

test.describe('CP-21.03: Continuar a Compra desde Productos', () => {

  test('Al seleccionar un paquete, debe redirigir a la ruta de compra correcta', async ({ page }) => {
    // 1️⃣ Navegar a la página de Productos
    await page.goto(PRODUCTS_URL);

    // 2️⃣ Verificar que los paquetes estén visibles
    const packageCards = page.locator('.bg-white.p-6.rounded-xl.shadow-lg');
    await expect(packageCards).toHaveCount(3);

    // 3️⃣ Seleccionar el paquete "Paquete Inicial" (puede cambiarse a otro)
    const paqueteInicial = packageCards.nth(0);
    const selectButton = paqueteInicial.getByRole('button', { name: 'Seleccionar Inicial' });
    await expect(selectButton).toBeVisible();

    // 4️⃣ Hacer clic en el botón de selección
    await selectButton.click();

    // 5️⃣ Verificar la redirección a la ruta de compra con query correcta
    await expect(page).toHaveURL('http://localhost:3000/checkout?packageName=Paquete+Inicial&packagePrice=10');

    // 6️⃣ Verificar que la información del paquete esté presente en la página de checkout
    await expect(page.getByText('Paquete Inicial')).toBeVisible();
    await expect(page.getByText('$10')).toBeVisible();

    console.log('Verificación CP-21.03 completada: Redirección y datos correctos en Checkout.');
  });

});