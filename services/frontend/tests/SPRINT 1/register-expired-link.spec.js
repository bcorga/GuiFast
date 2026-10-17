import { test, expect } from '@playwright/test';

// --- CONSTANTES ---
const FRONTEND_URL = 'http://localhost:3000'; // URL base del Frontend
const TEST_USERNAME = `exp_tester_e2e_${Date.now()}`;
const TEST_EMAIL = `exp_u202320106_${Date.now()}@upc.edu.pe`;
const TEST_PASSWORD = 'Password123!';
const REGISTER_PATH = '/register'; // Ruta de registro
const LOGIN_PATH = '/login'; // Ruta de login
const BACKEND_URL = 'http://localhost:5000';
const MAILHOG_API_URL = 'http://localhost:8025/api/v2';
const EMAIL_SUBJECT = "Activa tu cuenta";
const RESEND_EMAIL_SUBJECT_ENCODED = '=?UTF-8?Q?Reenv=C3=ADo=3A_Activa_tu_cuenta?='; 

// SELECTORES
const USERNAME_INPUT = 'input[name="username"]';
const EMAIL_INPUT = 'input[name="email"]';
const PASSWORD_INPUT = 'input[name="password"]';
const SUBMIT_BUTTON = 'button[type="submit"]:has-text("Registrarse")';

// 🚨 NUEVOS SELECTORES CLAVE PARA LA PRUEBA
// Mensaje que aparece en el login.js al detectar ?error=TokenInválido
const ERROR_MESSAGE_SELECTOR = 'text="El enlace de activación ha expirado o es inválido."';
// Botón/Opción que se muestra en el frontend (lo hemos llamado 'Reenviar Correo de Activación')
const RESEND_BUTTON = 'button:has-text("Reenviar Correo de Activación")';
// Campo de email que aparece en el formulario de reenvío
const RESEND_EMAIL_INPUT = '.bg-yellow-50 input[type="email"]';


/**
 * Función de reintento para buscar el email en MailHog. (Copiada de tu ejemplo)
 * ... (Código de waitForEmail omitido para brevedad, pero debe estar aquí) ...
 */
async function waitForEmail(emailAddress, options = {}) {
    const MAX_ATTEMPTS = 20; // 60 segundos
    const WAIT_TIME = 3000;
    
    // Aquí el expectedSubject será "Activa tu cuenta" (registro) o el codificado (reenvío).
    const expectedSubject = options.subject || EMAIL_SUBJECT; 

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            const response = await fetch(`${MAILHOG_API_URL}/messages?limit=10`); 
            if (!response.ok) {
                await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
                continue;
            }

            const data = await response.json();
            
            // 🚨 CONDICIÓN DE BÚSQUEDA CORREGIDA:
            const message = data.items.find(item => {
                // El email es siempre buscado en el Raw.Data
                const emailMatch = item.Raw.Data.includes(emailAddress);
                
                // 💡 El asunto debe coincidir exactamente con lo que esté en los headers de MailHog
                // que, si tiene acentos, estará codificado.
                const subjectHeader = item.Content.Headers.Subject[0];
                const subjectMatch = subjectHeader === expectedSubject;
                
                return emailMatch && subjectMatch;
            });

            if (message) {
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
 * Extrae el token de verificación de un enlace. (Copiada de tu ejemplo)
 * ... (Código de getVerificationToken omitido para brevedad, pero debe estar aquí) ...
 */
function getVerificationToken(rawMessage) {
    const cleanedMessage = rawMessage
        .replace(/=\r?\n/g, '') 
        .toLowerCase()
        .replace(/=3d/g, '=');  
    const regex = /token=([a-f0-9A-Z\-_]{32,128})/i; 
    const match = cleanedMessage.match(regex);
    return match ? match[1] : null;
}

// ------------------------------------------------------------------------------------------------------

test.describe('CP-08.03: Enlace de Activación Expirado (Simulado)', () => {
    test.setTimeout(60000); 

    test.beforeEach(async () => {
        // Limpiar MailHog antes de empezar
        await fetch(`${MAILHOG_API_URL}/messages`, { method: 'DELETE' });
    });

    test('El token inválido/expirado muestra mensaje de error y opción de reenvío', async ({ page }) => {
        
        // 1. Opcional: Registrar un usuario (solo para tener un email real asociado al error, si es necesario)
        // Para esta prueba, no es estrictamente necesario, ya que el token inválido no verifica nada.
        // Pero es buena práctica.

        await test.step('Registro de usuario para tener email de referencia', async () => {
            await page.goto(FRONTEND_URL + REGISTER_PATH);
            await page.fill(USERNAME_INPUT, TEST_USERNAME);
            await page.fill(EMAIL_INPUT, TEST_EMAIL);
            await page.fill(PASSWORD_INPUT, TEST_PASSWORD);
            
            const responsePromise = page.waitForResponse(response => 
                response.url().includes('/api/auth/register') && response.request().method() === 'POST'
            );
            await page.click(SUBMIT_BUTTON);
            const response = await responsePromise;
            expect(response.status(), 'El registro debe ser 201.').toBe(201);
            
            // Opcional: Extraer el token para asegurar que el registro funcionó, aunque no lo usaremos.
            const emailMessage = await waitForEmail(TEST_EMAIL);
            expect(emailMessage, 'El email de registro debe llegar.').not.toBeNull();
        });


        // 2. Simular el acceso a un enlace con token expirado/inválido
        await test.step('Navegar con un Token Inválido o Expirado', async () => {
            // Un token completamente diferente (e.g., 72 caracteres de 'f')
            const invalidToken = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
            const verificationLink = `${BACKEND_URL}/api/auth/verify?token=${invalidToken}`;
            
            // 🚨 Al acceder con un token que el backend no encuentra (inválido/expirado),
            // el backend redirige a: http://localhost:3000/login?error=TokenInválido
            await page.goto(verificationLink);

            // 3. Verificar la redirección al Login
            await page.waitForURL(`**${LOGIN_PATH}**`); 

            const EXPECTED_ERROR_QUERY = `error=TokenInv%C3%A1lido`;
            expect(page.url(), 'Debe redirigir al Login con el parámetro de error codificado.').toContain(`${LOGIN_PATH}?${EXPECTED_ERROR_QUERY}`);
            //expect(page.url(), 'Debe redirigir al Login con el parámetro de error.').toContain(`${LOGIN_PATH}?error=TokenInválido`);
        });


        // 4. Verificar los elementos de la prueba (CP-08.03)
        await test.step('Verificar mensaje de error y opción de reenvío', async () => {
            
            // ✅ Aserción 1: Se mostró el mensaje de error: "El enlace ha expirado"
            // Se debe buscar el texto exacto que definimos en el componente Login.js
            const errorMessageLocator = page.locator(ERROR_MESSAGE_SELECTOR);
            await expect(errorMessageLocator, 'El mensaje de token expirado/inválido debe ser visible.').toBeVisible({ timeout: 10000 });
            
            // ✅ Aserción 2: Se presentó la opción/botón "Reenviar correo de activación"
            const resendButtonLocator = page.locator(RESEND_BUTTON);
            await expect(resendButtonLocator, 'El botón de reenvío debe ser visible.').toBeVisible();

            // Opcional: Verificar que el campo de email para el reenvío está presente.
            await expect(page.locator(RESEND_EMAIL_INPUT), 'El campo de email para reenvío debe estar visible.').toBeVisible();
        });
        
        // 5. Opcional: Probar la funcionalidad de reenvío
        await test.step('Probar la funcionalidad de Reenvío de Email', async () => {
            
            // 1. Rellenar el email para el reenvío
            await page.fill(RESEND_EMAIL_INPUT, TEST_EMAIL);
            
            // 2. Limpiamos MailHog de nuevo ANTES de hacer clic en Reenviar. 
            // Esto asegura que, cuando el nuevo email llegue, será el mensaje más reciente.
            await fetch(`${MAILHOG_API_URL}/messages`, { method: 'DELETE' }); // 👈 LÍNEA CRÍTICA

            // 3. Clic en el botón de reenvío y esperar la respuesta 200 del backend
            const resendResponsePromise = page.waitForResponse(response => 
                response.url().includes('/api/auth/resend-verification') && response.request().method() === 'POST'
            );

            await page.click(RESEND_BUTTON);

            const resendResponse = await resendResponsePromise;
            expect(resendResponse.status(), 'El reenvío debe responder con 200 (OK).').toBe(200);

            // 4. Verificar el mensaje de éxito del reenvío en el Frontend
            await expect(page.getByText('Se ha enviado un nuevo correo de activación.')).toBeVisible();

            // 5. Esperar y verificar que el nuevo email ha llegado a MailHog
            // Esto iniciará los reintentos para encontrar el email en la bandeja limpia.
            const newEmailMessage = await waitForEmail(TEST_EMAIL, { 
                subject: RESEND_EMAIL_SUBJECT_ENCODED 
            });
            
            // 🚨 Aserción fallida: Si llega aquí con null, la función waitForEmail no lo encontró a tiempo.
            expect(newEmailMessage, 'El nuevo email de activación debe llegar a MailHog.').not.toBeNull();
        });

    });
});