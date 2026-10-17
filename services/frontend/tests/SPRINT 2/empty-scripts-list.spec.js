// 📁 services/frontend/tests/SPRINT 2/empty-scripts-list.spec.js
import { test, expect } from "@playwright/test";

test.describe("CP-12.03: Estado vacío", () => {

  test("Debe mostrar el mensaje 'No ha guardado ningún guión.' cuando el usuario no tiene guiones", async ({ page }) => {
    
    // 1️⃣ Navegar al dashboard (usuario sin guiones)
    await page.goto("http://localhost:3000/dashboard");

    // 2️⃣ Simular sesión para usuario sin guiones
    await page.evaluate(() => {
      localStorage.setItem("email", "usuario.vacio@playwright.com");
      localStorage.setItem("token", "fake-token-empty-user");
    });
    await page.reload();

    // 3️⃣ Hacer clic en “Mis Guiones”
    const MIS_GUIONES_BTN = page.getByRole("button", { name: "Mis Guiones" });
    await MIS_GUIONES_BTN.click();

    // 4️⃣ Esperar que el título "Mis Guiones" sea visible
    await expect(page.getByRole("heading", { name: "Mis Guiones" })).toBeVisible();

    // 5️⃣ Verificar que no existan guiones en la lista
    const guionCards = page.locator("div.bg-white.border.rounded-lg");
    await expect(guionCards).toHaveCount(0);

    // 6️⃣ Validar que se muestre el mensaje de estado vacío
    await expect(page.getByText("No ha guardado ningún guión.")).toBeVisible();
  });
});