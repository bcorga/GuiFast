// 📁 controllers/scriptController.js
const Script = require("../models/Script");

// Crear nuevo guion
exports.crearScript = async (req, res) => {
  const { title, content, estilo, userId } = req.body;
  if (!title || !content || !userId) return res.status(400).json({ error: "Faltan datos obligatorios." });

  try {
    const nuevo = await Script.create({ title, content, estilo, userId });
    res.status(201).json({ message: "Guion guardado exitosamente", guion: nuevo });
  } catch (err) {
    console.error("Error al crear guion:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los guiones de un usuario
exports.obtenerScriptsPorUsuario = async (req, res) => {
  const { userId } = req.params;
  try {
    const scripts = await Script.findAll({ where: { userId }, order: [["createdAt", "DESC"]] });
    res.json({ scripts });
  } catch (err) {
    console.error("Error al obtener scripts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar guion
exports.eliminarScript = async (req, res) => {
  const { id } = req.params;
  try {
    await Script.destroy({ where: { id } });
    res.json({ message: "Guion eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar guion:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar guion existente
exports.actualizarScript = async (req, res) => {
  const { id } = req.params;
  const { title, content, estilo } = req.body;
  try {
    const script = await Script.findByPk(id);
    if (!script) return res.status(404).json({ error: "Guion no encontrado" });

    script.title = title;
    script.content = content;
    script.estilo = estilo;
    await script.save();

    res.json({ message: "Guion actualizado exitosamente", script });
  } catch (err) {
    console.error("Error al actualizar guion:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Marcar/desmarcar favorito
exports.marcarFavorito = async (req, res) => {
  const { id } = req.params;
  try {
    const script = await Script.findByPk(id);
    if (!script) return res.status(404).json({ error: "Guion no encontrado" });

    script.isFavorite = !script.isFavorite;
    await script.save();

    res.json({ message: "Estado de favorito actualizado", favorito: script.isFavorite });
  } catch (err) {
    console.error("Error al cambiar favorito:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener solo favoritos
exports.obtenerFavoritos = async (req, res) => {
  const { userId } = req.params;
  try {
    const scripts = await Script.findAll({ where: { userId, isFavorite: true }, order: [["updatedAt", "DESC"]] });
    res.json({ scripts });
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
