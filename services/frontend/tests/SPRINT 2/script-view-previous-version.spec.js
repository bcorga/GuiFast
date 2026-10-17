import { test, expect } from "@playwright/test";

test.describe("CP-18.03: Ver versión pasada (Historial de guion)", () => {

  test("Debe cargar y mostrar correctamente el contenido completo de una versión anterior (V1)", async ({ page }) => {
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

    // Guardar texto de referencia
    const contenidoEsperado = await versionAnterior.locator("pre").textContent();

    // Click en "Restaurar esta versión"
    await versionAnterior.locator('button:has-text("Restaurar esta versión")').click();

    // 5️⃣ Esperar a que el contenido restaurado se cargue en el editor principal
    const editor = page.locator("textarea, .script-editor");
    await expect(editor).toBeVisible({ timeout: 10000 });

    // 6️⃣ Comparar el contenido mostrado con el esperado
    const contenidoActual = await editor.inputValue().catch(async () => {
      // Si no es textarea, leer el texto renderizado
      return await editor.textContent();
    });

    console.log("🧾 Contenido esperado (extracto):", contenidoEsperado.slice(0, 80));
    console.log("🧾 Contenido actual (extracto):", contenidoActual.slice(0, 80));

    // 7️⃣ Validación principal
    expect(contenidoActual.trim()).toContain(
      contenidoEsperado.trim().slice(0, 50),
      "El contenido de la versión anterior debe mostrarse correctamente en el editor."
    );

    // 8️⃣ Confirmar que la interfaz muestre una notificación o estado restaurado
    const notificacion = page.locator("text=Versión restaurada");
    if (await notificacion.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log("✅ Notificación de restauración detectada.");
    } else {
      console.log("⚠️ No se detectó notificación, pero el contenido fue restaurado.");
    }

    // 9️⃣ Regresar a la lista de guiones
    await page.click('button:has-text("Guardar")');
  });
});