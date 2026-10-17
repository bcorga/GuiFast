// 📄 CP-20.02 - Expandir respuesta (Página de Preguntas Frecuentes)
import { test, expect } from "@playwright/test";

test.describe("CP-20.02 - Expandir respuesta en FAQ", () => {

  test("Debe desplegar el contenido al hacer clic en una pregunta", async ({ page }) => {
    // 1️⃣ Navegar a la página de Preguntas Frecuentes
    await page.goto("http://localhost:3000/faq");

    // 2️⃣ Esperar el título principal de la sección
    await expect(page.getByRole("heading", { name: "Preguntas Frecuentes (FAQ) 🧠" })).toBeVisible();

    // 3️⃣ Localizar la primera pregunta dentro de la categoría "Generación y Edición de Guiones"
    const primeraPregunta = page.getByRole("button", { name: "¿Qué tipos de guiones puedo generar con la IA?" });

    // 4️⃣ Verificar que la respuesta inicialmente NO está visible
    const respuestaInicial = page.locator("text=La IA está entrenada en");
    await expect(respuestaInicial).toHaveCount(0);

    // 5️⃣ Hacer clic para expandir la respuesta
    await primeraPregunta.click();

    // 6️⃣ Verificar que ahora la respuesta se muestre correctamente y sea legible
    const respuestaDesplegada = page.locator("text=La IA está entrenada en guiones estructurados en español");
    await expect(respuestaDesplegada).toBeVisible();
    await expect(respuestaDesplegada).toHaveText(/IA está entrenada en/);

    // 7️⃣ Confirmar que el ícono de la pregunta cambió su estado (rotación del Chevron)
    const iconoChevron = primeraPregunta.locator("svg");
    const transformValue = await iconoChevron.evaluate(el => window.getComputedStyle(el).transform);
    expect(transformValue).not.toBe("none"); // El ícono debe tener rotación aplicada al expandir

    // 8️⃣ Colapsar nuevamente y verificar que se oculte
    await primeraPregunta.click();
    await expect(respuestaDesplegada).toHaveCount(0);
  });
});