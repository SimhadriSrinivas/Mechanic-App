/* =====================================================
   MECHANIC SERVICE (PRODUCTION SAFE VERSION)
===================================================== */

import Constants from "expo-constants";

/* Safe API URL getter */
const API_URL =
  Constants.expoConfig?.extra?.API_URL ||
  (Constants as any).manifest2?.extra?.API_URL ||
  "";

console.log("API_URL =", API_URL);

/* ================= TYPES ================= */

export interface MechanicPayload {
  firstName: string;
  lastName: string;
  phone: string;
  serviceTypes: string[];
  roles: string[];
  vehicleTypes: string[];
  address: string;
  aadhaar: string;
  latitude: number;
  longitude: number;
}

export type DutyState = "OnDuty" | "OffDuty";

/* =====================================================
   SAFE FETCH HELPER
===================================================== */

const safeFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const text = await res.text();

  console.log("RAW RESPONSE:", text);

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error("Server returned invalid JSON: " + text);
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

/* =====================================================
   REGISTER MECHANIC
===================================================== */

export const registerMechanic = async (payload: MechanicPayload) => {
  if (!API_URL) throw new Error("API_URL not defined");

  return safeFetch(`${API_URL}/api/mechanic/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

/* =====================================================
   GET MECHANIC PROFILE
===================================================== */

export const getMechanicProfile = async (phone: string) => {
  if (!API_URL) throw new Error("API_URL not defined");

  return safeFetch(
    `${API_URL}/api/mechanic/profile?phone=${encodeURIComponent(phone)}`
  );
};

/* =====================================================
   UPDATE DUTY STATUS
===================================================== */

export const updateDutyStatus = async (
  phone: string,
  state: DutyState
) => {
  if (!API_URL) throw new Error("API_URL not defined");

  return safeFetch(`${API_URL}/api/mechanic/duty`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, state }),
  });
};

/* =====================================================
   GET NEARBY MECHANICS
===================================================== */

export const getNearbyMechanics = async (
  lat: number,
  lng: number,
  role?: string
) => {
  if (!API_URL) throw new Error("API_URL not defined");

  let url = `${API_URL}/api/mechanic/nearby?lat=${lat}&lng=${lng}`;
  if (role) url += `&role=${role}`;

  return safeFetch(url);
};