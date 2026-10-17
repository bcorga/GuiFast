import { test, expect } from '@playwright/test';

// =========================================================================
// VARIABLES DE CONFIGURACIÓN Y CONSTANTES DE PRUEBA
// =========================================================================

const BASE_URL = 'http://localhost:3000'; 
// CRÍTICO: Usamos 'host.docker.internal' para el Backend, alineado con el cambio en register.js.
const BACKEND_URL = 'http://localhost:5000';
// MailHog y el Frontend siguen en 'localhost'
const MAILHOG_API_URL = 'http://localhost:8025/api/v2/messages';

// Generamos un email dinámico para evitar colisiones y usamos la estructura requerida
const timestamp = Date.now();
const TEST_EMAIL = `u202320106_${timestamp}@upc.edu.pe`; 
// CORRECCIÓN CLAVE: Se hace dinámico el nombre de usuario para evitar el error de unicidad (500)
const TEST_USERNAME = `upc_tester_e2e_${timestamp}`;
const TEST_PASSWORD = 'Password123!';

// Textos y Asuntos
// CORRECCIÓN: Se ajusta el mensaje esperado para coincidir con el mensaje hardcodeado en el Frontend (register.js)
const EXPECTED_RESPONSE_MESSAGE = 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.';
const EMAIL_SUBJECT = 'Activa tu cuenta'; 

// Selectores
const REGISTER_LINK = 'a[href="/register"]';
const USERNAME_INPUT = 'input[name="username"]';
const EMAIL_INPUT = 'input[name="email"]';
const PASSWORD_INPUT = 'input[name="password"]';
// CORRECCIÓN: Se especifica el tipo 'submit' para evitar conflicto con el botón de "Registrarse" del Navbar.
const SUBMIT_BUTTON = 'button[type="submit"]:has-text("Registrarse")';

// =========================================================================
// CP-08.01: Registro de Usuario y Verificación de Email
// =========================================================================

test.describe('CP-08.01: Registro y Envío de Email de Verificación', () => {
    
    // AUMENTO CRÍTICO: Se establece el timeout para esta prueba a 60 segundos
    test.setTimeout(60000); 

    // Hook para limpiar MailHog antes de cada prueba (opcional, pero buena práctica)
    test.beforeEach(async ({ request }) => {
        // Elimina todos los mensajes existentes en MailHog para empezar con un buzón limpio
        console.log('Limpiando buzón de MailHog...');
        const response = await request.delete('http://localhost:8025/api/v1/messages');
        expect(response.ok()).toBeTruthy();
        console.log('Buzón de MailHog limpio.');
    });


    test('Registro exitoso y verificación de email en MailHog.', async ({ page, request }) => {

        // --- 1. ACCIÓN: Navegar al formulario de registro ---
        await page.goto(BASE_URL);
        
        // Clic en el enlace de registro, esperando que esté visible
        await page.locator(REGISTER_LINK).click(); 
        await expect(page.locator('h1:has-text("Registrarse")')).toBeVisible();

        console.log(`Registrando nuevo usuario: ${TEST_EMAIL}`);
        
        // Rellenar formulario, asegurando que los campos estén listos
        await page.fill(USERNAME_INPUT, TEST_USERNAME);
        await page.fill(EMAIL_INPUT, TEST_EMAIL);
        await page.fill(PASSWORD_INPUT, TEST_PASSWORD);
        
        // --- 2. ACCIÓN: Enviar formulario y esperar la respuesta del Backend ---

        // Escuchamos la URL con host.docker.internal, que es lo que el navegador debe llamar.
        const registerResponsePromise = page.waitForResponse(response =>
            response.url().includes('localhost:5000/api/auth/register') 
        );
        
        await page.locator(SUBMIT_BUTTON).click();

        // Esperar la respuesta (máximo 30s)
        const registerResponse = await registerResponsePromise;

        // --- 3. VERIFICACIÓN A: Respuesta Exitosa del Backend (HTTP 201) ---
        
        expect(registerResponse.status(), 
            `El backend debe responder con 201 (Created). Recibido: ${registerResponse.status()}`
        ).toBe(201);
        
        console.log('✅ Backend respondió con 201. Registro OK.');

        // --- 4. VERIFICACIÓN B: Feedback de Éxito en la UI ---
        
        // El mensaje de la UI debe coincidir con el mensaje hardcodeado en register.js
        const uiMessage = page.getByText(EXPECTED_RESPONSE_MESSAGE); 
        await expect(uiMessage).toBeVisible({ timeout: 5000 });
        
        console.log('✅ Mensaje de éxito visible en la UI.');

        // --- 5. VERIFICACIÓN C: Verificación del Email vía MailHog ---
        
        console.log('Buscando email en MailHog...');
        
        const mailSent = await test.step('Esperar que el email aparezca en MailHog', async () => {
            let attempt = 0;
            let foundMail = null;
            // AUMENTO: Aumentamos los intentos a 15 (45 segundos en total) para mayor robustez
            const MAX_ATTEMPTS = 15;
            // URL optimizada para solo obtener el mensaje más reciente
            const OPTIMIZED_MAILHOG_API = `${MAILHOG_API_URL}?limit=1`;

            while (attempt < MAX_ATTEMPTS) { 
                attempt++;
                console.log(`Intento ${attempt}/${MAX_ATTEMPTS}: Buscando correo para ${TEST_EMAIL}...`);
                
                // Usamos Playwright request para llamar a la API de MailHog con un timeout explícito
                const response = await request.get(OPTIMIZED_MAILHOG_API, { timeout: 5000 });
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    // Solo revisamos el mensaje más reciente (el único que debe haber)
                    const latestMail = data.items[0];
                    const subject = latestMail.Content.Headers.Subject[0];
                    
                    // 1. Verificamos que el asunto sea el esperado
                    if (subject === EMAIL_SUBJECT) {
                        const rawEmailContent = latestMail.Raw.Data;
                        
                        // 2. Buscamos nuestra dirección única en el contenido RAW (la verificación más fiable)
                        if (rawEmailContent.includes(TEST_EMAIL)) {
                            return latestMail;
                        }
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar 3 segundos
            }
            return null;
        });

        // 6. Aserciones finales del Email
        expect(mailSent, `El email para ${TEST_EMAIL} no llegó a MailHog después de 45s.`).not.toBeNull();
        
        // Verificar el asunto del email
        expect(mailSent.Content.Headers.Subject[0], 
            `El asunto del email no coincide. Esperado: "${EMAIL_SUBJECT}", Recibido: "${mailSent.Content.Headers.Subject[0]}"`
        ).toBe(EMAIL_SUBJECT);
        
        console.log('✅ Email verificado en MailHog con el título correcto. ¡Prueba finalizada!');

    });
});