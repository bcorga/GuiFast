const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const { register } = require("../controllers/authController");

// Ruta para iniciar sesión
router.post("/login", login);

// Ruta para registrar un nuevo usuario
router.post("/register", register);


module.exports = router;