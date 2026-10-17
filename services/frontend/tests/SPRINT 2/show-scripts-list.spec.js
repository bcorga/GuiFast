import { test, expect } from "@playwright/test";

test.describe("CP-12.01: Mostrar lista de guiones del usuario", () => {
  test("Debe mostrar todos los guiones del usuario autenticado en orden descendente", async ({ page }) => {
    // 1️⃣ Ingresar a la aplicación
    await page.goto("http://localhost:3000/login");

    // 2️⃣ Login del usuario de prueba
    await page.fill('input[placeholder*="Correo"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder*="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar Sesión")');

    // 3️⃣ Esperar que el dashboard cargue correctamente
    await page.waitForSelector("text=Mis Guiones", { timeout: 10000 });

    // 4️⃣ Ir a la sección "Mis Guiones"
    await page.click('button:has-text("Mis Guiones")');

    // 5️⃣ Esperar que se cargue la lista
    const guionCards = page.locator("div.bg-white.border.rounded-lg.p-4.shadow");
    await expect(guionCards.first()).toBeVisible();

    // 6️⃣ Validar que hay al menos un guion
    const totalGuiones = await guionCards.count();
    expect(totalGuiones).toBeGreaterThan(0);

    // 7️⃣ Verificar que cada guion tenga título, fecha y contenido
    for (let i = 0; i < totalGuiones; i++) {
      const card = guionCards.nth(i);
      await expect(card.locator("h3.font-bold")).toBeVisible(); // título
      await expect(card.locator("p.text-gray-600").first()).toBeVisible(); // fecha
      await expect(card.locator("pre")).toBeVisible(); // contenido o resumen
    }

    // 8️⃣ Validar el orden (más reciente primero)
    const fechas = await guionCards.locator("p.text-gray-600.text-sm.mb-2").allTextContents();
    const fechasParseadas = fechas.map(f => new Date(f.trim())).filter(d => !isNaN(d));
    const fechasOrdenadas = [...fechasParseadas].sort((a, b) => b - a);

    expect(fechasParseadas).toEqual(fechasOrdenadas);

    // 9️⃣ Validar un mensaje si no hay guiones (en caso extremo)
    if (totalGuiones === 0) {
      await expect(page.getByText("No tienes guiones guardados")).toBeVisible();
    }
  });
});