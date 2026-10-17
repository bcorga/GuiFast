import { test, expect } from "@playwright/test";

test.describe("CP-16.03: Verificación en lista", () => {

  test("Debe mostrar el guion editado al inicio de la lista 'Mis Guiones' tras su actualización", async ({ page }) => {

    // 1️⃣ Ir al login e iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[type="email"]', "pruebas@guifastest.com");
    await page.fill('input[type="password"]', "123");
    await page.click('button:has-text("Iniciar sesión")');

    // 2️⃣ Navegar a la vista "Mis Guiones"
    //await page.getByRole("button", { name: "Mis Guiones" }).click();
    //await expect(page.getByText("Mis Guiones")).toBeVisible();

    // 3️⃣ Tomar el primer guion de la lista
    const primerTitulo = await page.locator("h3.font-bold").first().textContent();
    console.log(`📘 Guion original seleccionado: ${primerTitulo}`);

    // 4️⃣ Editar el primer guion
    await page.getByRole("button", { name: "Editar" }).first().click();
    await expect(page.getByRole("button", { name: "Guardar" })).toBeVisible();

    // 5️⃣ Modificar el contenido y guardar
    await page.fill('input[placeholder*="Título del Guion"]', `${primerTitulo} (Editado)`);
    await page.locator("textarea").fill("Contenido actualizado para prueba de orden.");
    await page.getByRole("button", { name: "Guardar" }).click();

    // 6️⃣ Esperar mensaje de confirmación visual
    page.once("dialog", (dialog) => dialog.accept());
    await page.waitForTimeout(1000); // permitir que se actualicen los datos

    // 7️⃣ Volver a "Mis Guiones"
    await page.getByRole("button", { name: "Mis Guiones" }).click();

    // 8️⃣ Verificar que el guion editado aparece al inicio
    const primerGuionDespues = await page.locator("h3.font-bold").first().textContent();

    console.log(`🕓 Guion en primer lugar tras edición: ${primerGuionDespues}`);

    // ✅ Validar que el guion editado aparece primero
    await expect(primerGuionDespues).not.toBeNull();
    await expect(primerGuionDespues).toContain("(Editado)");

    // ⚙️ Validar que el guion editado aparece al inicio de la lista
    const titulos = await page.locator("h3.font-bold").allTextContents();
    console.log("📋 Orden de títulos:", titulos);

    // El primer guion debe ser el editado
    expect(titulos[0]).toContain("(Editado)");

    // Asegurar que no hay duplicado del mismo título sin "(Editado)"
    const duplicados = titulos.filter(t => t.includes("Bailando en la calle y sonriendo con las personas"));
    expect(duplicados.length).toBe(1);

  });
});