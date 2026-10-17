import { test, expect } from "@playwright/test";

const TEXTAREA_EDITOR = 'textarea[placeholder="Escribe tu prompt o edita el contenido generado..."]';

test.describe("CP-18.04: Restaurar versión", () => {
  test("Debe restaurar una versión pasada (V1) y registrarla como nueva versión", async ({ page }) => {
    // 1️⃣ Acceso a la aplicación
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

    // Click en "Ver Historial"
    await primerGuion.locator('button:has-text("Ver Historial")').click();

    // 3️⃣ Esperar que se cargue la lista del historial
    const historial = page.locator("ul li");
    await expect(historial.first()).toBeVisible();

    // Contar versiones disponibles
    const totalVersiones = await historial.count();
    console.log(`📄 Total de versiones encontradas: ${totalVersiones}`);

    expect(totalVersiones).toBeGreaterThan(0);

    // 4️⃣ Seleccionar una versión anterior (por ejemplo, la última de la lista)
    const versionAnterior = historial.last();
    const textoVersion = await versionAnterior.textContent();
    console.log("🕓 Versión seleccionada:", textoVersion.trim());

    // Guardar solo el texto del contenido para la validación (después de "Restaurar esta versión")
    // *Asumiendo que el texto "Contenido generado automáticamente" comienza en el índice 49*
    const contenidoEsperado = textoVersion.trim().slice(50).trim(); // Obtener todo después del índice 49 y quitar espacios
    console.log("📝 Contenido esperado (V1):", contenidoEsperado);

    // Click en "Restaurar esta versión"
    await versionAnterior.locator('button:has-text("Restaurar esta versión")').click();

    // ---- Primera edición ----
    await page.click('button:has-text("Guardar")');
    
    // Regresar a Mis Guiones
    await page.click('text=Mis Guiones');

    // 8️⃣ Volver a abrir historial y validar que se registró una nueva versión
    await page.click('button:has-text("Ver Historial")');
    await expect(historial.first()).toBeVisible();

    const cantidad = await historial.count();
    console.log("🧾 Total versiones tras restauración:", cantidad);
    expect(cantidad).toBeGreaterThan(1);

    // 9️⃣ Validar que la primera versión (la más reciente) contiene el contenido de la restaurada (V1)
    const ultimaVersionElemento = historial.first();
    const ultimaVersionTextoCompleto = await ultimaVersionElemento.textContent();
    console.log("🧾 Total ultimaVersion:", ultimaVersionTextoCompleto.trim());

    // Obtener solo el contenido de la última versión para la comparación
    const contenidoActual = ultimaVersionTextoCompleto.trim().slice(49).trim(); // Usar el mismo 'slice'
    console.log("🧾 Contenido actual (V9):", contenidoActual);

    // Validar que ambos contenidos son iguales
    expect(contenidoActual).toEqual(contenidoEsperado);

    // 1️⃣0️⃣ Validar que contiene una fecha actual (hoy)
    const hoy = new Date().toLocaleDateString("en-US");
    expect(ultimaVersionTextoCompleto).toContain(hoy);

    console.log("✅ Restauración confirmada y registrada correctamente.");
  });
});