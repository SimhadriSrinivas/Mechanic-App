// src/controllers/service.controller.js

const {
  createServiceRequest,
  getUserHistory,
  getMechanicHistory,
  getServiceRequestById,
  updateServiceRequest,
  getAllServiceRequests,
} = require("../services/appwrite.service");

/* =====================================
   CREATE REQUEST
===================================== */
async function createRequest(req, res) {
  try {
    const {
      user_phone,
      user_lat,
      user_lng,
      service,
      vehicle_type,
    } = req.body;

    if (
      !user_phone ||
      user_lat === undefined ||
      user_lng === undefined ||
      !service ||
      !vehicle_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const payload = {
      user_phone: String(user_phone),
      user_lat: Number(user_lat),
      user_lng: Number(user_lng),
      service: String(service),
      vehicle_type: String(vehicle_type),
      status: "pending",
      mechanic_phone: null,
      mechanic_lat: null,
      mechanic_lng: null,
      acceptedAt: null,
      call_started_at: null,
      call_completed_at: null,
      cancelled_by: null,
      amount: null,
    };

    const request = await createServiceRequest(payload);

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

/* =====================================
   GET REQUEST BY ID
===================================== */
async function getServiceRequestByIdController(req, res) {
  try {
    const { id } = req.params;

    const request = await getServiceRequestById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (err) {
    console.error("getServiceRequestById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/* =====================================
   CANCEL REQUEST
===================================== */
async function cancelRequest(req, res) {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "requestId is required",
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
        message: "Cannot cancel this request",
      });
    }

    const updated = await updateServiceRequest(requestId, {
      status: "cancelled",
      cancelled_by: "user",
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("cancelRequest error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/* =====================================
   ACCEPT REQUEST
===================================== */
async function acceptRequest(req, res) {
  try {
    const { requestId, mechanic_phone, mechanic_lat, mechanic_lng } =
      req.body;

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

    // 🔥 Important: prevent double accept
    if (existing.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Request already accepted or closed",
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

/* =====================================
   UPDATE MECHANIC LOCATION
===================================== */
async function updateMechanicLocation(req, res) {
  try {
    const { requestId, mechanic_lat, mechanic_lng } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "requestId is required",
      });
    }

    const existing = await getServiceRequestById(requestId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const updated = await updateServiceRequest(requestId, {
      mechanic_lat,
      mechanic_lng,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("updateMechanicLocation error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/* =====================================
   GET ACTIVE REQUESTS (MECHANIC)
===================================== */
async function getActiveServiceRequests(req, res) {
  try {
    const { mechanicPhone } = req.query;

    if (!mechanicPhone) {
      return res.status(400).json({
        success: false,
        message: "mechanicPhone is required",
      });
    }

    const result = await getAllServiceRequests();

    const documents = result?.documents || [];

    // 🔥 Show:
    // 1. All pending requests
    // 2. Accepted requests only if accepted by this mechanic

    const filtered = documents.filter((r) => {
      if (r.status === "pending") return true;

      if (
        r.status === "accepted" &&
        r.mechanic_phone === mechanicPhone
      )
        return true;

      return false;
    });

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

/* =====================================
   HISTORY
===================================== */
async function userHistory(req, res) {
  try {
    const phone = req.query.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    const history = await getUserHistory(phone);

    return res.json({
      success: true,
      data: history?.documents || [],
    });
  } catch (err) {
    console.error("userHistory error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function mechanicHistory(req, res) {
  try {
    const phone = req.query.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    const history = await getMechanicHistory(phone);

    return res.json({
      success: true,
      data: history?.documents || [],
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
  getServiceRequestByIdController,
  cancelRequest,
  acceptRequest,
  updateMechanicLocation,
  getActiveServiceRequests,
  userHistory,
  mechanicHistory,
};
