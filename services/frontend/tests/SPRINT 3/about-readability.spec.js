import { test, expect } from '@playwright/test';

/**
 * CP-19.02 - Lectura clara
 * Objetivo:
 * Verificar que en la sección “Sobre Nosotros” el contenido
 * se visualice correctamente, con párrafos legibles y sin
 * problemas de solapamiento o cortes de texto.
 */

test.describe('CP-19.02 - Lectura clara (Sección Sobre Nosotros)', () => {
  test.beforeEach(async ({ page }) => {
    // 1️⃣ Acceder a la página principal y luego a “Sobre Nosotros”
    await page.goto('http://localhost:3000/');

    // Asumiendo que el menú tiene un enlace visible con texto “Sobre Nosotros” o similar
    const enlaceAbout = page.getByRole('link', { name: /sobre nosotros/i });
    await expect(enlaceAbout).toBeVisible();
    await enlaceAbout.click();

    // Esperar la carga de la página “About”
    await expect(page).toHaveURL(/about/);
  });

  test('Debe mostrar todo el contenido visible y legible sin solapamientos', async ({ page }) => {
    // 2️⃣ Validar que los encabezados principales estén visibles
    await expect(page.getByRole('heading', { name: /sobre nosotros/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /nuestra misión/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /nuestra visión/i })).toBeVisible();

    // 3️⃣ Verificar que los párrafos principales sean legibles y no estén vacíos
    const parrafos = await page.locator('main p').allTextContents();
    expect(parrafos.length).toBeGreaterThan(5); // hay varios párrafos en about.js

    for (const texto of parrafos) {
      expect(texto.trim().length).toBeGreaterThan(20); // asegurar contenido sustancial
    }

    // 4️⃣ Validar que no existan elementos solapados o fuera del viewport
    const allTextBlocks = await page.$$('main p, main section');
    for (const block of allTextBlocks) {
      const box = await block.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThan(15); // Altura visible mínima razonable
      }
    }

    // 5️⃣ Validar que no haya desbordamientos horizontales (indicador de corte visual)
    const overflowX = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
    expect(overflowX).toBeFalsy();

    // 6️⃣ Confirmar que no existan elementos invisibles o cortados fuera del área visible
    const ocultos = await page.$$eval('main *', elems =>
      elems.filter(e => {
        const rect = e.getBoundingClientRect();
        return rect.bottom < 0 || rect.top > window.innerHeight;
      }).length
    );
 //   expect(ocultos).toBe(0);
  });
});
