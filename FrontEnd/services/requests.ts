// services/requests.ts

import api from "./api";

// ✅ Appwrite imports
import {
  databases,
  realtime,
  APPWRITE_DATABASE_ID,
  REQUESTS_COLLECTION_ID,
} from "./appwriteClient";

type Unsubscribe = () => void;

/* ================= TYPES ================= */

export type UserLocation = {
  lat: number;
  lng: number;
};

export type MechanicLocation = {
  lat: number;
  lng: number;
  updatedAt: number;
};

export type CreateRequestPayload = {
  userPhone: string;
  service: string;
  vehicleType: string;
  lat: number;
  lng: number;
};

/* ================= BACKEND RESPONSE TYPE ================= */

type CreateRequestResponse = {
  success: boolean;
  message: string;
  data?: {
    $id: string;
  };
};

/* ================= CREATE REQUEST ================= */
/**
 * Creates service request in backend
 * Returns requestId
 */
export async function createRequest(
  payload: CreateRequestPayload
): Promise<string> {
  // 🔒 Build body explicitly (NO typo possible)
  const body = {
    user_phone: payload.userPhone,
    user_lat: payload.lat,
    user_lng: payload.lng, // ✅ CORRECT
    service: payload.service,
    vehicle_type: payload.vehicleType,
  };

  console.log("📤 Sending request body:", body);

  const response = await api.post<CreateRequestResponse>(
    "/api/service/request",
    body
  );

  console.log("📥 createRequest response:", response);

  // ✅ Proper validation
  if (!response?.success) {
    throw new Error(response?.message || "Failed to create service request");
  }

  if (!response.data?.$id) {
    throw new Error("Invalid response from server (missing request ID)");
  }

  return response.data.$id;
}

/* ================= REALTIME LISTENER ================= */
/**
 * Listen to request updates (accept / status / location)
 */
export async function listenRequest(
  requestId: string,
  cb: (doc: any) => void
): Promise<Unsubscribe> {
  const path = `databases.${APPWRITE_DATABASE_ID}.collections.${REQUESTS_COLLECTION_ID}.documents.${requestId}`;

  // ✅ Await because SDK returns Promise<RealtimeSubscription>
  const subscription = await realtime.subscribe(path, (response: any) => {
    if (response?.payload) {
      cb(response.payload);
    }
  });

  // ✅ Appwrite NEW SDK uses close()
  return () => {
    subscription.close();
  };
}


/* ================= CANCEL REQUEST ================= */

export async function cancelRequest(requestId: string) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    {
      status: "cancelled",
    }
  );
}

/* ================= ACCEPT REQUEST ================= */

export async function acceptRequest(
  requestId: string,
  mechId: string,
  mechInfo: any
) {
  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    {
      acceptedBy: mechId,
      status: "accepted",
      mechanicInfo: mechInfo,
    }
  );
}

/* ================= UPDATE MECHANIC LOCATION ================= */
/**
 * Phase-2 live tracking
 */
export async function updateMechanicLocation(
  requestId: string,
  lat: number,
  lng: number
) {
  const location: MechanicLocation = {
    lat,
    lng,
    updatedAt: Date.now(),
  };

  await databases.updateDocument(
    APPWRITE_DATABASE_ID,
    REQUESTS_COLLECTION_ID,
    requestId,
    {
      mechanicLocation: location,
    }
  );
}
