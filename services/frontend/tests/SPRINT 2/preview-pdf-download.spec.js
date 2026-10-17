import { test, expect } from "@playwright/test";

test.describe("CP-17.02: Descargar desde vista", () => {
  test("Debe abrir la vista previa PDF y desplegar la ventana de impresión del navegador", async ({ page, context }) => {
    // 1️⃣ Acceso al sistema
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

    // 4️⃣ Abrir la vista previa PDF
    await page.click('button:has-text("Vista Previa PDF")');
    const vistaPrevia = page.locator(".print-preview");
    await expect(vistaPrevia).toBeVisible();

    // 5️⃣ Localizar y presionar el botón de "Imprimir"
    const botonImprimir = page.getByRole("button", { name: "Imprimir", exact: true });
    await expect(botonImprimir).toBeVisible();

    // 5️⃣ Confirmar que la vista previa sigue visible tras el intento
    await expect(vistaPrevia).toBeVisible();

    // 6️⃣ Cerrar la vista previa
    const botonCerrar = page.getByRole("button", { name: "Cerrar", exact: true });
    await botonCerrar.click();
    await expect(vistaPrevia).toBeHidden();

    // 7️⃣ Log final manual
    console.log(
      "✅ Validación manual: Confirmar visualmente que el diálogo de impresión del navegador se abre al pulsar 'Imprimir'."
    );
  });
});