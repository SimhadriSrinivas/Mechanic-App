// src/controllers/mechanic.controller.js

const {
  updateMechanicProfile,
  getMechanicByPhone,
} = require("../services/appwrite.service");

const { encryptAadhaar } = require("../utils/crypto");

/* =====================================
   GET MECHANIC PROFILE
   ===================================== */
async function getMechanicProfile(req, res) {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const mechanic = await getMechanicByPhone(phone);

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }

    return res.json({
      success: true,
      data: {
        name: mechanic.Name || "",
        phone: mechanic.Mobile_Number,
        rating: mechanic.rating ?? 4.5,
        service: mechanic.TypeOfService || "",
        address: mechanic.Address || "",
      },
    });
  } catch (err) {
    console.error("getMechanicProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/* =====================================
   UPDATE MECHANIC PROFILE (EDIT)
   ===================================== */
async function updateMechanicProfileController(req, res) {
  try {
    const {
      phone,
      name,
      service,
      address,
    } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const updateData = {};

    if (name) updateData.Name = name;
    if (service) updateData.TypeOfService = service;
    if (address) updateData.Address = address;

    const updated = await updateMechanicProfile(phone, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("updateMechanicProfileController error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/* =====================================
   REGISTER MECHANIC (INITIAL)
   ===================================== */
async function registerMechanic(req, res) {
  try {
    const {
      firstName,
      lastName,
      phone,
      serviceTypes,
      roles,
      vehicleTypes,
      address,
      aadhaar,
      latitude,
      longitude,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !Array.isArray(serviceTypes) ||
      serviceTypes.length === 0 ||
      !address ||
      !aadhaar
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
      });
    }

    if (aadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar must be 12 digits",
      });
    }

    const aadhaarEncrypted = encryptAadhaar(aadhaar);

    const updateData = {
      Name: `${firstName} ${lastName}`,
      TypeOfService: serviceTypes.join(", "),
      Role: Array.isArray(roles) ? roles.join(", ") : "",
      TypeOfVehicle: Array.isArray(vehicleTypes)
        ? vehicleTypes.join(", ")
        : "",
      Address: address,
      Aadhaar_Number: aadhaarEncrypted,
      latitude: Number(latitude),
      longitude: Number(longitude),
      profile_completed: true,
    };

    const updated = await updateMechanicProfile(phone, updateData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found. Login again.",
      });
    }

    return res.json({
      success: true,
      message: "Mechanic profile registered successfully",
    });
  } catch (err) {
    console.error("registerMechanic error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  registerMechanic,
  getMechanicProfile,
  updateMechanicProfileController, // ✅ THIS WAS MISSING
};
