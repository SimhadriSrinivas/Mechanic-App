// services/api.ts
// Android-safe API layer for ngrok + production

const BACKEND_URL = "https://pluviometric-heliaean-myla.ngrok-free.dev";

console.log("BACKEND_URL =", BACKEND_URL);

/* ================= TYPES ================= */

export type ApiResponse<T = any> = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  reason?: string;
  data?: T;
  role?: "user" | "mechanic";
  profile?: any;
};

/* ================= INTERNAL UTILS ================= */

const REQUEST_TIMEOUT = 20000; // 20 seconds

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
      cache: "no-store", // 🔥 Android-safe
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/* ================= CORE REQUESTS ================= */

async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  console.log("➡️ POST", url, "Body:", body);

  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Connection: "close",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("❌ API POST ERROR:", path, json);
      throw new Error(json?.message || json?.reason || "Request failed");
    }

    return json as T;
  } catch (err: any) {
    console.log("❌ NETWORK POST ERROR:", path, err?.message || err);
    throw err;
  }
}

async function get<T>(path: string): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  console.log("➡️ GET", url);

  try {
    const res = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Connection: "close",
      },
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("❌ API GET ERROR:", path, json);
      throw new Error(json?.message || "Request failed");
    }

    return json as T;
  } catch (err: any) {
    console.log("❌ NETWORK GET ERROR:", path, err?.message || err);
    throw err;
  }
}

/* ================= API OBJECT ================= */

const api = {
  get: <T>(
    url: string,
    config?: { params?: Record<string, any> },
  ): Promise<T> => {
    let path = url;
    if (config?.params) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(config.params)) {
        params.append(key, String(value));
      }
      path += `?${params.toString()}`;
    }
    return get<T>(path);
  },

  post: <T>(url: string, body: unknown): Promise<T> => {
    return post<T>(url, body);
  },
};

export default api;

/* ================= AUTH ================= */

export function sendOtp(phone: string) {
  return post<ApiResponse>("/api/auth/send-otp", { phone });
}

export function verifyOtp(
  phone: string,
  otp: string,
  role: "user" | "mechanic",
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
/**
 * 🔒 IMPORTANT:
 * We STANDARDIZE names here
 * Frontend → Backend mapping is explicit
 */
export function createServiceRequest(data: {
  userPhone: string;
  service: string;
  vehicleType: string;
  userLat: number;
  userLng: number;
}) {
  return post<ApiResponse>("/api/service/request", {
    user_phone: data.userPhone,
    user_lat: data.userLat,
    user_lng: data.userLng, // ✅ ONLY correct spelling
    service: data.service,
    vehicle_type: data.vehicleType,
  });
}

/* ================= HISTORY ================= */

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
