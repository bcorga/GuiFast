const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require("bcrypt");

const sequelize = require("./config/database");
const User = require("./models/User");
const Role = require("./models/Role");
const Script = require("./models/Script");
const ScriptVersion = require("./models/ScriptVersion");

// Importar initRoles
const initRoles = require("./utils/initRoles");

// Middlewares
app.use(cors());
app.use(express.json());

// Importar y usar rutas de autenticación
const authRoutes = require('./routes/auth'); // Asegúrate que el path sea correcto
app.use('/api/auth', authRoutes);

const scriptRoutes = require("./routes/scripts");
app.use("/api/scripts", scriptRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const contactoRoutes = require("./routes/contact");
app.use("/api/contacto", contactoRoutes);

const purchaseRoutes = require("./routes/purchase");
app.use("/api/purchase", purchaseRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡El backend está funcionando!');
});

// Sincronizar modelos y luego inicializar roles
sequelize.sync({ alter: true }) // ⚠️ alter solo en desarrollo
  .then(async () => {
    console.log("✅ Tablas sincronizadas");
    await initRoles();  // <---- Aquí se ejecuta
    console.log("✅ Roles inicializados");
  // Crear usuario admin si no existe
    const adminRole = await Role.findOne({ where: { name: "Administrador" } });
    if (adminRole) {
      const [admin, created] = await User.findOrCreate({
        where: { email: "admin@miapp.com" }, // <-- cambia el email
        defaults: {
          username: "admin",
          password_hash: await bcrypt.hash("123", 10), // <-- cambia el password
          roleId: adminRole.id,
          verified: true
        }
      });

      if (created) {
        console.log("✅ Usuario administrador creado");
      } else {
        console.log("ℹ️ Usuario administrador ya existe");
      }
    }
  })
  .catch(err => console.error("❌ Error al sincronizar tablas:", err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});