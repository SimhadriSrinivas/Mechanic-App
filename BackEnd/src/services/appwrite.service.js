// src/services/appwrite.service.js
const sdk = require('node-appwrite');
const config = require('../config');
const { info, error } = require('../utils/logger');

let client = null;
let databases = null;

if (config.appwrite.endpoint && config.appwrite.apiKey && config.appwrite.projectId) {
  client = new sdk.Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);

  databases = new sdk.Databases(client);
}

/**
 * saveUserByPhone
 * - If a document with this phone already exists, return that document.
 * - Otherwise, create a new document with { phone, tries: 0 }.
 */
async function saveUserByPhone(phone) {
  if (!databases) {
    info('Appwrite not configured - skipping saveUserByPhone');
    return null;
  }

  try {
    // 1) Check if user already exists (phone is unique or indexed)
    const existing = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.collectionId,
      [sdk.Query.equal('phone', phone)]  // filter by phone
    );

    if (existing.total > 0) {
      const doc = existing.documents[0];
      info('User already exists in Appwrite, returning existing doc:', doc.$id);
      return doc; // ✅ no new record
    }

    // 2) If not found, create a new user document
    const docId = sdk.ID.unique();
    const data = {
      phone,        // required string
      tries: 0      // integer, default 0
    };

    const doc = await databases.createDocument(
      config.appwrite.databaseId,
      config.appwrite.collectionId,
      docId,
      data
    );

    info('Created new user in Appwrite:', doc.$id);
    return doc;
  } catch (err) {
    error('Appwrite saveUserByPhone error:', err.message || err);
    return null;
  }
}

module.exports = { saveUserByPhone };
