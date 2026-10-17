const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

// Inicializamos el SDK de Resend solo si EMAIL_USER es 'resend' y tenemos la API Key (EMAIL_PASS)
let resendClient = null;
if (EMAIL_USER === 'resend' && EMAIL_PASS) {
  console.log('[EMAIL] Inicializando SDK oficial de Resend para producción (Evita bloqueo SMTP).');
  resendClient = new Resend(EMAIL_PASS);
}

// Fallback: Si no estamos en producción con Resend, configuramos Nodemailer para tu MailHog local
let localTransporter = null;
if (!resendClient && SMTP_HOST && SMTP_PORT) {
  console.log(`[EMAIL] Usando MailHog en ${SMTP_HOST}:${SMTP_PORT} para desarrollo local.`);
  localTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: false,
  });
}

const sendEmail = async (to, subject, text) => {
  console.log(`[EMAIL] Intentando enviar correo a: ${to}`);

  // CASO 1: EN PRODUCCIÓN (Usa el SDK de Resend por HTTP seguro)
  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: 'GuionApp <onboarding@resend.dev>', // Obligatorio mantener este en el plan gratis
        to: [to],
        subject: subject,
        text: text,
      });

      if (error) {
        console.error('[EMAIL ERROR SDK]:', error);
        throw error;
      }
      console.log('[EMAIL ENVIADO EXITOSAMENTE POR SDK]:', data.id);
      return data;
    } catch (err) {
      console.error('[EMAIL CRITICAL ERROR SDK]:', err);
      throw err;
    }
  }

  // CASO 2: EN DESARROLLO LOCAL (Usa tu MailHog de siempre)
  if (localTransporter) {
    return localTransporter.sendMail({
      from: '"GuionApp" <no-reply@example.com>',
      to,
      subject,
      text
    });
  }

  // CASO 3: SIN CONFIGURACIÓN (Modo Simulado)
  console.error('[EMAIL ERROR] Sin configuración activa. Modo simulado.');
  console.log(`[EMAIL SIMULADO] Para: ${to}, Asunto: ${subject}`);
  return Promise.resolve({ messageId: 'simulated-id' });
};

module.exports = sendEmail;
