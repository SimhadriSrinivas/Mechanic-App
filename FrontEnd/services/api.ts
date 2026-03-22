// services/api.ts

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://mechanic-app-backend-t33m.onrender.com";

/* ================= TYPES ================= */

export type ApiResponse<T = any> = {
  success?: boolean;
  message?: string;
  data?: T;
  requests?: any[];
};

/* =========================================================
   EV SERVICE ROUTES
========================================================= */

export function createEvRequestApi(data: any) {
  return post<ApiResponse>("/api/ev/create", data);
}

export function acceptEvRequestApi(data: any) {
  return post<ApiResponse>("/api/ev/accept", data);
}

export function updateEvMechanicLocationApi(data: any) {
  return post<ApiResponse>("/api/ev/update-location", data);
}

export function cancelEvRequestApi(data: any) {
  return post<ApiResponse>("/api/ev/cancel", data);
}

export function getEvRequestByIdApi(requestId: string) {
  return get<ApiResponse>(`/api/ev/${requestId}`);
}

/* =========================================================
   AUTH ROUTES
========================================================= */

export function sendOtp(phone: string) {
  return post<ApiResponse>("/api/auth/send-otp", {
    phone,
  });
}

export function verifyOtp(
  phone: string,
  otp: string,
  role: "user" | "mechanic",
) {
  return post<any>("/api/auth/verify-otp", {
    phone,
    otp,
    role,
  });
}

/* =========================================================
   MECHANIC ROUTES  (🔥 ADDED)
========================================================= */

export function getMechanicProfile(phone: string) {
  return get<ApiResponse>(
    `/api/mechanic/profile?phone=${encodeURIComponent(phone)}`,
  );
}

export function updateDutyStatus(phone: string, state: "OnDuty" | "OffDuty") {
  return post<ApiResponse>("/api/mechanic/update-duty", {
    phone,
    state,
  });
}

/* =========================================================
   SERVICE REQUEST ROUTES
========================================================= */

export function createServiceRequest(data: {
  userPhone: string;
  service: string;
  vehicleType: string;
  userLat: number;
  userLng: number;
}) {
  return post<ApiResponse>("/api/service/create", {
    user_phone: data.userPhone,
    user_lat: data.userLat,
    user_lng: data.userLng,
    service: data.service,
    vehicle_type: data.vehicleType,
  });
}

export function getServiceRequestByIdApi(requestId: string) {
  return get<ApiResponse>(
    `/api/service/request/${encodeURIComponent(requestId)}`,
  );
}

export async function cancelServiceRequest(requestId: string) {
  const payload = {
    requestId,
    request_id: requestId,
  };

  try {
    return await post<ApiResponse>("/api/service/cancel", payload);
  } catch (primaryError: any) {
    const message = String(primaryError?.message || "").toLowerCase();

    if (!message.includes("route not found")) {
      throw primaryError;
    }

    // Fallback for older/newer backend route variants
    try {
      return await post<ApiResponse>("/api/service/cancel-request", payload);
    } catch (secondaryError: any) {
      const secondMessage = String(secondaryError?.message || "").toLowerCase();

      if (!secondMessage.includes("route not found")) {
        throw secondaryError;
      }

      return post<ApiResponse>("/api/service/request/cancel", payload);
    }
  }
}

export function acceptServiceRequest(data: {
  requestId: string;
  mechanic_phone: string;
  mechanic_lat?: number;
  mechanic_lng?: number;
}) {
  return post<ApiResponse>("/api/service/accept", data);
}

export function updateMechanicLocationApi(data: {
  requestId: string;
  mechanic_lat: number;
  mechanic_lng: number;
}) {
  return post<ApiResponse>("/api/service/update-location", data);
}

export function getActiveServiceRequests(mechanicPhone: string) {
  return get<ApiResponse>(
    `/api/service?mechanicPhone=${encodeURIComponent(mechanicPhone)}`,
  );
}

export function getUserHistory(phone: string) {
  return get<ApiResponse>(
    `/api/service/user-history?phone=${encodeURIComponent(phone)}`,
  );
}

export function getMechanicHistory(phone: string) {
  return get<ApiResponse>(
    `/api/service/mechanic-history?phone=${encodeURIComponent(phone)}`,
  );
}

/* =========================================================
   INTERNAL CORE
========================================================= */

const REQUEST_TIMEOUT = 20000;

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(id);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error("Server returned invalid JSON:\n" + text);
  }

  if (!res.ok) {
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await res.text();

  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error("Server returned invalid JSON:\n" + text);
  }

  if (!res.ok) {
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}
