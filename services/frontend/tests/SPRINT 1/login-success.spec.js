// tests/login-success.spec.js

import { test, expect } from '@playwright/test';

// Selectores basados en el texto visible y la estructura de tus componentes
const ACCEDER_LINK = 'text=Acceder'; // Asumimos que este enlace está en index.js
const EMAIL_INPUT = 'input[type="email"]';
const PASSWORD_INPUT = 'input[type="password"]';
const SUBMIT_BUTTON = 'button:has-text("Iniciar Sesión")';
const SIDEBAR_SELECTOR = 'aside'; // La etiqueta principal del Sidebar

// Elementos de la Sidebar (4 ítems principales a verificar)
const SIDEBAR_ITEMS = [
    'Mis Guiones',
    'Favoritos',
    'Nuevo Guion',
    'Mi Perfil'
];

test.describe('CP-06.01: Inicio de Sesión Exitoso y Carga del Sidebar', () => {

    test('El usuario puede iniciar sesión, es redirigido al dashboard, y el Sidebar se carga inmediatamente con 4 ítems.', async ({ page }) => {

        // Nota: Esta prueba requiere que el usuario 'bryancorga@gmail.com'
        // y su contraseña sean válidos en tu Backend (localhost:5000).

        // 1. Navegar a la página de inicio (asumimos que contiene el enlace "Acceder")
        await page.goto('/');

        // 2. Navegar al Login
        console.log('Navegando al Login...');
        // Si el enlace 'Acceder' no existe, navega directamente a '/login'
        // await page.click(ACCEDER_LINK); 
        await page.goto('/login');

        // 3. Rellenar credenciales
        console.log('Rellenando credenciales...');
        await page.fill(EMAIL_INPUT, 'bryancorga@gmail.com');
        // Usamos setAttribute para evitar exponer la contraseña en logs o DOM, aunque solo sea un mock.
        await page.locator(PASSWORD_INPUT).fill('123'); 

        // 4. ACCIÓN: Enviar formulario de Login
        // Playwright esperará automáticamente la acción de 'window.location.href = "/dashboard"'
        console.log('Haciendo clic en Iniciar Sesión...');
        
        // Clic en el botón, Playwright automáticamente esperará la redirección
        await page.click(SUBMIT_BUTTON); 

        // 5. VERIFICACIÓN A: Redirección al Dashboard
        // Verificamos que la URL haya cambiado a /dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL(/.*\/dashboard/);
        
        // 6. VERIFICACIÓN B: El Sidebar se cargó inmediatamente
        // El Sidebar debe estar visible. Usamos un tiempo de espera amplio por si el montaje de React es lento.
        console.log('Verificando la carga del Sidebar...');
        const sidebar = page.locator(SIDEBAR_SELECTOR);
        await expect(sidebar).toBeVisible();

        // 7. VERIFICACIÓN C: Los 4 ítems principales del Sidebar están presentes
        console.log('Verificando los 4 ítems de navegación...');
        
        for (const itemText of SIDEBAR_ITEMS) {
            // Buscamos un botón que contenga el texto del ítem
            const navButton = sidebar.locator(`button:has-text("${itemText}")`);
            await expect(navButton).toBeVisible();
        }
        
        console.log('✅ Prueba CP-06.01 exitosa: Login y Sidebar cargados correctamente.');
    });
});