// routes/purchase.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Endpoint de compra
router.post("/", async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No se pudo obtener el ID del usuario del token." });
        }
    const userId = req.user.id;
    const { packageName } = req.body;

    // Mapear planes a roles válidos
    const validPlans = {
      "Paquete Inicial": "Inicial",
      "Paquete Extra": "Extra",
      "Paquete Premium": "Premium",
    };

    const roleName = validPlans[packageName];
    if (!roleName) {
      return res.status(400).json({ error: "Producto no válido." });
    }

    // Buscar rol en la tabla roles
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(500).json({ error: "Rol no encontrado en la base de datos." });
    }

    // Actualizar usuario con el nuevo rol
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    user.roleId = role.id;
    await user.save();

    // CAMBIO CLAVE: Genera un nuevo token con el rol actualizado
    const newToken = jwt.sign(
        { id: user.id, email: user.email, role: roleName },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    return res.status(200).json({ message: `Tu plan ha sido actualizado a ${roleName}`, role: roleName, token: newToken });
  } catch (error) {
    console.error("Error en la compra:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;