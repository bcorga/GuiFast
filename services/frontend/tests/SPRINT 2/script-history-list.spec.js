// @ts-check
import { test, expect } from "@playwright/test";

test.describe("CP-18.02: Listar historial (Ver Historial)", () => {
  test("Debe listar todas las versiones del guion en orden correcto (más reciente primero)", async ({ page }) => {
    // 1️⃣ Acceder al sistema
    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    // 2️⃣ Esperar carga de la vista "Mis Guiones"
    await page.waitForSelector('h1:has-text("Mis Guiones")');

    // 3️⃣ Seleccionar el primer guion visible
    const primerGuion = page.locator("div.bg-white.border.rounded-lg.p-4.shadow").first();
    const tituloOriginal = await primerGuion.locator("h3").textContent();
    console.log("📝 Guion original:", tituloOriginal);

    // 4️⃣ Ingresar al historial del guion
    const botonHistorial = primerGuion.locator('button:has-text("Ver Historial")');
    await botonHistorial.click();

    // 5️⃣ Esperar que la lista del historial esté visible
    const listaHistorial = page.locator('ul li.p-4.border.bg-white.rounded.shadow');
    await expect(listaHistorial.first()).toBeVisible();

    // 6️⃣ Obtener todas las fechas de las versiones listadas
    const fechasTexto = await page.$$eval(
      'ul li.p-4.border.bg-white.rounded.shadow span.text-sm.text-gray-500',
      (spans) => spans.map((el) => el.textContent?.trim() || "")
    );

    console.log("🕒 Fechas encontradas en historial:", fechasTexto);

    // 7️⃣ Validar que haya al menos dos versiones
    expect(fechasTexto.length).toBeGreaterThanOrEqual(2);

    // 8️⃣ Convertir fechas a objetos Date para verificar orden descendente
    const fechas = fechasTexto.map((t) => new Date(t));
    const ordenadas = [...fechas].sort((a, b) => b - a);

    // 9️⃣ Confirmar que el historial está ordenado del más reciente al más antiguo
    expect(fechas).toEqual(ordenadas);

    console.log("✅ Historial ordenado correctamente (más reciente primero)");

    // 🔟 Validar contenido de las versiones
    const contenidos = await page.$$eval(
      "ul li pre",
      (pres) => pres.map((el) => el.textContent?.trim() || "")
    );

    expect(contenidos.length).toBe(fechasTexto.length);
    expect(contenidos.some((t) => t.includes("Playwright"))).toBeTruthy();

    console.log("🧾 Total versiones detectadas:", contenidos.length);

    // 11️⃣ Cerrar la vista de historial (si aplica)
    const botonCerrar = page.locator('button:has-text("Cerrar")').first();
    if (await botonCerrar.isVisible()) {
      await botonCerrar.click();
      await expect(listaHistorial.first()).toBeHidden();
    }
  });
});