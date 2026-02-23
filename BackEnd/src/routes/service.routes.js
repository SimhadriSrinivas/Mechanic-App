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

// ✅ Create new service request
router.post("/create", createRequest);

// ✅ Cancel service request
router.post("/cancel", cancelRequest);

// ✅ Get specific request by ID (Polling)
router.get("/request/:id", getServiceRequestByIdController);

// ✅ Get user service history
router.get("/user-history", userHistory);


/* =====================================================
   MECHANIC ROUTES
===================================================== */

// ✅ Accept a pending request
router.post("/accept", acceptRequest);

// ✅ Update live mechanic GPS location
router.post("/update-location", updateMechanicLocation);

// ✅ Get mechanic history
router.get("/mechanic-history", mechanicHistory);

// ✅ Get active service requests (KEEP LAST GET ROUTE)
router.get("/", getActiveServiceRequests);

module.exports = router;
