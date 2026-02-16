// src/routes/service.routes.js

const express = require("express");
const router = express.Router();

const {
  createRequest,
  cancelRequest,
  acceptRequest,
  updateMechanicLocation,
  getActiveServiceRequests,
  getServiceRequestByIdController,
  userHistory,
  mechanicHistory,
} = require("../controllers/service.controller");

/*
|--------------------------------------------------------------------------
| SERVICE REQUEST ROUTES
|--------------------------------------------------------------------------
| Mounted in app.js as:
| app.use("/api/service", serviceRoutes);
|--------------------------------------------------------------------------
*/

/* =====================================================
   USER ROUTES
===================================================== */

// Create request
router.post("/create", createRequest);

// Cancel request
router.post("/cancel", cancelRequest);

// User history (MUST come before /:id)
router.get("/user-history", userHistory);

// Get single request by ID (FOR POLLING)
router.get("/request/:id", getServiceRequestByIdController);

/* =====================================================
   MECHANIC ROUTES
===================================================== */

// Get pending + accepted requests
router.get("/", getActiveServiceRequests);

// Accept request
router.post("/accept", acceptRequest);

// Update live mechanic location
router.post("/update-location", updateMechanicLocation);

// Mechanic history
router.get("/mechanic-history", mechanicHistory);

module.exports = router;
