import { test, expect } from '@playwright/test';

// --- CONSTANTES ---
const FRONTEND_URL = 'http://localhost:3000'; // URL base del Frontend
// Usamos Date.now() para generar identificadores únicos y prevenir colisiones.
const TEST_USERNAME = `upc_tester_e2e_${Date.now()}`;
const TEST_EMAIL = `u202320106_${Date.now()}@upc.edu.pe`;
const TEST_PASSWORD = 'Password123!';
const REGISTER_PATH = '/register'; // Ruta de registro
const LOGIN_PATH = '/login';      // Ruta de login
const BACKEND_URL = 'http://localhost:5000';
const MAILHOG_API_URL = 'http://localhost:8025/api/v2';
const EMAIL_SUBJECT = "Activa tu cuenta";

// SELECTORES
const USERNAME_INPUT = 'input[name="username"]';
const EMAIL_INPUT = 'input[name="email"]';
const PASSWORD_INPUT = 'input[name="password"]';
const SUBMIT_BUTTON = 'button[type="submit"]:has-text("Registrarse")';
const ACTIVATION_SUCCESS_MESSAGE = 'text="Cuenta activada con éxito. Redirigiendo al Login..."';

/**
 * Función de reintento para buscar el email en MailHog.
 * Busca el email más reciente que contenga el asunto esperado y el email único.
 * @param {string} emailAddress - La dirección de correo a buscar.
 * @returns {Promise<any | null>} El objeto del mensaje de email o null si falla.
 */
async function waitForEmail(emailAddress) {
    const MAX_ATTEMPTS = 15; // 45 segundos en total
    const WAIT_TIME = 3000; 

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            const response = await fetch(`${MAILHOG_API_URL}/messages?limit=1`);
            if (!response.ok) {
                console.error(`Error al acceder a MailHog API: ${response.status}`);
                await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
                continue;
            }

            const data = await response.json();
            const message = data.items.find(item => 
                // 1. Verificar el asunto.
                item.Content.Headers.Subject[0] === EMAIL_SUBJECT &&
                // 2. Verificar que la dirección de correo única esté en el cuerpo crudo del mensaje.
                item.Raw.Data.includes(emailAddress)
            );

            if (message) {
                console.log(`[E2E] Email encontrado en MailHog después de ${i + 1} intentos.`);
                return message;
            }

        } catch (error) {
            console.error(`Error en el intento ${i + 1} de fetch a MailHog:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    }
    return null;
}

/**
 * Extrae el token de verificación de un enlace, manejando la codificación Quoted-Printable.
 *
 * @param {string} rawMessage - El cuerpo completo del correo (Raw.Data).
 * @returns {string | null} El token o null.
 */
function getVerificationToken(rawMessage) {
    // 1. Limpiamos los artefactos de Quoted-Printable del rawMessage para obtener la URL limpia.
    const cleanedMessage = rawMessage
        // 1.1 Elimina los saltos de línea suaves (=\r\n o =\n) que rompen la URL.
        .replace(/=\r?\n/g, '') 
        // 1.2 Decodifica el signo '=' codificado en Quoted-Printable (=3D).
        // Convertimos a minúsculas antes de reemplazar para ser insensibles a mayúsculas/minúsculas.
        .toLowerCase()
        .replace(/=3d/g, '=');  

    // La URL limpia ahora contiene 'token=' seguido del valor completo del token.
    
    // 2. Usamos la regex para capturar el token. 
    // Capturamos cualquier cadena alfanumérica, guiones o guiones bajos de longitud variable.
    // La traza mostró un token de 72 caracteres: af01f54128fcc2d2d44ad4de1d5f160d8775ab5925bcae1b3ecfaf69f6b18275
    const regex = /token=([a-f0-9A-Z\-_]{32,128})/i; 
    const match = cleanedMessage.match(regex);
    
    // Devolvemos el grupo de captura (el token en sí).
    return match ? match[1] : null;
}

test.describe('CP-08.02: Activación de Cuenta por Email', () => {
    // Aumentamos el tiempo de espera a 60s para toda la prueba.
    test.setTimeout(60000); 

    let verificationToken = null;

    test.beforeEach(async ({ page }) => {
        // 1. Limpiar MailHog antes de empezar
        await fetch(`${MAILHOG_API_URL}/messages`, { method: 'DELETE' });
        
        // Usar URL completa para la navegación
        await page.goto(FRONTEND_URL + REGISTER_PATH);

        // 2. Registro del usuario (Paso 1 del flujo)
        await test.step('Rellenar el formulario de registro', async () => {
            // Se asegura que los campos por 'name' estén visibles (solución a tu primer error)
            await expect(page.locator(USERNAME_INPUT)).toBeVisible({ timeout: 10000 });
            await page.fill(USERNAME_INPUT, TEST_USERNAME);
            
            await expect(page.locator(EMAIL_INPUT)).toBeVisible({ timeout: 10000 });
            await page.fill(EMAIL_INPUT, TEST_EMAIL);
            
            await expect(page.locator(PASSWORD_INPUT)).toBeVisible({ timeout: 10000 });
            await page.fill(PASSWORD_INPUT, TEST_PASSWORD);
        });

        // Esperar la respuesta 201 del backend
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/auth/register') && response.request().method() === 'POST'
        );

        await page.click(SUBMIT_BUTTON);

        const response = await responsePromise;
        expect(response.status(), 'El backend debe responder con 201 (Created).').toBe(201);
        
        // 3. Esperar y obtener el email de MailHog
        const emailMessage = await waitForEmail(TEST_EMAIL);
        expect(emailMessage, `El email para ${TEST_EMAIL} no llegó a MailHog después de 45s.`).not.toBeNull();
        
        // 4. Extraer el token (Utilizando la función de limpieza y extracción robusta)
        verificationToken = getVerificationToken(emailMessage.Raw.Data);
        expect(verificationToken, 'No se pudo extraer el token de verificación del cuerpo del correo.').not.toBeNull();
        console.log(`[E2E] Token extraído: ${verificationToken.substring(0, 10)}...`);
    });

    test('El token válido activa la cuenta y redirige a login', async ({ page }) => {
        // CP-08.02: Acceder al enlace de activación con el token obtenido.
        // Usamos el token limpio y completo
        const verificationLink = `${BACKEND_URL}/api/auth/verify?token=${verificationToken}`;
        
        // Simular el clic en el enlace del email
        console.log(`[E2E] Navegando a la URL de verificación: ${verificationLink.substring(0, 60)}...`);
        await page.goto(verificationLink);

        // 1. Verificar el mensaje de éxito mostrado por el frontend
        // Si la navegación fue exitosa, el frontend debería mostrar este mensaje
        await expect(page.locator(ACTIVATION_SUCCESS_MESSAGE)).toBeVisible({ timeout: 10000 });

        // 2. Verificar que la redirección a la página de Login sea correcta (estado final)
        await page.waitForURL(`**${LOGIN_PATH}`); 
        expect(page.url(), 'La página final debe ser la URL de Login.').toContain(LOGIN_PATH);
        
        // Opcional: Verificar un elemento específico de la página de Login
        await expect(page.getByRole('button', { name: 'Iniciar Sesión', exact: true })).toBeVisible();

        console.log(`[E2E] Cuenta activada con éxito para el usuario ${TEST_USERNAME}.`);
    });
});