// services/appwriteClient.ts

import { Client, Databases, Realtime } from "appwrite";

/* ================= APPWRITE CLIENT ================= */

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("692d29f20030da54db2d");

/* ================= SERVICES ================= */

export const databases = new Databases(client);
export const realtime = new Realtime(client);

/* ================= DATABASE & COLLECTION IDS ================= */

/**
 * Primary database
 */
export const APPWRITE_DATABASE_ID = "692d76ce00304286ce3d";

/**
 * Main service requests collection (ICE vehicles)
 */
export const REQUESTS_COLLECTION_ID = "service_requests";

/**
 * EV service requests collection
 * (keep separate for EV-specific workflows)
 */
export const EV_REQUESTS_COLLECTION_ID = "ev_service_requests";

/**
 * Optional: nearby garages collection
 */
export const GARAGES_COLLECTION_ID = "garages";

/**
 * Optional: nearby service centers collection
 */
export const SERVICE_CENTERS_COLLECTION_ID = "service_centers";

/* ================= EXPORT CLIENT (OPTIONAL) ================= */
/**
 * Export client only if needed elsewhere
 */
export default client;