// src/routes/mechanic.routes.js

const express = require("express");
const {
  registerMechanic,
} = require("../controllers/mechanic.controller");

const router = express.Router();

/**
 * POST /api/mechanic/register
 * Complete mechanic profile after login
 */
router.post("/register", registerMechanic);

/**
 * Future:
 * PUT /api/mechanic/update-location
 * - update mechanic latitude & longitude when online
 */
// router.put("/update-location", updateMechanicLocation);

module.exports = router;
