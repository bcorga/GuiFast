import { test, expect } from '@playwright/test';

// Dirección de la API de MailHog expuesta en localhost:8025
const MAILHOG_API_URL = 'http://localhost:8025/api/v2/messages';

test('DEBUG: Conexión y Limpieza del buzón de MailHog', async ({ request }) => {

    console.log('--- Iniciando test de conexión a MailHog ---');

    // 1. Intentar limpiar el buzón (prueba de DELETE API)
    await test.step('Intento de DELETE /api/v1/messages', async () => {
        try {
            const deleteResponse = await request.delete('http://localhost:8025/api/v1/messages', { timeout: 5000 });
            expect(deleteResponse.ok(), `El DELETE para limpiar buzón no fue 2xx. Status: ${deleteResponse.status()}`).toBeTruthy();
            console.log('✅ Buzón de MailHog limpiado exitosamente (API v1 DELETE OK).');
        } catch (error) {
            console.error('❌ FALLO: No se pudo conectar a MailHog DELETE API. Asegúrate que MailHog esté corriendo en 8025.');
            throw error; // Re-lanza el error para que la prueba falle
        }
    });

    // 2. Intentar obtener los mensajes (prueba de GET API)
    await test.step('Intento de GET /api/v2/messages', async () => {
        try {
            const getResponse = await request.get(MAILHOG_API_URL, { timeout: 5000 });
            expect(getResponse.status(), `El GET para obtener mensajes no fue 200. Status: ${getResponse.status()}`).toBe(200);
            
            const data = await getResponse.json();
            
            // Verificar la estructura básica de la respuesta
            expect(data).toHaveProperty('total', 0);
            expect(data).toHaveProperty('items');
            expect(Array.isArray(data.items)).toBeTruthy();

            console.log('✅ Conexión GET a MailHog exitosa. Estructura de datos verificada.');
        } catch (error) {
            console.error('❌ FALLO: No se pudo conectar a MailHog GET API o la respuesta no tiene el formato esperado.');
            throw error;
        }
    });

    console.log('--- Test de conexión a MailHog finalizado con éxito ---');
});