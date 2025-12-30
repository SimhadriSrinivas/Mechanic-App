// services/evRequests.ts
import {
  databases,
  realtime,
  APPWRITE_DATABASE_ID,
  EV_REQUESTS_COLLECTION_ID,
} from "./appwriteClient";

type Unsubscribe = () => void;

export interface EvRequest {
  $id: string;
  userId: string;
  userPhone: string;
  service: string;
  vehicleType: string;
  lat: number;
  lng: number;
  status: string;
  createdAt: number;
  acceptedBy: string | null;
  mechanicInfo: any;
  mechanicLocation: { lat: number; lng: number; updatedAt: number } | null;
  mechanicType: string;
}

/**
 * createEvRequest -> stores EV-specific request in EV collection and returns document id
 */
export async function createEvRequest(payload: {
  userId: string;
  userPhone: string;
  service: string; // "EV Help"
  vehicleType: string; // car | bike
  lat: number;
  lng: number;
}) {
  const response = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    EV_REQUESTS_COLLECTION_ID,
    "unique()",
    {
      ...payload,
      status: "pending",
      createdAt: Date.now(),
      acceptedBy: null,
      mechanicInfo: null,
      mechanicLocation: null,
      mechanicType: "ev", // mark as ev mechanic
    }
  );
  return response.$id;
}

/**
 * listenEvRequest -> realtime subscribe to EV request doc changes
 * returns unsubscribe function
 */
export async function listenEvRequest(
  requestId: string,
  cb: (doc: any) => void
): Promise<Unsubscribe> {
  const path = `databases.${APPWRITE_DATABASE_ID}.collections.${EV_REQUESTS_COLLECTION_ID}.documents.${requestId}`;
  const subscription = await realtime.subscribe(path, (response: any) => {
    if (response?.payload) {
      cb(response.payload);
    }
  });

  return () => subscription.close();
}

/** update EV mechanic location (to be used by EV mechanic app) */
export async function updateEvMechanicLocation(
  requestId: string,
  lat: number,
  lng: number
) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    EV_REQUESTS_COLLECTION_ID,
    requestId,
    {
      mechanicLocation: { lat, lng, updatedAt: Date.now() },
    }
  );
}

/** mark EV request accepted by mechanic */
export async function acceptEvRequest(
  requestId: string,
  mechId: string,
  mechInfo: any
) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    EV_REQUESTS_COLLECTION_ID,
    requestId,
    {
      acceptedBy: mechId,
      status: "accepted",
      mechanicInfo: mechInfo,
    }
  );
}

/** cancel EV request */
export async function cancelEvRequest(requestId: string) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    EV_REQUESTS_COLLECTION_ID,
    requestId,
    {
      status: "cancelled",
    }
  );
}
