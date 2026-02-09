// src/controllers/service.controller.js

const {
  createServiceRequest,
  getUserHistory,
  getMechanicHistory,
  getServiceRequestById,
  updateServiceRequest,
  getAllServiceRequests,
} = require("../services/appwrite.service");

/**
 * ================================
 * USER CREATES SERVICE REQUEST
 * ================================
 */
async function createRequest(req, res) {
  try {
    const { user_phone, user_lat, user_lng } = req.body;

    if (!user_phone || user_lat === undefined || user_lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const payload = {
      user_phone: String(user_phone),
      user_lat: Number(user_lat),
      user_lng: Number(user_lng),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const request = await createServiceRequest(payload);

    if (!request) {
      return res.status(500).json({
        success: false,
        message: "Failed to create service request",
      });
    }

    return res.status(201).json({
      success: true,
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
 * ================================
 * MECHANIC ACCEPTS REQUEST
 * ================================
 */
async function acceptRequest(req, res) {
  try {
    const { requestId, mechanic_phone, mechanic_lat, mechanic_lng } = req.body;

    if (!requestId || !mechanic_phone) {
      return res.status(400).json({
        success: false,
        message: "requestId and mechanic_phone are required",
      });
    }

    const existing = await getServiceRequestById(requestId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (existing.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Request already accepted",
      });
    }

    const updated = await updateServiceRequest(requestId, {
      status: "accepted",
      mechanic_phone: String(mechanic_phone),
      mechanic_lat: mechanic_lat ?? null,
      mechanic_lng: mechanic_lng ?? null,
      acceptedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("acceptRequest error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * ================================
 * MECHANIC ACTIVE REQUESTS
 * ================================
 */
async function getActiveServiceRequests(req, res) {
  try {
    const { mechanicPhone } = req.query;

    if (!mechanicPhone) {
      return res.status(400).json({
        success: false,
        message: "mechanicPhone is required",
      });
    }

    const all = await getAllServiceRequests();

    const filtered = all.documents.filter(
      (r) =>
        r.status === "pending" ||
        (r.status === "accepted" && r.mechanic_phone === mechanicPhone)
    );

    return res.json({
      success: true,
      requests: filtered,
    });
  } catch (err) {
    console.error("getActiveServiceRequests error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * ================================
 * HISTORY
 * ================================
 */
async function userHistory(req, res) {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ success: false });

  const history = await getUserHistory(phone);
  return res.json({ success: true, data: history.documents });
}

async function mechanicHistory(req, res) {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ success: false });

  const history = await getMechanicHistory(phone);
  return res.json({ success: true, data: history.documents });
}

module.exports = {
  createRequest,
  acceptRequest,
  getActiveServiceRequests,
  userHistory,
  mechanicHistory,
};
