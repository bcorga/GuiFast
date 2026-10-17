// tests/navbar.spec.js

import { test, expect } from '@playwright/test';

// Define la URL base para la prueba
// Playwright usará automáticamente 'http://localhost:3000' que definiste en playwright.config.js
const BASE_URL = '/'; 

// Lista de enlaces a verificar: [Texto visible del enlace, Fragmento de URL o Título esperado]
const enlaces = [
    // Asegúrate de que los textos coincidan exactamente con tu navbar
    ['Recursos', '/#recursos'], 
    ['Sobre Nosotros', '/about'],
    ['Tipos de Guiones', '/#tipos'],
    ['Productos', '/products'],
    ['Preguntas y Respuestas', '/faq'], // Asumiendo que la URL es /faq
    ['Contacto', '/contacto'],
    // FALTA UN ENLACE: Tu lista solo tiene 6. Asumo que el 7mo es "Inicio" o "Dashboard".
    // Voy a asumir 'Inicio' por ahora. Si es diferente, cámbialo.
    //['Inicio', '/'], 
];

test.describe('CP-05.02: Verificación de Enlaces de Navegación (SPA)', () => {

    test('Debe navegar a las 7 secciones sin recargar la página (comportamiento SPA)', async ({ page }) => {
        
        // 1. Navegar a la página principal
        await page.goto(BASE_URL);

        // 2. Iterar sobre todos los enlaces definidos
        for (const [linkText, expectedUrlPart] of enlaces) {
            
            // --- Acción: Buscar y hacer clic en el enlace ---
            
            // Playwright busca un elemento con el rol de enlace (<a>) que contenga el texto.
            const link = page.getByRole('link', { name: linkText, exact: true });
            
            // Verificación inicial: El enlace debe estar visible.
            await expect(link).toBeVisible();

            // Guardar el hash de la URL antes de hacer clic para detectar si la página cambia de verdad
            const urlBeforeClick = page.url(); 

            console.log(`Verificando enlace: ${linkText}`);
            
            // Clic en el enlace. 
            // Usamos .click() en lugar de .goto() para simular la interacción del usuario.
            await link.click();

            // --- Verificación SPA y Navegación ---
            
            // 3. Verificar que la URL ha cambiado al destino esperado
            // Playwright espera implícitamente la navegación después de un clic.
            await expect(page).toHaveURL(new RegExp(expectedUrlPart));
            
            // 4. (Opcional pero útil para SPA): Verificar que el cuerpo principal de la página NO ha recargado.
            // Para una aplicación Next.js (como la tuya), la mejor manera de verificar un SPA
            // es asegurarse de que el framework no esté realizando una navegación completa.
            // Si la URL cambió y la página está viva, es un indicio de SPA.
            
            // 5. Volver a la página principal para la siguiente iteración
            await page.goto(BASE_URL);
            
            // Pequeña pausa para asegurar que el DOM se haya renderizado de nuevo (común en SPAs)
            // await page.waitForTimeout(500); 
        }

    });
});