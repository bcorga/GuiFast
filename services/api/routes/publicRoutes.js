const express = require("express");
const router = express.Router();
const SharedLink = require("../models/SharedLink");
const Script = require("../models/Script");
const User = require("../models/User");

// ➡️ GET /api/public/scripts/published
// Endpoint para obtener todos los guiones publicados en el muro
router.get("/scripts/published", async (req, res) => {
  try {
    const scripts = await Script.findAll({
      where: { isPublished: true },
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        attributes: ["username"],
      },
    });

    // Devolver solo un extracto del contenido para la vista previa
    const formattedScripts = scripts.map(script => ({
      id: script.id,
      title: script.title,
      estilo: script.estilo,
      autor: script.User ? script.User.username : "Anónimo",
      extracto: script.content.substring(0, 200) + "...",
      createdAt: script.createdAt,
    }));

    res.status(200).json({ scripts: formattedScripts });
  } catch (error) {
    console.error("Error al obtener guiones publicados:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ➡️ GET /api/public/scripts/:id
// Nuevo endpoint para ver un guion publicado por su ID
router.get("/scripts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const script = await Script.findOne({
      where: {
        id: id,
        isPublished: true // Solo si está publicado
      },
      include: {
        model: User,
        attributes: ['username']
      }
    });

    if (!script) {
      return res.status(404).json({ error: "Guion no encontrado o no está publicado." });
    }

    res.status(200).json({ script: script });
  } catch (error) {
    console.error("Error al obtener guion por ID:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// GET /api/public/shared-link/:token
router.get("/shared-link/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Busca el enlace y verifica que esté activo
    const sharedLink = await SharedLink.findOne({
      where: { uniqueToken: token, isActive: true },
      include: { model: Script }, // Incluye el guion asociado
    });

    if (!sharedLink || !sharedLink.Script) {
      return res.status(404).json({ error: "Guion no encontrado o enlace inactivo." });
    }

    // Devuelve solo los datos del guion
    res.status(200).json({ script: sharedLink.Script });
  } catch (error) {
    console.error("Error al acceder a guion compartido:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;