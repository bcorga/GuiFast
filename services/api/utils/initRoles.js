// utils/initRoles.js
const Role = require("../models/Role");

async function initRoles() {
  const roles = [
    { name: "Inicial", description: "Acceso básico a la plataforma" },
    { name: "Extra", description: "Funciones adicionales" },
    { name: "Premium", description: "Acceso completo y exclusivo" },
    { name: "Soporte", description: "Usuarios con permisos de soporte" },
    { name: "Administrador", description: "Control total del sistema" }
  ];

  for (const role of roles) {
    const [r, created] = await Role.findOrCreate({
      where: { name: role.name },
      defaults: { description: role.description }
    });
    if (created) {
      console.log(`✅ Rol creado: ${role.name}`);
    } else {
      console.log(`ℹ️ Rol existente: ${role.name}`);
    }
  }
}

module.exports = initRoles;