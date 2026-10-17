import { test, expect } from '@playwright/test';

test.describe('CP-20.01: Listado y categorías - Página de Preguntas Frecuentes', () => {
  test('Debe mostrar las FAQs agrupadas y ordenadas correctamente por categoría', async ({ page }) => {
    // 1️⃣ Acceder a la ruta de Preguntas Frecuentes
    await page.goto('http://localhost:3000/faq');

    // 2️⃣ Verificar que el encabezado principal exista y tenga el título correcto
    const header = page.getByRole('heading', { name: /Preguntas Frecuentes \(FAQ\)/i });
    await expect(header).toBeVisible();

    // 3️⃣ Esperar a que se rendericen las categorías
    const categorias = await page.locator('h3.text-2xl.font-bold');
    await expect(categorias.first()).toBeVisible();

    // 4️⃣ Verificar que las categorías se carguen en el orden correcto
    const categoriasEsperadas = [
      'Generación y Edición de Guiones',
      'Cuenta y Acceso',
      'Problemas Técnicos y Soporte'
    ];
    
    const categoriasVisibles = await categorias.allTextContents();
    expect(categoriasVisibles).toEqual(categoriasEsperadas);

    // 5️⃣ Validar que cada categoría tenga al menos una pregunta
    for (const categoria of categoriasEsperadas) {
      const seccion = page.locator(`h3:has-text("${categoria}")`);
      await expect(seccion).toBeVisible();

      const preguntas = seccion.locator('xpath=following-sibling::ul/li');
      const cantidad = await preguntas.count();
      expect(cantidad).toBeGreaterThan(0);
    }

    // 6️⃣ Validar el correcto render del campo de búsqueda
    const inputBusqueda = page.getByPlaceholder('Buscar preguntas o palabras clave...');
    await expect(inputBusqueda).toBeVisible();

    // 7️⃣ Captura de evidencia visual
    await page.screenshot({ path: 'test-results/faq-listado-categorias.png', fullPage: true });
  });
});