// ✅ CP-15.04 - Acciones en Favoritos
import { test, expect } from "@playwright/test";

const NUEVO_EDITOR_TITLE = 'h1:has-text("Editar:")';

test.describe("CP-15.04: Acciones en Favoritos", () => {
  test("Verificar que las acciones Editar, Eliminar y Descargar TXT funcionen correctamente desde la vista 'Favoritos'", async ({ page }) => {
    // 1️⃣ Iniciar sesión
    await page.goto("http://localhost:3000/login");
    await page.fill('input[placeholder="Correo electrónico"]', "pruebas@guifastest.com");
    await page.fill('input[placeholder="Contraseña"]', "123");
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForLoadState("networkidle");

    // 2️⃣ Navegar a "Mis Guiones" y marcar uno como favorito (por seguridad)
    await page.click('text=Mis Guiones');
    const firstScript = page.locator("div.bg-white.border").first();
    await expect(firstScript).toBeVisible();

    const favoriteButton = firstScript.getByRole("button", { name: "☆ Añadir a Favoritos" });
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await expect(firstScript.getByRole("button", { name: "★ Favorito" })).toBeVisible();
    }

    // 3️⃣ Ir a vista "Favoritos"
    await page.click('text=Favoritos');
    await expect(page.locator("h1")).toHaveText("⭐ Mis Favoritos");

    // 4️⃣ Validar que hay al menos un guion favorito
    const favoriteCard = page.locator("div.bg-white.border").first();
    await expect(favoriteCard).toBeVisible();

    // 5️⃣ Verificar botón Editar
    await expect(favoriteCard.getByRole("button", { name: "Editar" })).toBeVisible();
    await favoriteCard.getByRole("button", { name: "Editar" }).click();
    await expect(page.locator(NUEVO_EDITOR_TITLE)).toBeVisible();

    await page.click('text=Favoritos');
    await expect(page.locator("h1")).toHaveText("⭐ Mis Favoritos");

    // 6️⃣ Verificar botón Descargar TXT
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      favoriteCard.getByRole("button", { name: "TXT" }).click(),
    ]);
    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/\.txt$/);

    // 7️⃣ Verificar botón Eliminar → confirmación y desaparición
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("¿Seguro?");
      await dialog.accept();
    });
    await favoriteCard.getByRole("button", { name: "Eliminar" }).click();

    // Esperar a que la lista se actualice (el guion desaparece)
    await page.waitForTimeout(1500);
    await expect(favoriteCard).not.toBeVisible();

    // 8️⃣ Validar mensaje si no hay favoritos restantes
    const emptyMsg = page.locator("text=No hay guiones.");
    if (await emptyMsg.isVisible()) {
      await expect(emptyMsg).toHaveText("No hay guiones.");
    }

    console.log("✅ Acciones en favoritos verificadas correctamente.");
  });
});