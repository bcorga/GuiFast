const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  const { email, username, avatar, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.username = username || user.username;
    user.avatar = avatar || user.avatar;

    if (newPassword) {
      user.password_hash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({ message: "Perfil actualizado", username: user.username, avatar: user.avatar });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};