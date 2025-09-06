// routes/purchase.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");

// Endpoint de compra
router.post("/", async (req, res) => {
  try {
    const { email, packageName } = req.body;

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
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    user.roleId = role.id;
    await user.save();

    return res.status(200).json({ message: `Tu plan ha sido actualizado a ${roleName}`, role: roleName });
  } catch (error) {
    console.error("Error en la compra:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;