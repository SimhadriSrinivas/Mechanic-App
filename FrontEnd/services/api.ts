// services/api.ts
// Base API layer – works with ngrok / production backend

const BACKEND_URL = "https://pluviometric-heliaean-myla.ngrok-free.dev";

console.log("BACKEND_URL =", BACKEND_URL);

/* ================= TYPES ================= */

export type ApiResponse<T = any> = {
  ok?: boolean;
  message?: string;
  reason?: string;
  data?: T;
  role?: "user" | "mechanic";
  profile?: any;
};

/* ================= CORE REQUESTS ================= */

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || json?.reason || "Request failed");
  }

  return json as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}

/* ================= AUTH ================= */

export function sendOtp(phone: string) {
  return post<ApiResponse>("/api/auth/send-otp", { phone });
}

export function verifyOtp(
  phone: string,
  otp: string,
  role: "user" | "mechanic"
) {
  return post<ApiResponse>("/api/auth/verify-otp", {
    phone,
    otp,
    role,
  });
}

/* ================= MECHANIC ================= */

export function registerMechanic(data: {
  firstName: string;
  lastName: string;
  phone: string;
  serviceTypes: string[];
  roles?: string[];
  vehicleTypes?: string[];
  address: string;
  aadhaar: string;
  latitude: number;
  longitude: number;
}) {
  return post<ApiResponse>("/api/mechanic/register", data);
}

/* ================= SERVICE REQUESTS ================= */

export function createServiceRequest(data: {
  userPhone: string;
  mechanicPhone: string;
  userLat: number;
  userLng: number;
  mechanicLat?: number;
  mechanicLng?: number;
}) {
  return post<ApiResponse>("/api/service/request", data);
}

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
