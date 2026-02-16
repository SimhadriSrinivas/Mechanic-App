// services/requests.ts

import {
  createServiceRequest,
  cancelServiceRequest,
  updateMechanicLocationApi,
  getServiceRequestByIdApi,
} from "./api";

type Unsubscribe = () => void;

/* ================= TYPES ================= */

export type CreateRequestPayload = {
  userPhone: string;
  service: string;
  vehicleType: string;
  lat: number;
  lng: number;
};

/* =====================================================
   CREATE REQUEST (Backend Only)
===================================================== */

export async function createRequest(
  payload: CreateRequestPayload
): Promise<string> {
  try {
    console.log("📤 Sending request body:", payload);

    const response = await createServiceRequest({
      userPhone: payload.userPhone,
      service: payload.service,
      vehicleType: payload.vehicleType,
      userLat: payload.lat,
      userLng: payload.lng,
    });

    console.log("📥 createRequest response:", response);

    if (!response?.success) {
      throw new Error(response?.message || "Failed to create request");
    }

    if (!response.data?.$id) {
      throw new Error("Server did not return request ID");
    }

    return response.data.$id;
  } catch (error: any) {
    console.error("❌ createRequest error:", error?.message || error);
    throw error;
  }
}

/* =====================================================
   POLLING LISTENER (Replaces Realtime)
===================================================== */

export function listenRequest(
  requestId: string,
  cb: (doc: any) => void
): Unsubscribe {
  console.log("🔁 Starting polling for request:", requestId);

  const interval = setInterval(async () => {
    try {
      const response = await getServiceRequestByIdApi(requestId);

      if (response?.success && response?.data) {
        cb(response.data);
      }
    } catch (error) {
      console.log("Polling error ignored");
    }
  }, 3000); // Poll every 3 seconds

  return () => {
    console.log("🛑 Stopping polling");
    clearInterval(interval);
  };
}

/* =====================================================
   CANCEL REQUEST (Backend Only)
===================================================== */

export async function cancelRequest(requestId: string) {
  try {
    if (!requestId) return;

    const response = await cancelServiceRequest(requestId);

    if (!response?.success) {
      throw new Error(response?.message || "Cancel failed");
    }

    console.log("✅ Request cancelled");
  } catch (error) {
    console.error("❌ cancelRequest failed:", error);
  }
}

/* =====================================================
   UPDATE MECHANIC LOCATION (Backend Only)
===================================================== */

export async function updateMechanicLocation(
  requestId: string,
  lat: number,
  lng: number
) {
  try {
    if (!requestId) return;

    const response = await updateMechanicLocationApi({
      requestId,
      mechanic_lat: lat,
      mechanic_lng: lng,
    });

    if (!response?.success) {
      throw new Error(response?.message || "Location update failed");
    }
  } catch (error) {
    console.error("❌ updateMechanicLocation error:", error);
  }
}
