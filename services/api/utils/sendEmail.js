const nodemailer = require("nodemailer");

let transporter;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

// --- Lógica Condicional Mejorada ---

// Prioridad 1: Configuración para entorno real (Gmail)
if (EMAIL_USER && EMAIL_PASS) {
  console.log('[EMAIL] Usando credenciales de Gmail/SMTP real para envío (Producción/Dev local).');
  transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
   user: EMAIL_USER,
   pass: EMAIL_PASS
  }
 });
} 
// Prioridad 2: Configuración para entorno de prueba E2E (MailHog)
else if (SMTP_HOST && SMTP_PORT) {
 console.log(`[EMAIL] Usando MailHog en ${SMTP_HOST}:${SMTP_PORT} para E2E (Faltan credenciales reales).`);
 transporter = nodemailer.createTransport({
  host: SMTP_HOST, // Debería ser 'mailhog' o similar en Docker
  port: parseInt(SMTP_PORT, 10), // Debería ser 1025
  secure: false, // MailHog no requiere TLS/SSL
 });
}
// Fallback: No hay credenciales reales ni configuración de prueba
else {
    console.error('[EMAIL ERROR] NO se puede enviar correo: Faltan credenciales (EMAIL_USER/EMAIL_PASS) y configuración de prueba (SMTP_HOST/SMTP_PORT).');
    // Transporter simulado que no hace nada para evitar errores
    transporter = {
        sendMail: (options) => {
            console.log(`[EMAIL SIMULADO] Correo a: ${options.to}, Asunto: ${options.subject}`);
            return Promise.resolve({ messageId: 'simulated-id' });
        }
    };
}


const sendEmail = (to, subject, text) => {
 console.log(`[EMAIL] Intentando enviar correo a: ${to} con asunto: ${subject}`);
 
  // Si estamos usando el transportador simulado, simplemente retornamos
  if (transporter.sendMail.toString().includes('SIMULADO')) {
      return transporter.sendMail({ to, subject, text });
  }

 return transporter.sendMail({
  from: `"GuionApp" <${EMAIL_USER || 'no-reply@example.com'}>`, // Usar EMAIL_USER si existe, sino un fallback
  to,
  subject,
  text
 });
};

module.exports = sendEmail;