const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Script = require("../models/Script");
const User = require("../models/User");
const ScriptVersion = require("../models/ScriptVersion");
const SharedLink = require("../models/SharedLink"); // Importa el nuevo modelo
const Role = require("../models/Role"); 
const authMiddleware = require("../middlewares/authMiddleware"); // Asegúrate de tener un middleware de autenticación

// ----------------------------------------------------------------------
// NEW: Define the API_BASE_URL
const API_BASE_URL = "http://localhost:5000/api";
// ----------------------------------------------------------------------

router.post("/", async (req, res) => {
  try {
    const { email, title, content, tono, estilo } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const script = await Script.create({
      title,
      content,
      tono,
      estilo,
      userId: user.id,
    });

    res.status(201).json({ message: "Guion guardado correctamente.", script });
  } catch (error) {
    console.error("Error guardando guion:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// ➡️ GET /api/scripts - Get all scripts for the authenticated user
router.get("/", async (req, res) => {
    try {
        const userId = req.user.id;
    
        const scripts = await Script.findAll({
            where: { userId: userId },
            order: [["createdAt", "DESC"]],
            include: [{
                model: SharedLink,
                required: false, // Use a LEFT JOIN
            }],
        });

        // Format the response to be more useful for the frontend
        const scriptsWithShareStatus = scripts.map(script => {
            const plainScript = script.get({ plain: true });
            const sharedLink = plainScript.SharedLink;
            return {
                ...plainScript,
                isShared: !!(sharedLink && sharedLink.isActive),
                sharedToken: sharedLink ? sharedLink.uniqueToken : null,
            };
        });
    
        return res.status(200).json({ scripts: scriptsWithShareStatus });
    } catch (error) {
        console.error("Error obteniendo guiones:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

// ---


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

// ===========================================
// ENDPOINTS PARA COMPARTIR GUIONES
// ===========================================

// ➡️ POST /api/scripts/:id/share - Generar un enlace de solo lectura
// Protegido, solo el propietario del guion puede crear un enlace.
router.post("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email; // Asumiendo que tu authMiddleware adjunta el email del usuario al request

    // 1. Verificar si el guion existe y pertenece al usuario
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) return res.status(401).json({ error: "Acceso no autorizado." });
    
    const script = await Script.findOne({ where: { id, userId: user.id } });
    if (!script) return res.status(404).json({ error: "Guion no encontrado o no te pertenece." });

    // 2. Verificar si ya existe un enlace activo para este guion
    let sharedLink = await SharedLink.findOne({ where: { scriptId: id } });

    if (sharedLink) {
      // Si existe, actualiza su estado a activo
      sharedLink.isActive = true;
      await sharedLink.save();
    } else {
      // Si no existe, crea uno nuevo
      const uniqueToken = uuidv4();
      sharedLink = await SharedLink.create({
        scriptId: id,
        uniqueToken: uniqueToken,
      });
    }

    // 3. Generar y devolver el enlace completo
    const fullUrl = `http://localhost:3000/shared/${sharedLink.uniqueToken}`;
    res.status(201).json({
      message: "Enlace de guion generado correctamente.",
      link: fullUrl,
    });
  } catch (error) {
    console.error("Error creando enlace compartido:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ➡️ DELETE /api/scripts/:id/share - Desactivar un enlace compartido
// Protegido, solo el propietario puede desactivar el enlace.
router.delete("/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email; // Asumiendo middleware de autenticación

    // 1. Verificar propiedad
    const user = await User.findOne({ where: { email: userEmail } });
    const script = await Script.findOne({ where: { id, userId: user.id } });
    if (!script) return res.status(404).json({ error: "Guion no encontrado o no te pertenece." });

    // 2. Desactivar el enlace
    const result = await SharedLink.update(
      { isActive: false },
      { where: { scriptId: id, isActive: true } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ error: "Enlace compartido no encontrado o ya está inactivo." });
    }

    res.status(200).json({ message: "Enlace compartido desactivado correctamente." });
  } catch (error) {
    console.error("Error desactivando enlace compartido:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ===========================================
// FIN - ENDPOINTS PARA COMPARTIR GUIONES
// ===========================================

// ➡️ PUT /api/scripts/:id/publish - Publicar/despublicar un guion en el Muro
// Solo usuarios Premium pueden publicar.
router.put("/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    // CAMBIO CLAVE 1: Usa req.user.id para buscar el usuario y su rol
    const userId = req.user.id;
    const user = await User.findByPk(userId, { include: [{ model: Role, attributes: ['name'] }] });
    const userRoleName = user.Role ? user.Role.name : null;

    if (userRoleName !== "Premium") {
      return res.status(403).json({ error: "Necesitas un plan Premium para publicar guiones." });
    }
    
    // CAMBIO CLAVE 2: Verifica que el guion exista y pertenezca al usuario autenticado
    const script = await Script.findOne({ where: { id, userId: userId } });
    if (!script) {
      return res.status(404).json({ error: "Guion no encontrado o no te pertenece." });
    }
 
    // CAMBIO CLAVE 3: Altera el estado de isPublished
    // La solicitud PUT del frontend no necesita un cuerpo. 
    // La lógica de alternar el estado se maneja completamente en el backend.
    script.isPublished = !script.isPublished;
    await script.save();
 
    res.status(200).json({ message: `Guion ${script.isPublished ? "publicado" : "despublicado"} en el Muro.`, isPublished: script.isPublished });
  } catch (error) {
    console.error("Error al publicar/despublicar guion:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;