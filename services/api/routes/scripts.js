const express = require("express");
const router = express.Router();
const Script = require("../models/Script");
const User = require("../models/User");
const ScriptVersion = require("../models/ScriptVersion");

router.post("/", async (req, res) => {
  try {
    const { email, title, content } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const script = await Script.create({
      title,
      content,
      userId: user.id,
    });

    res.status(201).json({ message: "Guion guardado correctamente.", script });
  } catch (error) {
    console.error("Error guardando guion:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// ➡️ GET /api/guiones/:email
router.get("/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }
  
      // Traer todos los scripts de ese usuario, ordenados por fecha de creación
      const scripts = await Script.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
        attributes: [
        "id",
        "title",
        "content",
        "createdAt",
        "isFavorite", // ← agrégalo
        "estilo"      // ← si quieres que fuera usable en el frontend
      ],
      });
  
      return res.status(200).json({ scripts });
    } catch (error) {
      console.error("Error obteniendo guiones:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
  });


  /*router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
  
      const script = await Script.findByPk(id);
      if (!script) return res.status(404).json({ error: "Guion no encontrado." });
  
      script.title = title;
      script.content = content;
      await script.save();
  
      return res.status(200).json({ message: "Guion actualizado correctamente." });
    } catch (error) {
      console.error("Error actualizando guion:", error);
      return res.status(500).json({ error: "Error interno al actualizar." });
    }
  });*/

  router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const script = await Script.findByPk(id);
    if (!script) return res.status(404).json({ error: "Guion no encontrado." });

    // Guardar versión anterior
    await ScriptVersion.create({
      scriptId: script.id,
      content: script.content,
    });

    // Actualizar contenido
    script.title = title;
    script.content = content;
    await script.save();

    res.status(200).json({ message: "Guion actualizado correctamente." });
  } catch (error) {
    console.error("Error actualizando guion:", error);
    res.status(500).json({ error: "Error interno al actualizar." });
  }
});


  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const script = await Script.findByPk(id);
      if (!script) return res.status(404).json({ error: "Guion no encontrado." });
  
      await script.destroy();
      res.status(200).json({ message: "Guion eliminado correctamente." });
    } catch (error) {
      console.error("Error eliminando guion:", error);
      res.status(500).json({ error: "Error interno al eliminar guion." });
    }
  });
  
  router.put("/:id/favorite", async (req, res) => {
  try {
    const { id } = req.params;
    const script = await Script.findByPk(id);
    if (!script) return res.status(404).json({ error: "Guion no encontrado." });

    script.isFavorite = !script.isFavorite;
    await script.save();

    res.status(200).json({
      message: `Guion ${script.isFavorite ? "marcado como favorito" : "quitado de favoritos"}.`,
      isFavorite: script.isFavorite,
    });
  } catch (error) {
    console.error("Error actualizando favorito:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// GET /api/scripts/:id/versions
router.get("/:id/versions", async (req, res) => {
  try {
    const { id } = req.params;
    const versions = await ScriptVersion.findAll({
      where: { scriptId: id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ versions });
  } catch (error) {
    console.error("Error cargando historial:", error);
    res.status(500).json({ error: "Error interno al obtener historial." });
  }
});

module.exports = router;