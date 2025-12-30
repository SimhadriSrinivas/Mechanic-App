// services/userApi.ts
import { getLoggedInPhone } from "../utils/storage";

const BASE_URL = "https://your-backend.com/api"; // TODO: update

export type UserProfile = {
  id?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  rating?: number | null;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const phone = await getLoggedInPhone();
    if (!phone) return null;

    const res = await fetch(
      `${BASE_URL}/user/profile?phone=${encodeURIComponent(phone)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.warn("getUserProfile failed", res.status);
      return null;
    }

    const json = await res.json();
    return {
      id: json.id,
      name: json.name ?? "User name",
      phone: json.phone ?? phone,
      email: json.email ?? null,
      rating: json.rating ?? null,
    };
  } catch (err) {
    return null;
  }
}
