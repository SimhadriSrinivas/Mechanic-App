// src/controllers/auth.controller.js

const { sendSms } = require("../services/twilio.service");
const { createOtp, verifyOtp } = require("../services/otp.service");
const {
  saveUserLogin,
  saveMechanicLogin,
} = require("../services/appwrite.service");
const rateLimiter = require("../utils/rateLimiter");
const { info, error } = require("../utils/logger");

/* ====================================================
   SEND OTP
   ==================================================== */

async function sendOtpHandler(req, res) {
  try {
    const phone = req.body?.phone;

    if (!phone) {
      return res.status(400).json({
        message: "phone is required in E.164 format (ex: +919876543210)",
      });
    }

    //  Rate limit per IP
    try {
      await rateLimiter.consume(req.ip);
    } catch {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    //  Generate OTP
    const code = createOtp(phone);

    //  Send SMS
    const text = `Your MEC App OTP is ${code}. It expires in ${
      process.env.OTP_EXPIRY_MINUTES || 5
    } minutes.`;

    await sendSms(phone, text);

    info("OTP sent to", phone);

    return res.json({ ok: true, message: "OTP sent" });
  } catch (err) {
    error("sendOtpHandler:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

/* ====================================================
   VERIFY OTP (ROLE BASED)
   ==================================================== */

async function verifyOtpHandler(req, res) {
  try {
    const phone = req.body?.phone;
    const otp = req.body?.otp;
    const role = req.body?.role; //  IMPORTANT

    if (!phone || !otp || !role) {
      return res.status(400).json({
        message: "phone, otp and role are required",
      });
    }

    if (!["user", "mechanic"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    //  Verify OTP
    const result = verifyOtp(phone, String(otp));

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        reason: result.reason,
      });
    }

    //  ROLE BASED SAVE
    let profile = null;

    if (role === "user") {
      profile = await saveUserLogin(phone);
    }

    if (role === "mechanic") {
      profile = await saveMechanicLogin(phone);
    }

    return res.json({
      ok: true,
      message: "OTP verified",
      role,
      profile: profile || { phone },
    });
  } catch (err) {
    error("verifyOtpHandler:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  sendOtpHandler,
  verifyOtpHandler,
};