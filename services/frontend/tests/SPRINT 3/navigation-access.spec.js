import { test, expect } from '@playwright/test';

/**
 * CP-19.01 - Acceso desde menú
 * Verifica que el usuario pueda navegar correctamente entre las secciones del menú
 * (Home -> About) y que el contenido inicial se cargue correctamente.
 */

test.describe('CP-19.01 - Acceso desde menú', () => {

  // URL base de la aplicación (ajusta si usas otro puerto)
  const BASE_URL = 'http://localhost:3000';

  test('Debería navegar correctamente a la sección About desde el menú', async ({ page }) => {
    // Paso 1: Acceder a la página principal
    await page.goto(BASE_URL);

    // Paso 2: Verificar que la cabecera principal esté visible
    await expect(
      page.getByRole('heading', { name: 'Generador Inteligente de Guiones' })
    ).toBeVisible();

    // Paso 3: Verificar que el mensaje de bienvenida esté cargado
    await expect(page.getByText(/Bienvenido\/a a la Plataforma/i)).toBeVisible();

    // Paso 4: Localizar y hacer clic en el enlace del menú "About" o "Sobre Nosotros"
    // (Ajusta el texto exacto según tu componente Layout)
    const aboutLink = page.getByRole('link', { name: /Sobre Nosotros/i });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    // Paso 5: Esperar navegación y validar la nueva URL
    await expect(page).toHaveURL(/.*about/);

    // Paso 6: Validar que el contenido principal de About esté visible
    await expect(
      page.getByRole('heading', { name: /Sobre Nosotros: La Plataforma de GuiFast/i })
    ).toBeVisible();

    // Paso 7: Validar secciones clave cargadas
    await expect(page.getByText(/Nuestra Misión/i)).toBeVisible();
    await expect(page.getByText(/Nuestra Visión/i)).toBeVisible();
   // await expect(page.getByText(/Nuestra Propuesta de Valor/i)).toBeVisible();

    // Paso 8: (Opcional) Regresar al Home y validar
    const homeLink = page.getByRole('link', { name: /Inicio|Home/i });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(BASE_URL + '/');
      await expect(page.getByText(/Generador Inteligente de Guiones/i)).toBeVisible();
    }
  });
});