// services/appwriteClient.ts

import { Client, Databases, Realtime } from "appwrite";

const client = new Client()
  .setEndpoint("https://YOUR-APPWRITE-ENDPOINT") // e.g. https://cloud.appwrite.io or self-hosted URL
  .setProject("YOUR_PROJECT_ID");

export const databases = new Databases(client);
export const realtime = new Realtime(client);

// Replace with your DB / Collection IDs
export const APPWRITE_DATABASE_ID = "DATABASE_ID";
export const REQUESTS_COLLECTION_ID = "REQUESTS_COLLECTION_ID";

// --- NEW: additional collection IDs for specialized flows ---
// EV requests (separate collection for EV mechanics)
export const EV_REQUESTS_COLLECTION_ID = "EV_REQUESTS_COLLECTION_ID";

// Nearby places collections (optional - useful if you store garages / centers)
export const GARAGES_COLLECTION_ID = "GARAGES_COLLECTION_ID";
export const SERVICE_CENTERS_COLLECTION_ID = "SERVICE_CENTERS_COLLECTION_ID";
