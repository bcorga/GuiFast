const { Sequelize } = require("sequelize");

let sequelize;

// Si existe la variable DATABASE_URL (entorno de Railway), se conecta usando la URI completa
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false, // Desactivado en producción para mantener limpios los logs de Railway
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido por Supabase para conexiones seguras externas
      }
    }
  });
} else {
  // Si no existe (entorno local con Docker), utiliza la configuración que ya tenías
  sequelize = new Sequelize({
    dialect: "postgres",
    host: "database", // para utilizar postgres en docker local
    username: "postgres",
    password: "ps1root",
    database: "guion_platform",
    logging: true,
  });
}

// Exportar solo el objeto sequelize
module.exports = sequelize;
