const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/userController");

router.put("/update", updateProfile);

module.exports = router;