/* =====================================================
   MECHANIC SERVICE (BACKEND ONLY VERSION)
   All operations go through Express backend
===================================================== */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
   UPDATE DUTY STATUS (NEW - FIXED)
===================================================== */

export const updateDutyStatus = async (
  phone: string,
  state: DutyState
) => {
  try {
    if (!API_URL) {
      console.error("API_URL is not defined");
      return false;
    }

    const res = await fetch(`${API_URL}/api/mechanic/duty`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        phone,
        state,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.error("Duty API Error:", data);
      throw new Error(data?.message || "Duty update failed");
    }

    return true;
  } catch (error) {
    console.error("Failed to update duty status:", error);
    return false;
  }
};

/* =====================================================
   UPDATE MECHANIC LIVE LOCATION
===================================================== */

export const updateMechanicLocation = async (
  mechanicId: string,
  latitude: number,
  longitude: number,
  heading?: number
) => {
  try {
    if (!API_URL) {
      console.error("API_URL is not defined");
      return null;
    }

    const res = await fetch(`${API_URL}/api/mechanic/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        mechanicId,
        latitude,
        longitude,
        heading,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Location update failed");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to update mechanic location:", error);
    return null;
  }
};

/* =====================================================
   GET MECHANIC BY ID
===================================================== */

export const getMechanicById = async (mechanicId: string) => {
  try {
    if (!API_URL) {
      console.error("API_URL is not defined");
      return null;
    }

    const res = await fetch(
      `${API_URL}/api/mechanic/${mechanicId}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Fetch mechanic failed");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to get mechanic:", error);
    return null;
  }
};

/* =====================================================
   REGISTER MECHANIC
===================================================== */

export const registerMechanic = async (
  payload: MechanicPayload
) => {
  try {
    if (!API_URL) {
      throw new Error("API_URL not defined");
    }

    const res = await fetch(`${API_URL}/api/mechanic/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Registration failed");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to register mechanic:", error);
    throw error;
  }
};

/* =====================================================
   MARK PROFILE COMPLETED
===================================================== */

export const markProfileCompleted = async (
  mechanicId: string
) => {
  try {
    if (!API_URL) {
      console.error("API_URL is not defined");
      return null;
    }

    const res = await fetch(
      `${API_URL}/api/mechanic/profile-complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ mechanicId }),
      }
    );

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "Profile update failed");
    }

    return data.data;
  } catch (error) {
    console.error("Failed to mark profile completed:", error);
    return null;
  }
};
