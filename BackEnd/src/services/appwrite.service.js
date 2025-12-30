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
   USER LOGIN (OTP_DATABASE)
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
      {
        phone,
        tries: 0,
      }
    );
  } catch (err) {
    error("saveUserLogin:", err.message);
    return null;
  }
}

/**
 * Update user profile (name, email)
 */
async function updateUserProfile(phone, data) {
  if (!databases) return null;

  try {
    const res = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.otpCollectionId,
      [Query.equal("phone", phone)]
    );

    if (res.total === 0) return null;

    return await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.otpCollectionId,
      res.documents[0].$id,
      data
    );
  } catch (err) {
    error("updateUserProfile:", err.message);
    return null;
  }
}

/* ====================================================
   MECHANIC LOGIN (mechanic_rigistr)
   ==================================================== */

async function saveMechanicLogin(phone) {
  if (!databases) return null;

  try {
    const existing = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      [Query.equal("Mobile_Number", phone)]
    );

    if (existing.total > 0) {
      return existing.documents[0];
    }

    return await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      ID.unique(),
      {
        Mobile_Number: phone,
      }
    );
  } catch (err) {
    error("saveMechanicLogin:", err.message);
    return null;
  }
}

/**
 * Update mechanic profile after registration
 */
async function updateMechanicProfile(phone, data) {
  if (!databases) return null;

  try {
    const res = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      [Query.equal("Mobile_Number", phone)]
    );

    if (res.total === 0) return null;

    return await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.mechanicCollectionId,
      res.documents[0].$id,
      data
    );
  } catch (err) {
    error("updateMechanicProfile:", err.message);
    return null;
  }
}

/* ====================================================
   SERVICE REQUESTS (user ↔ mechanic)
   ==================================================== */

async function createServiceRequest(data) {
  if (!databases) return null;

  try {
    return await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.serviceRequestCollectionId,
      ID.unique(),
      {
        ...data,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    );
  } catch (err) {
    error("createServiceRequest:", err.message);
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
  saveUserLogin,
  updateUserProfile,

  saveMechanicLogin,
  updateMechanicProfile,

  createServiceRequest,
  getUserHistory,
  getMechanicHistory,
};
