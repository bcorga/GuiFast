// models/Script.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Script = sequelize.define("Script", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false 
  },
  estilo: {
    type: DataTypes.STRING,
    defaultValue: "general" 
  }
}, {
  tableName: "scripts",
  timestamps: true,
});

// Relación: Un usuario tiene muchos guiones
User.hasMany(Script, { foreignKey: "userId" });
Script.belongsTo(User, { foreignKey: "userId" });

module.exports = Script;