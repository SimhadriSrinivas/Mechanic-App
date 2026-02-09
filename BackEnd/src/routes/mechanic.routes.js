// src/routes/mechanic.routes.js

const express = require("express");
const router = express.Router();

const {
  registerMechanic,
  getMechanicProfile,
  updateMechanicProfileController,
} = require("../controllers/mechanic.controller");

/* ================= ROUTES ================= */

// Register / complete profile
router.post("/register", registerMechanic);

// Get profile
router.get("/profile", getMechanicProfile);

// Update profile (edit)
router.put("/profile", updateMechanicProfileController);

module.exports = router;
