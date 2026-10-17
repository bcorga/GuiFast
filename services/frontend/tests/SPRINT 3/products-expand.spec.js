// products.spec.js
import { test, expect } from '@playwright/test';

test.describe('CP-21.02 - Detalle expandido de productos', () => {

 test('Al hacer clic en "Ver Más Detalles" se abre el modal con información ampliada', async ({ page }) => {
  // 1️⃣ Navegar a la página de productos
  await page.goto('http://localhost:3000/products');

  // ... (Pasos 2 y 3) ...
  const detailButtons = page.locator('button:has-text("Ver Más Detalles")');
  await expect(detailButtons.first()).toBeVisible();
  await detailButtons.first().click();

  // 4️⃣ Verificar que el modal se abra
  const modalTitle = page.getByRole('heading', { name: 'Detalles del Paquete Inicial', level: 2 });
  await expect(modalTitle).toBeVisible();

    // 🟢 CORRECCIÓN CLAVE: Selector más específico para el contenedor del modal
    const modalContainer = page.locator('.bg-white.rounded-xl.shadow-2xl.w-full.max-w-lg'); 
    
    // Verificamos la visibilidad del contenedor (ya no debería haber ambigüedad)
    await expect(modalContainer).toBeVisible();

  // 5️⃣ Verificar que el contenido del modal incluya detalles y beneficios
    
    // Buscamos la subcadena dentro del contenedor CSS del modal
    await expect(modalContainer.getByText(/limitado a un volumen/i)).toBeVisible(); 
  await expect(modalContainer.getByText('100 Guiones/mes')).toBeVisible(); 

  // 6️⃣ Opcional: Cerrar el modal
  const closeButton = page.getByRole('button', { name: 'Comprar Seleccionar Inicial' });
  await closeButton.click();

  // 7️⃣ Confirmar que el modal ya no está visible
  await expect(modalTitle).toHaveCount(0);
 });

});
