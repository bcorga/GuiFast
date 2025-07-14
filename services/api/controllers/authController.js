const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const Role = require("../models/Role");
const sendEmail = require("../utils/sendEmail"); // Lo crearemos abajo
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

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
  
      res.status(200).json({ id: user.id, email: user.email, username: user.username });
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

    const link = `http://localhost:5000/api/auth/verify?token=${verificationToken}`;
    await sendEmail(email, "Activa tu cuenta", `Haz clic en este enlace para activar tu cuenta: ${link}`);

    res.status(201).json({ message: "Usuario registrado. Revisa tu email para activar tu cuenta." });
  } catch (err) {
    console.error("Error registrando usuario:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

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
      return res.status(400).send("Token inválido o expirado.");
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.redirect("http://localhost:3000/login");
  } catch (error) {
    console.error("Error al verificar email:", error);
    return res.status(500).send("Error interno al verificar.");
  }
};