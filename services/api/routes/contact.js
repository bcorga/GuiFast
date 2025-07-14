const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  const { nombre, email, asunto, motivo, mensaje } = req.body;

  if (!nombre || !email || !asunto || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  const content = `
    Nombre: ${nombre}
    Email: ${email}
    Motivo: ${motivo}
    Asunto: ${asunto}
    Mensaje:
    ${mensaje}
  `;

  try {
    await sendEmail(
      "currandojuegos@gmail.com", // Cambia esto a tu correo de administración
      `Contacto - ${motivo}`,
      content
    );
    res.json({ message: "Mensaje enviado correctamente." });
  } catch (err) {
    console.error("Error enviando email:", err);
    res.status(500).json({ error: "Error enviando el mensaje." });
  }
});

module.exports = router;