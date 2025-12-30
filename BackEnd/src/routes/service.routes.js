// src/routes/service.routes.js

const express = require("express");
const {
  createRequest,
  userHistory,
  mechanicHistory,
} = require("../controllers/service.controller");

const router = express.Router();

/**
 * POST /api/service/request
 * User sends request to mechanic
 */
router.post("/request", createRequest);

/**
 * GET /api/service/user-history?phone=+9198xxxxxxx
 */
router.get("/user-history", userHistory);

/**
 * GET /api/service/mechanic-history?phone=+9198xxxxxxx
 */
router.get("/mechanic-history", mechanicHistory);

module.exports = router;
