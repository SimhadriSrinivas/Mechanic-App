// src/controllers/mechanic.controller.js

const {
  updateMechanicProfile,
} = require("../services/appwrite.service");
const { encryptAadhaar } = require("../utils/crypto");

/**
 * Complete / Update mechanic profile
 * This is called AFTER mechanic login
 */
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

    // Basic validation
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
        message: "Aadhaar number must be 12 digits",
      });
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    // Encrypt Aadhaar
    const aadhaarEncrypted = encryptAadhaar(aadhaar);

    // Prepare update data (match Appwrite column names exactly)
    const updateData = {
      Name: `${firstName} ${lastName}`,
      TypeOfService: JSON.stringify(serviceTypes),
      Role: JSON.stringify(roles || []),
      TypeOfVehicle: JSON.stringify(vehicleTypes || []),
      Address: address,
      Aadhaar_Number: aadhaarEncrypted,
      latitude: Number(latitude),
      longitude: Number(longitude),
      profile_completed: true,
    };

    const updatedDoc = await updateMechanicProfile(phone, updateData);

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found. Please login again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mechanic profile updated successfully",
      mechanicId: updatedDoc.$id,
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
};
