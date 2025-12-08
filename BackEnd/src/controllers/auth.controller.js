// src/controllers/auth.controller.js
const { sendSms } = require('../services/twilio.service');
const { createOtp, verifyOtp } = require('../services/otp.service');
const { saveUserByPhone } = require('../services/appwrite.service'); // ✅ correct
const rateLimiter = require('../utils/rateLimiter');
const { info } = require('../utils/logger');


async function sendOtpHandler(req, res) {
  try {
    // ensure body parser is enabled (express.json)
    const phone = req.body && req.body.phone;
    if (!phone) return res.status(400).json({ message: 'phone is required in body (E.164), e.g. +919000258071' });

    // basic rate-limit per IP (and you can add per-phone)
    try {
      await rateLimiter.consume(req.ip);
    } catch (rlRejected) {
      return res.status(429).json({ message: 'Too many requests. Slow down.' });
    }

    // create OTP and send via Twilio
    const code = createOtp(phone);
    const text = `Your MEC app OTP is: ${code}. It will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.`;
    await sendSms(phone, text);

    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error('sendOtpHandler error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message || String(err) });
  }
}

async function verifyOtpHandler(req, res) {
  try {
    const phone = req.body && req.body.phone;
    const otp = req.body && req.body.otp;
    if (!phone || !otp) return res.status(400).json({ message: 'phone and otp are required in body' });

    const result = verifyOtp(phone, String(otp));
    if (!result.ok) {
      return res.status(400).json({ ok: false, reason: result.reason });
    }

    // optional: save user to Appwrite and return doc
    const doc = await saveUserByPhone(phone);

    // success response (you may create a JWT here for client)
    return res.json({ ok: true, message: 'OTP verified', user: doc || { phone } });
  } catch (err) {
    console.error('verifyOtpHandler error', err);
    return res.status(500).json({ message: 'Server error', detail: err.message || String(err) });
  }
}

module.exports = { sendOtpHandler, verifyOtpHandler };
