import { test, expect } from "@playwright/test";

test.describe("CP-17.01: Render de vista previa PDF", () => {

  test("Debe mostrar la vista previa PDF con formato correcto (márgenes, saltos, espaciado)", async ({ page }) => {
    
    // 1️⃣ Iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    await page.waitForURL("**/dashboard");

    // 2️⃣ Crear un nuevo guion
    await page.click('button:has-text("Nuevo Guion")');
    await expect(page.getByText("Generador y Editor de Guiones")).toBeVisible();

    // 3️⃣ Completar los campos del guion
    await page.fill('input[placeholder*="Título"]', "Guion vista previa E2E");
    await page.fill("textarea", "TÍTULO: Una tarde lluviosa\nNarrador: El día se desvanecía bajo la lluvia...\nPERSONAJE: Ana: No puedo quedarme aquí.");

    // 4️⃣ Hacer clic en el botón “Vista Previa PDF”
    await page.click('button:has-text("Vista Previa PDF")');

    // 5️⃣ Esperar que se muestre el componente .print-preview
    const vistaPrevia = page.locator(".print-preview");
    await expect(vistaPrevia).toBeVisible({ timeout: 10000 });

    // 6️⃣ Validar que el texto del guion se haya renderizado
    await expect(vistaPrevia.getByText("Una tarde lluviosa")).toBeVisible();
    await expect(vistaPrevia.getByText("Narrador: El día se desvanecía bajo la lluvia")).toBeVisible();

    // 7️⃣ Validar elementos de formato básico
    const estilos = await vistaPrevia.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        padding: s.padding,
        background: s.backgroundColor,
        maxWidth: s.maxWidth,
      };
    });
    console.log("📐 Estilos de vista previa:", estilos);

    const maxWidthValue = parseFloat(estilos.maxWidth);
    expect(maxWidthValue).toBeGreaterThanOrEqual(760); // ≈48rem
    expect(maxWidthValue).toBeLessThanOrEqual(780);
    expect(estilos.background).toBe("rgb(255, 255, 255)");
    expect(estilos.padding).not.toBe("0px");

    // 8️⃣ Validar encabezado de la vista previa
    await expect(vistaPrevia.getByText("Vista previa de impresión")).toBeVisible();
    await expect(page.locator('button:has-text("Imprimir")')).toBeVisible();

    // 9️⃣ Cerrar la vista previa
    const closeBtn = page.getByRole('button', { name: 'Cerrar', exact: true });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(vistaPrevia).toBeHidden();
    }
  });
});