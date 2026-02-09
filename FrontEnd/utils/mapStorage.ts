// utils/mapStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= STORAGE KEYS ================= */
const KEY_LAST_LOCATION = "mechanic_last_location";
const KEY_DUTY_STATUS = "mechanic_duty_status";

/* ================= TYPES ================= */
export type StoredLocation = {
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: number;
};

/* ================= LOCATION ================= */

// Save last known location
export async function saveLastLocation(location: StoredLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY_LAST_LOCATION,
      JSON.stringify(location)
    );
  } catch (err) {
    console.warn("Failed to save last location", err);
  }
}

// Get last known location
export async function getLastLocation(): Promise<StoredLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST_LOCATION);
    return raw ? (JSON.parse(raw) as StoredLocation) : null;
  } catch (err) {
    console.warn("Failed to read last location", err);
    return null;
  }
}

/* ================= DUTY STATUS ================= */

// Save duty status (temporary, local only)
export async function saveDutyStatus(onDuty: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY_DUTY_STATUS,
      onDuty ? "true" : "false"
    );
  } catch (err) {
    console.warn("Failed to save duty status", err);
  }
}

// Get duty status (ALWAYS returns boolean)
export async function getDutyStatus(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY_DUTY_STATUS);
    return raw === "true";
  } catch (err) {
    console.warn("Failed to read duty status", err);
    return false;
  }
}
