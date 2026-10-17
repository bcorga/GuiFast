// tests/profile-update.spec.js

import { test, expect } from '@playwright/test';

// Datos de prueba
const NEW_USERNAME = 'GuionMaster99';
const NEW_AVATAR_URL = 'https://i.giphy.com/hryis7A55UXZNCUTNA.webp'; // Simula la URL de la imagen de 150x150
const SUCCESS_MESSAGE = 'Perfil actualizado con éxito.';

// Selectores
const EMAIL_INPUT = 'input[placeholder="Correo electrónico"]'; // Selector de la prueba de login si lo usas
const PERFIL_LINK = 'button:has-text("Mi Perfil")'; // Botón en el Sidebar
const USERNAME_INPUT = 'input[value="GuionMaster99"]'; // Selector por valor (después de la actualización)
const AVATAR_INPUT = 'input[type="text"][placeholder*="URL de imagen"]'; // Selector por placeholder
const SAVE_BUTTON = 'button:has-text("Guardar cambios")';

test.describe('CP-07.02: Actualización y Persistencia del Perfil', () => {

    test.beforeEach(async ({ page }) => {
        // --- 1. Simulación de Autenticación (Necesaria) ---
        await page.goto('/'); 
        await page.evaluate(() => {
            // Aseguramos que un usuario esté logueado y tenga un email para el PUT request
            localStorage.setItem('userEmail', 'bryancorga@gmail.com'); 
            localStorage.setItem('username', 'bryanUser');
            localStorage.setItem('avatar', 'https://ui-avatars.com/api/?name=TestUser'); 
        });
        await page.goto('/dashboard'); 

        // 2. Navegar a la vista 'Mi Perfil'
        await page.click(PERFIL_LINK);
        await expect(page.locator('h1:has-text("Mi Perfil")')).toBeVisible();
    });

    test('Debe actualizar nombre y avatar, mostrar feedback y persistir los cambios tras la recarga.', async ({ page }) => {

        // --- 1. ACCIÓN: Rellenar el formulario con nuevos datos ---
        
        console.log(`Actualizando nombre a: ${NEW_USERNAME}`);
        
        // El input de username no tiene un selector único, usamos el label o el valor inicial
        // Aquí usamos el label para encontrar el campo de nombre.
        const usernameInput = page.locator('label:has-text("Nombre de usuario") + input[type="text"]');
        await usernameInput.fill(NEW_USERNAME);
        
        // Rellenar la URL del avatar
        const avatarInput = page.locator('label:has-text("Avatar (URL de imagen)") + input[type="text"]');
        await avatarInput.fill(NEW_AVATAR_URL);

        // --- 2. ACCIÓN: Guardar cambios ---
        
        console.log('Haciendo clic en Guardar cambios...');
        await page.click(SAVE_BUTTON);

        // --- 3. VERIFICACIÓN A: Feedback de Éxito ---

        // El mensaje de éxito debe aparecer
        const successMessageLocator = page.locator(`text=${SUCCESS_MESSAGE}`);
        await expect(successMessageLocator).toBeVisible();

        // El nuevo nombre también debe reflejarse inmediatamente en la Sidebar
        await expect(page.locator(`p:has-text("${NEW_USERNAME}")`)).toBeVisible();

        // --- 4. ACCIÓN: Forzar Recarga (Verificar Persistencia) ---
        
        console.log('Forzando recarga de página (F5)...');
        await page.reload();

        // 5. VERIFICACIÓN B: Persistencia de Datos
        
        // Redirigir a la vista de perfil de nuevo (Si el estado no persiste la vista, solo el dashboard)
        await page.click(PERFIL_LINK);
        
        // El nuevo nombre de usuario debe estar presente en el campo Input
        await expect(page.locator(`input[value="${NEW_USERNAME}"]`)).toBeVisible();
        
        // El nuevo Avatar debe estar presente en el campo Input
        await expect(page.locator(`input[value="${NEW_AVATAR_URL}"]`)).toBeVisible();

        // 🛑 CAMBIO AQUÍ: Buscar la imagen dentro del área principal (<main>)
        const mainContent = page.locator('main');

        await expect(
            mainContent.locator(`img[src="${NEW_AVATAR_URL}"]`) // Busca la imagen SOLO dentro de <main>
        ).toBeVisible();

        // Y lo más importante, el Sidebar sigue mostrando el nuevo nombre
        await expect(page.locator(`p:has-text("${NEW_USERNAME}")`)).toBeVisible();

        console.log('✅ Prueba CP-07.02 exitosa: Perfil actualizado y persistente.');
    });
});