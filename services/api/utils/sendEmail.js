const nodemailer = require("nodemailer");

let transporter;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

// --- Lógica Condicional Mejorada para Producción y Local ---

// Prioridad 1: Configuración para Proveedor Real (Resend, Gmail, SendGrid, etc.)
if (EMAIL_USER && EMAIL_PASS && SMTP_HOST) {
  console.log(`[EMAIL] Usando proveedor real a través de ${SMTP_HOST} para producción.`);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10) || 587,
    secure: false, // false para usar TLS/STARTTLS (puerto 587)
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
} 
// Prioridad 2: Fallback rápido por si usas Gmail directo (Legacy)
else if (EMAIL_USER && EMAIL_PASS) {
  console.log('[EMAIL] Usando configuración directa de Gmail.');
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
} 
// Prioridad 3: Configuración para entorno de prueba local (MailHog)
else if (SMTP_HOST && SMTP_PORT) {
 console.log(`[EMAIL] Usando MailHog en ${SMTP_HOST}:${SMTP_PORT} para desarrollo local.`);
 transporter = nodemailer.createTransport({
  host: SMTP_HOST, 
  port: parseInt(SMTP_PORT, 10), 
  secure: false, 
 });
}
// Fallback: Modo Simulado
else {
    console.error('[EMAIL ERROR] Faltan variables de configuración. Activando modo simulado.');
    transporter = {
        sendMail: (options) => {
            console.log(`[EMAIL SIMULADO] Correo a: ${options.to}, Asunto: ${options.subject}`);
            return Promise.resolve({ messageId: 'simulated-id' });
        }
    };
}

const sendEmail = (to, subject, text) => {
 console.log(`[EMAIL] Intentando enviar correo a: ${to}`);
 
  // Evitamos que falle si se ejecuta el simulador
  if (transporter.sendMail.toString().includes('SIMULADO')) {
      return transporter.sendMail({ to, subject, text });
  }

 return transporter.sendMail({
  // IMPORTANTE: Resend exige que el remitente en el 'from' coincida con su dominio de onboarding, o fallará el envío
  from: `"GuionApp" <${EMAIL_USER === 'resend' ? 'onboarding@resend.dev' : (EMAIL_USER || 'no-reply@example.com')}>`, 
  to,
  subject,
  text
 });
};

module.exports = sendEmail;
