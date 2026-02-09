// src/routes/service.routes.js

const express = require("express");
const router = express.Router();

const {
  createRequest,
  acceptRequest,
  getActiveServiceRequests,
  userHistory,
  mechanicHistory,
} = require("../controllers/service.controller");

/*
|--------------------------------------------------------------------------
| SERVICE REQUEST ROUTES
|--------------------------------------------------------------------------
| Base path mounted in app.js as:
| app.use("/service", serviceRoutes);
|--------------------------------------------------------------------------
*/

/**
 * ================================
 * USER ROUTES
 * ================================
 */

// User creates a service request
router.post("/create", createRequest);

// User service history
router.get("/user-history", userHistory);

/**
 * ================================
 * MECHANIC ROUTES
 * ================================
 */

// 🔴 MOST IMPORTANT ROUTE (THIS FIXES YOUR ERROR)
// Get all pending requests + accepted request for this mechanic
router.get("/", getActiveServiceRequests);

// Mechanic accepts a request
router.post("/accept", acceptRequest);

// Mechanic service history
router.get("/mechanic-history", mechanicHistory);

module.exports = router;
