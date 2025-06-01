const bcrypt = require("bcrypt");
const User = require("../models/User");
const Role = require("../models/Role");

// Endpoint para autenticar al usuario
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ where: { email },include: { model: Role, attributes: ['name'] } });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
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
        const { username, email, password, roleId} = req.body;
    
        // Verificar que todos los campos están presentes
        if (!username || !email || !password) {
          return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }
    
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email }, include: { model: Role, attributes: ['name'] } });
        if (existingUser) {
          return res.status(400).json({ error: "El correo ya está registrado." });
        }
    
        // Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, 10);
    
        // Crear el nuevo usuario
        const newUser = await User.create({ username, email, password_hash: passwordHash, roleId: roleId || null });
    
        res.status(201).json({ message: "Usuario creado exitosamente", user: newUser });
      } catch (error) {
        console.error("Error registrando usuario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
      }
    };