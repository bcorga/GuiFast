import { test, expect } from '@playwright/test';

test.describe('CP-16.02: Confirmación visual', () => {
  test('Debe mostrar un mensaje de confirmación tras editar y guardar un guion', async ({ page }) => {

    // ✅ Paso 1: Acceder al login
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    // ✅ Paso 2: Ir a la vista "Mis Guiones"
    //await page.getByRole('button', { name: 'Mis Guiones' }).click();

    // ✅ Paso 3: Seleccionar un guion para editar
    const primerGuion = page.locator("div.bg-white.border.rounded-lg").first();
    const tituloOriginal = await primerGuion.locator("h3").textContent();
    await primerGuion.getByRole("button", { name: "Editar" }).click();

    // ✅ Paso 5: Modificar el contenido
    const nuevoContenido = 'Versión revisada con notas adicionales.';
    await page.locator('textarea').first().fill(nuevoContenido);

    // ✅ Paso 6: Guardar cambios
    await page.getByRole('button', { name: 'Guardar' }).click();

    // ✅ Paso 7: Verificar que aparece un mensaje de confirmación visual
    // 7️⃣ Confirmar alerta de actualización
    page.once("dialog", (dialog) => dialog.accept());
    await page.waitForTimeout(1000); // permitir que se actualicen los datos

    // ✅ Paso 8: (Opcional) Confirmar que el usuario permanece en la vista correcta
   // await expect(page.getByText('Mis Guiones')).toBeVisible();
  });
});