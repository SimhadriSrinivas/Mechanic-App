// src/routes/auth.routes.js
const express = require('express');
const { sendOtpHandler, verifyOtpHandler } = require('../controllers/auth.controller');

const router = express.Router();

// POST /auth/send-otp
router.post('/send-otp', sendOtpHandler);

// POST /auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);

module.exports = router;
