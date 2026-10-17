const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Script = require("./Script");

const ScriptVersion = sequelize.define("ScriptVersion", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "script_versions",
  timestamps: true,
});

Script.hasMany(ScriptVersion, { foreignKey: "scriptId", onDelete: "CASCADE" });
ScriptVersion.belongsTo(Script, { foreignKey: "scriptId" });

module.exports = ScriptVersion;