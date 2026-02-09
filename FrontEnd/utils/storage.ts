// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= STORAGE KEYS ================= */

// Auth
const KEY_PHONE = "auth_phone";
const KEY_ROLE = "auth_role";
const KEY_MECHANIC_PROFILE = "mechanic_profile_completed";

// Mechanic registration resume support
const KEY_MECH_REG_STEP = "mechanic_reg_step";
const KEY_MECH_REG_FORM = "mechanic_reg_form";

// 🔹 Mechanic duty & location (MAP RELATED)
const KEY_MECH_DUTY_STATUS = "mechanic_duty_status";
const KEY_MECH_LAST_LOCATION = "mechanic_last_location";

/* ================= TYPES ================= */

export type UserRole = "user" | "mechanic";
export type MechanicRegStep = "form" | "image" | "done";

export type StoredLocation = {
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: number;
};

/* ================= SAVE AUTH ================= */

export async function saveLoggedInPhone(phone: string) {
  await AsyncStorage.setItem(KEY_PHONE, phone);
}

export async function saveUserRole(role: UserRole) {
  await AsyncStorage.setItem(KEY_ROLE, role);
}

/**
 * Explicitly mark mechanic profile completion state
 */
export async function saveMechanicProfileCompleted(value: boolean) {
  await AsyncStorage.setItem(KEY_MECHANIC_PROFILE, value ? "true" : "false");
}

/* ================= GET AUTH ================= */

export async function getLoggedInPhone(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PHONE);
}

export async function getUserRole(): Promise<UserRole | null> {
  const role = await AsyncStorage.getItem(KEY_ROLE);
  return role === "user" || role === "mechanic" ? role : null;
}

/**
 * Returns:
 * - true  → profile completed
 * - false → profile exists but not completed
 */
export async function isMechanicProfileCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_MECHANIC_PROFILE);
  return value === "true";
}

/**
 * Returns true if mechanic profile flow has started
 */
export async function hasMechanicProfileFlag(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_MECHANIC_PROFILE);
  return value !== null;
}

/* ================= MECHANIC REGISTRATION STEP ================= */

export async function saveMechanicRegStep(step: MechanicRegStep) {
  await AsyncStorage.setItem(KEY_MECH_REG_STEP, step);
}

export async function getMechanicRegStep(): Promise<MechanicRegStep | null> {
  const step = await AsyncStorage.getItem(KEY_MECH_REG_STEP);
  if (step === "form" || step === "image" || step === "done") {
    return step as MechanicRegStep;
  }
  return null;
}

/* ================= MECHANIC FORM DRAFT ================= */

export async function saveMechanicFormDraft(data: {
  firstName: string;
  lastName: string;
  address: string;
  aadhaar: string;
  serviceTypes: string[];
  roles: string[];
  vehicleTypes: string[];
}) {
  await AsyncStorage.setItem(KEY_MECH_REG_FORM, JSON.stringify(data));
}

export async function getMechanicFormDraft<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEY_MECH_REG_FORM);
  return raw ? JSON.parse(raw) : null;
}

/* ================= MECHANIC DUTY (MAP) ================= */

/**
 * Save mechanic ON / OFF duty status (temporary)
 */
export async function saveMechanicDutyStatus(onDuty: boolean) {
  await AsyncStorage.setItem(KEY_MECH_DUTY_STATUS, JSON.stringify(onDuty));
}

/**
 * Get mechanic ON / OFF duty status
 */
export async function getMechanicDutyStatus(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(KEY_MECH_DUTY_STATUS);
  return raw ? JSON.parse(raw) : null;
}

/* ================= MECHANIC LOCATION (MAP) ================= */

/**
 * Save last known GOOD GPS fix (used to avoid jump on reload)
 */
export async function saveLastMechanicLocation(location: StoredLocation) {
  await AsyncStorage.setItem(
    KEY_MECH_LAST_LOCATION,
    JSON.stringify(location)
  );
}

/**
 * Get last known GOOD GPS fix
 */
export async function getLastMechanicLocation(): Promise<StoredLocation | null> {
  const raw = await AsyncStorage.getItem(KEY_MECH_LAST_LOCATION);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Clear cached GPS location (optional)
 */
export async function clearLastMechanicLocation() {
  await AsyncStorage.removeItem(KEY_MECH_LAST_LOCATION);
}

/* ================= RESET HELPERS ================= */

/**
 * Clears only mechanic registration progress
 */
export async function resetMechanicRegistration() {
  await AsyncStorage.multiRemove([
    KEY_MECH_REG_FORM,
    KEY_MECH_REG_STEP,
    KEY_MECHANIC_PROFILE,
  ]);
}

/* ================= CLEAR ALL (LOGOUT) ================= */

/**
 * Clears ALL auth + mechanic + map related storage
 */
export async function clearAuthStorage() {
  await AsyncStorage.multiRemove([
    KEY_PHONE,
    KEY_ROLE,
    KEY_MECHANIC_PROFILE,
    KEY_MECH_REG_STEP,
    KEY_MECH_REG_FORM,
    KEY_MECH_DUTY_STATUS,
    KEY_MECH_LAST_LOCATION,
  ]);
}
