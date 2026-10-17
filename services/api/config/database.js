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

// Exportar solo el objeto sequelize
module.exports = sequelize;