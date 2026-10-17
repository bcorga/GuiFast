const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const Role = require("../models/Role");
const sendEmail = require("../utils/sendEmail"); // Lo crearemos abajo
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// --- CONSTANTES ---
const FRONTEND_LOGIN_URL = "https://guifast-production.up.railway.app/login"; // URL del Login del Frontend
const BACKEND_VERIFY_URL = "https://thriving-love-production-4611.up.railway.app/api/auth/verify"; // URL del Backend para verificación
// Definir un secreto para el JWT. ¡En producción, debe ser una variable de entorno!
const JWT_SECRET = process.env.JWT_SECRET; 

// Endpoint para autenticar al usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ where: { email },include: { model: Role, attributes: ['name'] } });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
      if (!user.verified) {
        return res.status(403).json({ error: "Por favor verifica tu correo antes de iniciar sesión." });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

            // ----------------------------------------------------
      // CAMBIO CRUCIAL: Generar el token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '2h' } // El token expira en 2 horas
      );
  
      // Modificar la respuesta para incluir el token
  
      res.status(200).json({ id: user.id, email: user.email, username: user.username, avatar: user.avatar, token, role: user.Role ? user.Role.name : null });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ error: "Error interno del servidor." });
    }
  };
  
  
// Endpoint para registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "El correo ya está registrado." });

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas

    const newUser = await User.create({
      username,
      email,
      password_hash: passwordHash,
      verified: false,
      verificationToken,
      verificationTokenExpires
    });

    const link = `https://thriving-love-production-4611.up.railway.app/api/auth/verify?token=${verificationToken}`;
    await sendEmail(email, "Activa tu cuenta", `Haz clic en este enlace para activar tu cuenta: ${link}`);

    res.status(201).json({ message: "Usuario registrado. Revisa tu email para activar tu cuenta." });
  } catch (err) {
    console.error("Error registrando usuario:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

/**
 * Endpoint para verificar el token de activación y activar la cuenta.
 * Si tiene éxito, muestra un mensaje temporal antes de redirigir al login del frontend.
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      //return res.status(400).send("Token inválido o expirado.");
      // Si el token es inválido o expirado, redirigimos inmediatamente con un mensaje de error.
      return res.redirect(`${FRONTEND_LOGIN_URL}?error=TokenInválido`);
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // --- CORRECCIÓN CRÍTICA PARA EL E2E Y UX ---
    // En lugar de una redirección inmediata, enviamos una página HTML temporal
    // que muestra el mensaje de éxito esperado por la prueba y luego redirige.
    const successMessage = "Cuenta activada con éxito. Redirigiendo al Login...";
    
    // Este HTML debe usar el texto exacto del selector de Playwright.
const htmlResponse = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Activación Exitosa</title>
        <style>
            /* Paleta inspirada en Tailwind: Verde para éxito, fondo sutil */
            :root {
                --color-success: #10B981; /* Esmeralda 500 */
                --color-background: #F9FAFB; /* Gris 50 */
                --color-card-shadow: rgba(16, 185, 129, 0.2); /* Sombra de éxito */
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: var(--color-background);
            }

            .message-container {
                text-align: center;
                padding: 3rem 2rem;
                background: white;
                border-radius: 0.75rem; /* rounded-xl */
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
                border-left: 5px solid var(--color-success); /* Borde de éxito */
                max-width: 400px;
                width: 90%;
                transition: transform 0.3s ease-in-out;
            }

            .message-container:hover {
                transform: translateY(-2px); /* Pequeño efecto hover */
            }

            .icon-wrapper {
                margin-bottom: 1.5rem;
            }

            .success-icon {
                width: 64px;
                height: 64px;
                color: var(--color-success);
            }
            
            h1 { 
                color: #1F2937; /* Gris 800 */
                font-size: 1.25rem; /* text-xl */
                font-weight: 600; /* semibold */
                margin-top: 0;
            }

            p {
                color: #6B7280; /* Gris 500 */
                font-size: 1rem;
                margin-top: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="message-container">
            <div class="icon-wrapper">
                <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1>${successMessage}</h1> 
            <p>Serás redirigido automáticamente a la página de inicio de sesión.</p>
        </div>
        <script>
            // Redirige al login del frontend después de 3 segundos
            setTimeout(() => {
                window.location.href = '${FRONTEND_LOGIN_URL}';
            }, 3000); 
        </script>
    </body>
    </html>
`;
// Enviamos la respuesta HTML
    return res.status(200).send(htmlResponse);
    // --- FIN CORRECCIÓN ---

    //return res.redirect("http://localhost:3000/login");
  } catch (error) {
    console.error("Error al verificar email:", error);
    //return res.status(500).send("Error interno al verificar.");

    // En caso de error interno, también redirigimos al login con un error.
    return res.redirect(`${FRONTEND_LOGIN_URL}?error=ErrorVerificación`);
  }
};

/**
 * Endpoint para reenviar el correo de verificación cuando el enlace ha expirado.
 * Responde a POST /api/auth/resend-verification
 */
exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Se requiere un email." });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Seguridad: No revelar si el email existe, solo reportar éxito genérico
            return res.status(200).json({ message: "Si existe una cuenta asociada, se ha enviado un nuevo enlace." });
        }

        if (user.verified) {
            return res.status(400).json({ message: "La cuenta ya está activada." });
        }

        // 1. Generar nuevo token y nueva fecha de expiración (ej. 24 horas después)
        const newVerificationToken = crypto.randomBytes(32).toString('hex');
        const newExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        user.verificationToken = newVerificationToken;
        user.verificationTokenExpires = newExpiration;
        await user.save();

        // 2. Enviar el nuevo email
        const verificationLink = `${BACKEND_VERIFY_URL}?token=${newVerificationToken}`;
        const emailText = `Haz clic en este enlace para activar tu cuenta: ${verificationLink}`;
        
        await sendEmail(user.email, "Reenvío: Activa tu cuenta", emailText);
        
        return res.status(200).json({ message: "Se ha enviado un nuevo correo de activación." });

    } catch (error) {
        console.error("Error al reenviar correo:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};
