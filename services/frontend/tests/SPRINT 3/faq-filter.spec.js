import { test, expect } from '@playwright/test';

test.describe('CP-20.03 – Búsqueda simple en FAQ', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de FAQ
    await page.goto('http://localhost:3000/faq'); // Ajusta la URL según tu entorno
  });

  test('Filtrado dinámico de preguntas al escribir en el input de búsqueda', async ({ page }) => {
    // Seleccionamos el input de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar preguntas"]');
    
    // Escribimos un término que debería filtrar las preguntas
    await searchInput.fill('guion');
    
    // Esperar a que se rendericen los resultados filtrados
    const visibleQuestions = page.locator('section ul li button span');
    await expect(visibleQuestions.first()).toContainText(/guion/i);
    
    // Comprobar que al menos una categoría con resultados se mantiene visible
    const visibleCategories = page.locator('section h3');
    const categoryCount = await visibleCategories.count(); 
    await expect(categoryCount).toBeGreaterThan(0);

    // Limpiar el input y verificar que todas las preguntas reaparezcan
    const filteredCount = await visibleQuestions.count();
    await searchInput.fill('');
    const allQuestions = page.locator('section ul li button span');
    const totalCount = await allQuestions.count();
    await expect(totalCount).toBeGreaterThan(filteredCount);
  });
});