// src/controllers/service.controller.js

const {
  createServiceRequest,
  getUserHistory,
  getMechanicHistory,
} = require("../services/appwrite.service");

/**
 * User creates service request to a mechanic
 */
async function createRequest(req, res) {
  try {
    const {
      userPhone,
      mechanicPhone,
      userLat,
      userLng,
      mechanicLat,
      mechanicLng,
    } = req.body;

    if (
      !userPhone ||
      !mechanicPhone ||
      userLat === undefined ||
      userLng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const request = await createServiceRequest({
      user_phone: userPhone,
      mechanic_phone: mechanicPhone,
      user_lat: Number(userLat),
      user_lng: Number(userLng),
      mechanic_lat: mechanicLat ? Number(mechanicLat) : null,
      mechanic_lng: mechanicLng ? Number(mechanicLng) : null,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Service request created",
      data: request,
    });
  } catch (err) {
    console.error("createRequest error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * User request history
 */
async function userHistory(req, res) {
  try {
    const phone = req.query.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const history = await getUserHistory(phone);

    return res.json({
      success: true,
      data: history.documents,
    });
  } catch (err) {
    console.error("userHistory error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Mechanic request history
 */
async function mechanicHistory(req, res) {
  try {
    const phone = req.query.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const history = await getMechanicHistory(phone);

    return res.json({
      success: true,
      data: history.documents,
    });
  } catch (err) {
    console.error("mechanicHistory error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  createRequest,
  userHistory,
  mechanicHistory,
};
