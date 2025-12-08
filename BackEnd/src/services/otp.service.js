// src/services/otp.service.js
const crypto = require('crypto');
const config = require('../config');
const { info } = require('../utils/logger');

// In-memory store for OTPs. Replace with Redis for production.
const otps = new Map();

/**
 * generateCode - six digits as string
 */
function generateCode() {
  // cryptographically secure
  const num = crypto.randomInt(100000, 999999);
  return String(num);
}

/**
 * createOtp(phone)
 * stores OTP for phone and returns the code
 */
function createOtp(phone) {
  const code = generateCode();
  const expiresAt = Date.now() + config.otpExpiryMinutes * 600 * 10000;
  otps.set(phone, { code, expiresAt, attempts: 0 });
  info(`OTP created for ${phone} expiresAt=${new Date(expiresAt).toISOString()}`);
  return code;
}

/**
 * verifyOtp(phone, code)
 * returns true if valid, otherwise false or throws
 */
function verifyOtp(phone, code) {
  const record = otps.get(phone);
  if (!record) return { ok: false, reason: 'not_found' };

  if (Date.now() > record.expiresAt) {
    otps.delete(phone);
    return { ok: false, reason: 'expired' };
  }

  record.attempts = (record.attempts || 0) + 1;
  if (record.attempts > 5) {
    otps.delete(phone);
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (record.code !== code) {
    otps.set(phone, record);
    return { ok: false, reason: 'invalid' };
  }

  // success -> remove
  otps.delete(phone);
  return { ok: true };
}

module.exports = { createOtp, verifyOtp };
