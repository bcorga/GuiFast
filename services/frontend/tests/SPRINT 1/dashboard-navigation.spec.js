// tests/dashboard-navigation.spec.js

import { test, expect } from '@playwright/test';

// Selectores robustos
const SIDEBAR_SELECTOR = 'aside'; // Usamos la etiqueta HTML principal del Sidebar
const MIS_GUIONES_LINK = 'button:has-text("Mis Guiones")'; // Botón de navegación del Sidebar
const MI_PERFIL_LINK = 'button:has-text("Mi Perfil")';     // Botón de navegación del Sidebar

// Títulos de las vistas (contenidos en la etiqueta <h1> del main)
const MIS_GUIONES_TITLE = 'h1:has-text("Mis Guiones")';
const MI_PERFIL_TITLE = 'h1:has-text("Mi Perfil")';

test.describe('CP-06.02: Navegación Interna del Dashboard (SPA)', () => {

    test.beforeEach(async ({ page }) => {
        // --- 1. Simulación de Autenticación (Pre-requisito para acceder a /dashboard) ---
        // Se inyectan los datos de sesión que el Dashboard.js espera de localStorage
        await page.goto('/'); // Navegar a una página neutral para inyectar datos

        await page.evaluate(() => {
            localStorage.setItem('userEmail', 'test.user@playwright.com'); 
            localStorage.setItem('username', 'PlaywrightTest');
            localStorage.setItem('avatar', 'https://ui-avatars.com/api/?name=PlaywrightTest'); 
        });
        
        await page.goto('/dashboard'); // Navegar al Dashboard

        // --- 2. Verificación Inicial del Sidebar ---
        // Verificamos que el Sidebar se haya renderizado con éxito
        await expect(page.locator(SIDEBAR_SELECTOR)).toBeVisible();
    });

    test('La navegación entre Mis Guiones y Mi Perfil mantiene el Sidebar estático y cambia el contenido.', async ({ page }) => {

        // 1. Verificación Inicial: Asegurarse de estar en 'Mis Guiones'
        // El Sidebar utiliza el texto "Mis Guiones"
        await expect(page.locator(MIS_GUIONES_TITLE)).toBeVisible();
        await expect(page.locator(MI_PERFIL_TITLE)).not.toBeVisible();
        
        // Guardar la ubicación y dimensiones del Sidebar (aside)
        const sidebarBoundingBoxInitial = await page.locator(SIDEBAR_SELECTOR).boundingBox();

        // ----------------------------------------------------------------------
        // 2. ACCIÓN: Navegar a 'Mi Perfil'
        // ----------------------------------------------------------------------
        
        console.log('Navegando a Mi Perfil...');
        await page.click(MI_PERFIL_LINK); 

        // 3. VERIFICACIÓN A: El Contenido Principal debe cambiar
        
        // El título de Mis Guiones desaparece
        await expect(page.locator(MIS_GUIONES_TITLE)).not.toBeVisible();
        
        // El título de Mi Perfil aparece
        await expect(page.locator(MI_PERFIL_TITLE)).toBeVisible();

        // 4. VERIFICACIÓN B: El Sidebar debe mantenerse Visible y Estático (SPA)
        
        const sidebarFinalAfterProfile = page.locator(SIDEBAR_SELECTOR);
        
        // Sigue visible
        await expect(sidebarFinalAfterProfile).toBeVisible();

        // Verificar que la posición NO ha cambiado (comportamiento estático/SPA)
        const sidebarBoundingBoxFinal = await sidebarFinalAfterProfile.boundingBox();
        
        // Comprobar que las coordenadas X e Y no han variado, lo que indica que el componente no se recargó
        // Usamos una pequeña tolerancia para la comprobación de flotantes
        expect(sidebarBoundingBoxFinal.x).toBeCloseTo(sidebarBoundingBoxInitial.x, 0); 
        expect(sidebarBoundingBoxFinal.y).toBeCloseTo(sidebarBoundingBoxInitial.y, 0); 
        
        // ----------------------------------------------------------------------
        // 5. ACCIÓN: Navegar de vuelta a 'Mis Guiones'
        // ----------------------------------------------------------------------
        
        console.log('Navegando de vuelta a Mis Guiones...');
        await page.click(MIS_GUIONES_LINK); 
        
        // 6. VERIFICACIÓN C: El Contenido Principal debe volver a cambiar

        // El título de Mi Perfil debe desaparecer
        await expect(page.locator(MI_PERFIL_TITLE)).not.toBeVisible();

        // El título de Mis Guiones debe aparecer
        await expect(page.locator(MIS_GUIONES_TITLE)).toBeVisible();
        
        // 7. VERIFICACIÓN D: El Sidebar permanece estático (verificamos de nuevo la posición)
        const sidebarBoundingBoxFinalReturn = await page.locator(SIDEBAR_SELECTOR).boundingBox();
        expect(sidebarBoundingBoxFinalReturn.x).toBeCloseTo(sidebarBoundingBoxInitial.x, 0); 
        expect(sidebarBoundingBoxFinalReturn.y).toBeCloseTo(sidebarBoundingBoxInitial.y, 0);
    });
});