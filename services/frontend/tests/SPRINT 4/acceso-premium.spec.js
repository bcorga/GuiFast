// tests/e2e/cp-30.01-acceso-premium.spec.js
import { test, expect } from "@playwright/test";

test.describe("CP-30.01 - Acceso con paquete activo (rol Premium)", () => {
  test("El usuario Premium puede acceder al muro y ver la lista de guiones", async ({ page }) => {
    // Simulación del entorno localStorage del usuario autenticado
    await page.addInitScript(() => {
      localStorage.setItem("userEmail", "test.user@playwright.com");
      localStorage.setItem("jwt", "fake-jwt-token-premium");
      localStorage.setItem("userRole", "Premium");
      localStorage.setItem("username", "Test Premium");
      localStorage.setItem("avatar", "https://ui-avatars.com/api/?name=Test+Premium");
    });

    // 1️⃣ Ir al dashboard
    await page.goto("http://localhost:3000/dashboard");

    // 2️⃣ Validar que el dashboard se cargue correctamente
    await expect(page.locator("h1")).toContainText("Mis Guiones");

    // 3️⃣ Simular clic en el enlace o botón hacia el muro
    // (asumiendo que Sidebar o el layout tiene el enlace)
    const muroLink = page.locator('text=Muro de Guiones');
    await muroLink.click();

    // 4️⃣ Esperar la navegación
    await page.waitForURL("**/muro");

    // 5️⃣ Verificar que se muestra el título principal del muro
    await expect(page.locator("h1")).toHaveText("Muro de Guiones");

    // 6️⃣ Esperar la carga de la lista de guiones o el mensaje si no hay guiones
    const muroContent = page.locator("text=Muro de Guiones");
    await expect(muroContent).toBeVisible();

    // Esperar por lo menos un guion renderizado o el mensaje vacío
    const guionCard = page.locator(".bg-white.rounded-lg.shadow-lg");
    const mensajeVacio = page.locator("text=Aún no hay guiones publicados.");

    await expect(
      guionCard.first().or(mensajeVacio)
    ).toBeVisible();

    // 7️⃣ Validar acceso permitido: el usuario premium NO es redirigido al login
    await expect(page).not.toHaveURL("**/login");
  });
});
