// services/api.ts

const BACKEND_URL =
  "https://pluviometric-heliaean-myla.ngrok-free.dev";

console.log("BACKEND_URL =", BACKEND_URL);

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
   SERVICE REQUEST ROUTES
========================================================= */

/* ================= CREATE ================= */

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

/* ================= GET BY ID (FOR POLLING) ================= */
/* 🔥 FIXED HERE */

export function getServiceRequestByIdApi(requestId: string) {
  return get<ApiResponse>(
    `/api/service/request/${encodeURIComponent(requestId)}`
  );
}

/* ================= CANCEL ================= */

export function cancelServiceRequest(requestId: string) {
  return post<ApiResponse>("/api/service/cancel", {
    requestId,
  });
}

/* ================= ACCEPT ================= */

export function acceptServiceRequest(data: {
  requestId: string;
  mechanic_phone: string;
  mechanic_lat?: number;
  mechanic_lng?: number;
}) {
  return post<ApiResponse>("/api/service/accept", data);
}

/* ================= UPDATE LOCATION ================= */

export function updateMechanicLocationApi(data: {
  requestId: string;
  mechanic_lat: number;
  mechanic_lng: number;
}) {
  return post<ApiResponse>("/api/service/update-location", data);
}

/* ================= GET ACTIVE ================= */

export function getActiveServiceRequests(mechanicPhone: string) {
  return get<ApiResponse>(
    `/api/service?mechanicPhone=${encodeURIComponent(mechanicPhone)}`
  );
}

/* ================= HISTORY ================= */

export function getUserHistory(phone: string) {
  return get<ApiResponse>(
    `/api/service/user-history?phone=${encodeURIComponent(phone)}`
  );
}

export function getMechanicHistory(phone: string) {
  return get<ApiResponse>(
    `/api/service/mechanic-history?phone=${encodeURIComponent(phone)}`
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

  console.log("➡️ POST", url, "Body:", body);

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    console.log("❌ API ERROR:", json);
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  console.log("➡️ GET", url);

  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    console.log("❌ API ERROR:", json);
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}
