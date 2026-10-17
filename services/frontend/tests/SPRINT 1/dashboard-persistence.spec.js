// tests/dashboard-persistence.spec.js

import { test, expect } from '@playwright/test';

// Selectores
const SIDEBAR_SELECTOR = 'aside'; 
const FAVORITOS_LINK = 'button:has-text("Favoritos")';
const FAVORITOS_TITLE = 'h1:has-text("Mis Favoritos")'; // Título que se muestra en la vista 'favoritos'
const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")'; // Título de la vista por defecto

// Clase de resaltado (Ajusta si tu clase activa es diferente)
// En Sidebar.js, la clase activa es "bg-blue-700"
const ACTIVE_CLASS = 'bg-blue-700';

test.describe('CP-06.03: Persistencia de Vista tras Recarga del Navegador', () => {

    test.beforeEach(async ({ page }) => {
        // --- 1. Simulación de Autenticación (Necesaria para acceder a /dashboard) ---
        await page.goto('/'); 
        await page.evaluate(() => {
            // Inyectar datos de sesión
            localStorage.setItem('userEmail', 'test.user@playwright.com'); 
            localStorage.setItem('username', 'PlaywrightTest');
        });
        await page.goto('/dashboard'); 
        await expect(page.locator(SIDEBAR_SELECTOR)).toBeVisible();
    });

    test('Debe permanecer en la vista "Favoritos" y mantener el resaltado del Sidebar después de F5.', async ({ page }) => {

        // 1. ACCIÓN: Navegar a la vista "Favoritos"
        console.log('Navegando a la vista Favoritos...');
        const favoritosButton = page.locator(FAVORITOS_LINK);
        await favoritosButton.click(); 

        // 2. VERIFICACIÓN A: Estado activo antes de la recarga
        
        // El contenido de Favoritos debe ser visible
        await expect(page.locator(FAVORITOS_TITLE)).toBeVisible(); 
        
        // El botón de Favoritos debe estar resaltado (verificamos la clase activa)
        await expect(favoritosButton).toHaveClass(new RegExp(ACTIVE_CLASS));
        
        // El contenido por defecto ('Mis Guiones') no debe estar visible
        await expect(page.locator(MIS_GUIONES_TITLE)).not.toBeVisible();

        // ----------------------------------------------------------------------
        // 3. ACCIÓN: Forzar la recarga del navegador (Simula F5)
        // ----------------------------------------------------------------------
        
        console.log('Forzando recarga de página (F5)...');
        await page.reload();
        
        // 4. VERIFICACIÓN B: Estado activo después de la recarga
        
        // La URL debe seguir siendo /dashboard (comportamiento Next/React)
        await expect(page).toHaveURL(/.*\/dashboard/);

        // El contenido de Favoritos debe seguir siendo visible (Persistencia del Contenido)
        await expect(page.locator(FAVORITOS_TITLE)).toBeVisible({ timeout: 10000 });
        
        // El botón de Favoritos debe seguir resaltado (Persistencia del Sidebar)
        // Redefinimos el selector después de la recarga para asegurar que Playwright lo localiza de nuevo
        const favoritosButtonAfterReload = page.locator(FAVORITOS_LINK);
        await expect(favoritosButtonAfterReload).toHaveClass(new RegExp(ACTIVE_CLASS));

        // Verificación de que NO volvió a la vista por defecto
        await expect(page.locator(MIS_GUIONES_TITLE)).not.toBeVisible();

        console.log('✅ Prueba CP-06.03 exitosa: La vista "Favoritos" y el Sidebar se mantuvieron activos tras la recarga.');
    });
});