const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;

let transporter = null;

// --- Configuración Única de Transporte SMTP Universal ---
if (SMTP_HOST && SMTP_PORT) {
  const portNumber = parseInt(SMTP_PORT, 10);
  
  console.log(`[EMAIL] Inicializando transporte SMTP a través de ${SMTP_HOST}:${portNumber}`);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNumber,
    // Será true si decides usar el puerto seguro 465, false para los puertos de Mailtrap (2525) o MailHog (1025)
    secure: portNumber === 465, 
    auth: EMAIL_USER && EMAIL_PASS ? {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    } : undefined,
    // TLS condescendiente por si MailHog local o los entornos de testing no implementan certificados firmados
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  console.error('[EMAIL ERROR] Faltan variables de configuración SMTP globales. Activando modo simulado.');
}

const sendEmail = async (to, subject, text) => {
  console.log(`[EMAIL] Intentando enviar correo a: ${to}`);

  // SI EL TRANSPORTE SMTP ESTÁ EN LÍNEA (Sirve tanto para Mailtrap en la nube como para tu MailHog local)
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: '"GuionApp" <no-reply@guionplatform.com>',
        to,
        subject,
        text
      });
      
      console.log('[EMAIL ENVIADO EXITOSAMENTE POR SMTP]:', info.messageId);
      
      // 🚀 ADAPTACIÓN CRÍTICA PARA TU CONTROLADOR DE REGISTRO:
      // Mapeamos 'messageId' a 'id' para simular de forma transparente la respuesta que antes te daba el SDK de Resend
      return { id: info.messageId };
    } catch (error) {
      console.error('[EMAIL CRITICAL ERROR SMTP]:', error);
      throw error;
    }
  }

  // FALLBACK POR SI NO HAY INFRAESTRUCTURA (Modo Simulado General)
  console.log(`[EMAIL SIMULADO] Destinatario: ${to}, Asunto: ${subject}`);
  return { id: 'tsp-simulated-id-' + Math.random().toString(36).substr(2, 9) };
};

module.exports = sendEmail;
