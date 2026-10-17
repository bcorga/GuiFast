const { Sequelize } = require("sequelize");

// Si existe la variable DATABASE_URL (Producción), Sequelize se conecta directamente con el enlace completo.
// Si no existe (Tu entorno local), usa los datos por defecto que ya tenías.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false, // Desactivamos logging en producción para limpiar la consola
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Requerido por Supabase para conexiones seguras en producción
        }
      }
    })
  : new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST || "database", // Si usas docker local será "database"
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "ps1root",
      database: process.env.DB_NAME || "guion_platform",
      logging: true,
    });

module.exports = sequelize;
