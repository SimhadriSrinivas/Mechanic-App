// services/evRequests.ts

import {
  createEvRequestApi,
  acceptEvRequestApi,
  updateEvMechanicLocationApi,
  cancelEvRequestApi,
  getEvRequestByIdApi,
} from "./api";

export interface EvRequest {
  $id: string;
  user_phone: string;
  service: string;
  vehicle_type: string;
  user_lat: number;
  user_lng: number;
  status: string;
  mechanic_phone: string | null;
  mechanic_lat: number | null;
  mechanic_lng: number | null;
}

/* =========================================================
   CREATE EV REQUEST (Backend Only)
========================================================= */

export async function createEvRequest(payload: {
  userPhone: string;
  service: string;
  vehicleType: string;
  lat: number;
  lng: number;
}) {
  const response = await createEvRequestApi({
    user_phone: payload.userPhone,
    service: payload.service,
    vehicle_type: payload.vehicleType,
    user_lat: payload.lat,
    user_lng: payload.lng,
  });

  if (!response?.success) {
    throw new Error(response?.message || "EV request failed");
  }

  return response.data.$id;
}

/* =========================================================
   ACCEPT EV REQUEST
========================================================= */

export async function acceptEvRequest(
  requestId: string,
  mechanic_phone: string,
  mechanic_lat?: number,
  mechanic_lng?: number
) {
  const response = await acceptEvRequestApi({
    requestId,
    mechanic_phone,
    mechanic_lat,
    mechanic_lng,
  });

  if (!response?.success) {
    throw new Error(response?.message || "Accept failed");
  }
}

/* =========================================================
   UPDATE EV MECHANIC LOCATION
========================================================= */

export async function updateEvMechanicLocation(
  requestId: string,
  lat: number,
  lng: number
) {
  const response = await updateEvMechanicLocationApi({
    requestId,
    mechanic_lat: lat,
    mechanic_lng: lng,
  });

  if (!response?.success) {
    throw new Error(response?.message || "Location update failed");
  }
}

/* =========================================================
   CANCEL EV REQUEST
========================================================= */

export async function cancelEvRequest(requestId: string) {
  const response = await cancelEvRequestApi({ requestId });

  if (!response?.success) {
    throw new Error(response?.message || "Cancel failed");
  }
}

/* =========================================================
   POLL EV REQUEST (Instead of Realtime)
========================================================= */

export async function getEvRequestById(requestId: string) {
  const response = await getEvRequestByIdApi(requestId);

  if (!response?.success) {
    throw new Error(response?.message || "Fetch failed");
  }

  return response.data;
}
