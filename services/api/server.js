const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar y usar rutas de autenticación
const authRoutes = require('./routes/auth'); // Asegúrate que el path sea correcto
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡El backend está funcionando!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const scriptRoutes = require("./routes/scripts");
app.use("/api/scripts", scriptRoutes);

const sequelize = require("./config/database");
const User = require("./models/User");
const Script = require("./models/Script");

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

// Sincronizar modelos
sequelize.sync({ alter: true })  // Usa alter solo en desarrollo
  .then(() => console.log("Tablas sincronizadas"))
  .catch(err => console.error("Error al sincronizar tablas:", err));