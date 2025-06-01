const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "postgres",
  //host: "localhost", Esta linea es cuando utilziamos postgres en local
  host: "database", //para utilizar postgres en docker
  username: "postgres",
  password: "ps1root",
  database: "guion_platform",
  logging: true, // Puedes poner `true` para ver los logs de la SQL en consola
});

// Probar la conexión
const authenticateDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida con éxito.");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos:", error);
  }
};


const User = require("../models/User"); // importa el modelo

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // o { force: true } para recrear las tablas
    console.log("Base de datos sincronizada correctamente.");
  } catch (error) {
    console.error("Error al sincronizar la base de datos:", error);
  }
};

authenticateDatabase();
syncDatabase();

// Exportar solo el objeto sequelize
module.exports = sequelize;