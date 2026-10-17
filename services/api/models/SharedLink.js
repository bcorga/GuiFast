// models/SharedLink.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Script = require("./Script");

const SharedLink = sequelize.define("SharedLink", {
  // ID único para el enlace compartido, usamos UUID para mayor seguridad
  // y para que sea difícil de adivinar.
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // El token único que aparecerá en la URL.
  uniqueToken: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true, // Asegura que no haya tokens duplicados
  },
  // Estado del enlace: activo o inactivo (para dejar de compartir).
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  // Campo para almacenar el ID del guion al que pertenece este enlace.
  scriptId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Script,
      key: "id",
    },
    unique: true, // Un guion solo puede tener un enlace compartido activo a la vez.
  },
}, {
  tableName: "shared_links",
  timestamps: true,
});

// Relación: Un guion tiene un enlace compartido
Script.hasOne(SharedLink, { foreignKey: "scriptId", onDelete: "CASCADE" });
SharedLink.belongsTo(Script, { foreignKey: "scriptId" });

module.exports = SharedLink;