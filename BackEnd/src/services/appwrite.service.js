// src/services/appwrite.service.js

const { Client, Databases, Query, ID } = require("node-appwrite");
const config = require("../config");
const { info, error } = require("../utils/logger");

let client = null;
let databases = null;

/* ================= APPWRITE CLIENT ================= */

if (
  config.appwrite.endpoint &&
  config.appwrite.projectId &&
  config.appwrite.apiKey
) {
  client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);

  databases = new Databases(client);
  info("Appwrite connected");
}

/* ====================================================
   USER LOGIN
   ==================================================== */

async function saveUserLogin(phone) {
  if (!databases) return null;

  try {
    const existing = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.otpCollectionId,
      [Query.equal("phone", phone)]
    );

    if (existing.total > 0) {
      return existing.documents[0];
    }

    return await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.otpCollectionId,
      ID.unique(),
      { phone, tries: 0 }
    );
  } catch (err) {
    error("saveUserLogin:", err.message);
    return null;
  }
}

/* ====================================================
   MECHANIC PROFILE (VIEW + EDIT)
   ==================================================== */

/**
 * Get mechanic profile by phone
 */
async function getMechanicByPhone(phone) {
  if (!databases) return null;

  try {
    const res = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      [Query.equal("Mobile_Number", phone)]
    );

    return res.total > 0 ? res.documents[0] : null;
  } catch (err) {
    error("getMechanicByPhone:", err.message);
    return null;
  }
}

/**
 * Create mechanic on first login
 */
async function saveMechanicLogin(phone) {
  if (!databases) return null;

  try {
    const existing = await getMechanicByPhone(phone);
    if (existing) return existing;

    return await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      ID.unique(),
      {
        Mobile_Number: phone,
        profile_completed: false,
      }
    );
  } catch (err) {
    error("saveMechanicLogin:", err.message);
    return null;
  }
}

/**
 * Update mechanic profile (EDITABLE BY USER)
 * 🔒 Only allowed fields are updated
 */
async function updateMechanicProfile(phone, data) {
  if (!databases) return null;

  try {
    const mechanic = await getMechanicByPhone(phone);
    if (!mechanic) return null;

    // 🔒 Allow ONLY these fields to be edited
    const allowedFields = {
      Name: data.Name,
      Address: data.Address,
      TypeOfService: data.TypeOfService,
      TypeOfVehicle: data.TypeOfVehicle,
      latitude: data.latitude,
      longitude: data.longitude,
      Aadhaar_Number: data.Aadhaar_Number,
    };

    // Remove undefined values
    Object.keys(allowedFields).forEach(
      (key) => allowedFields[key] === undefined && delete allowedFields[key]
    );

    return await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      mechanic.$id,
      allowedFields
    );
  } catch (err) {
    error("updateMechanicProfile:", err.message);
    return null;
  }
}

/**
 * Mark profile completed
 */
async function markMechanicProfileCompleted(phone) {
  if (!databases) return null;

  try {
    const mechanic = await getMechanicByPhone(phone);
    if (!mechanic) return null;

    return await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      mechanic.$id,
      { profile_completed: true }
    );
  } catch (err) {
    error("markMechanicProfileCompleted:", err.message);
    return null;
  }
}

/* ====================================================
   SERVICE REQUESTS
   ==================================================== */

async function createServiceRequest(data) {
  if (!databases) return null;

  try {
    const document = {
      user_phone: data.user_phone,
      user_lat: data.user_lat,
      user_lng: data.user_lng,
      mechanic_phone: data.mechanic_phone ?? null,
      mechanic_lat: data.mechanic_lat ?? null,
      mechanic_lng: data.mechanic_lng ?? null,
      status: "pending",
      createdAt: data.createdAt,
    };

    info("📦 Creating service request:", document);

    return await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.serviceRequestCollectionId,
      ID.unique(),
      document
    );
  } catch (err) {
    error("createServiceRequest:", err.message);
    return null;
  }
}

async function getAllServiceRequests() {
  if (!databases) return null;

  return databases.listDocuments(
    config.appwrite.databaseId,
    config.appwrite.serviceRequestCollectionId
  );
}

async function getServiceRequestById(requestId) {
  if (!databases) return null;

  try {
    return await databases.getDocument(
      config.appwrite.databaseId,
      config.appwrite.serviceRequestCollectionId,
      requestId
    );
  } catch {
    return null;
  }
}

async function updateServiceRequest(requestId, data) {
  if (!databases) return null;

  try {
    return await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.serviceRequestCollectionId,
      requestId,
      data
    );
  } catch (err) {
    error("updateServiceRequest:", err.message);
    return null;
  }
}

async function getUserHistory(phone) {
  return databases.listDocuments(
    config.appwrite.databaseId,
    config.appwrite.serviceRequestCollectionId,
    [Query.equal("user_phone", phone)]
  );
}

async function getMechanicHistory(phone) {
  return databases.listDocuments(
    config.appwrite.databaseId,
    config.appwrite.serviceRequestCollectionId,
    [Query.equal("mechanic_phone", phone)]
  );
}

/* ================= EXPORTS ================= */

module.exports = {
  // User
  saveUserLogin,

  // Mechanic
  saveMechanicLogin,
  getMechanicByPhone,
  updateMechanicProfile,
  markMechanicProfileCompleted,

  // Service Requests
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  getUserHistory,
  getMechanicHistory,
};
