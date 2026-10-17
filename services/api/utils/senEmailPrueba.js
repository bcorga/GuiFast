const nodemailer = require("nodemailer");

let transporter;

// CRÍTICO: Configuración CONDICIONAL para E2E (MailHog) o Producción (Gmail)
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
  // Configuración para entorno de prueba Docker (MailHog)
  console.log(`[EMAIL] Usando MailHog en ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} para E2E.`);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Debería ser 'mailhog'
    port: parseInt(process.env.SMTP_PORT, 10), // Debería ser 1025
    secure: false, // MailHog no requiere TLS/SSL
  });
} else {
  // Configuración para entorno real (Gmail - fallback)
  console.log('[EMAIL] Usando servicio Gmail para envío de correos (Producción/Dev local).');
  // DEBUG CRÍTICO: Muestra por qué falla la condición de MailHog.
  console.log(`[EMAIL DEBUG] SMTP_HOST is: ${process.env.SMTP_HOST ? 'SET' : 'MISSING/EMPTY'}`);
  console.log(`[EMAIL DEBUG] SMTP_PORT is: ${process.env.SMTP_PORT ? 'SET' : 'MISSING/EMPTY'}`);
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendEmail = (to, subject, text) => {
  console.log(`[EMAIL] Intentando enviar correo a: ${to} con asunto: ${subject}`);
  return transporter.sendMail({
    from: `"GuionApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};

module.exports = sendEmail;
