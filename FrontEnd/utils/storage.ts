// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= STORAGE KEYS ================= */

// Auth
const KEY_PHONE = "auth_phone";
const KEY_ROLE = "auth_role";
const KEY_MECHANIC_PROFILE_COMPLETED = "mechanic_profile_completed";

// 🔥 NEW → Mechanic profile data (name + phone etc.)
const KEY_MECHANIC_PROFILE_DATA = "mechanic_profile_data";

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

export type StoredMechanicProfile = {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
};

/* ================= SAVE AUTH ================= */

export async function saveLoggedInPhone(phone: string) {
  await AsyncStorage.setItem(KEY_PHONE, phone);
}

export async function saveUserRole(role: UserRole) {
  await AsyncStorage.setItem(KEY_ROLE, role);
}

export async function saveMechanicProfileCompleted(value: boolean) {
  await AsyncStorage.setItem(
    KEY_MECHANIC_PROFILE_COMPLETED,
    value ? "true" : "false"
  );
}

/* ================= GET AUTH ================= */

export async function getLoggedInPhone(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PHONE);
}

export async function getUserRole(): Promise<UserRole | null> {
  const role = await AsyncStorage.getItem(KEY_ROLE);
  return role === "user" || role === "mechanic" ? role : null;
}

export async function isMechanicProfileCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_MECHANIC_PROFILE_COMPLETED);
  return value === "true";
}

export async function hasMechanicProfileFlag(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY_MECHANIC_PROFILE_COMPLETED);
  return value !== null;
}

/* ================= 🔥 MECHANIC PROFILE DATA ================= */

/**
 * Save mechanic profile data (name + phone)
 */
export async function saveMechanicProfileData(
  data: StoredMechanicProfile
) {
  await AsyncStorage.setItem(
    KEY_MECHANIC_PROFILE_DATA,
    JSON.stringify(data)
  );
}

/**
 * Get mechanic profile data
 */
export async function getMechanicProfileData(): Promise<StoredMechanicProfile | null> {
  const raw = await AsyncStorage.getItem(KEY_MECHANIC_PROFILE_DATA);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse mechanic profile data"); // 🔥 UPDATED (safe parsing)
    return null;
  }
}

/**
 * Clear mechanic profile data
 */
export async function clearMechanicProfileData() {
  await AsyncStorage.removeItem(KEY_MECHANIC_PROFILE_DATA);
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

export async function saveMechanicDutyStatus(onDuty: boolean) {
  await AsyncStorage.setItem(KEY_MECH_DUTY_STATUS, JSON.stringify(onDuty));
}

export async function getMechanicDutyStatus(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(KEY_MECH_DUTY_STATUS);
  return raw ? JSON.parse(raw) : null;
}

/* ================= MECHANIC LOCATION (MAP) ================= */

export async function saveLastMechanicLocation(location: StoredLocation) {
  await AsyncStorage.setItem(
    KEY_MECH_LAST_LOCATION,
    JSON.stringify(location)
  );
}

export async function getLastMechanicLocation(): Promise<StoredLocation | null> {
  const raw = await AsyncStorage.getItem(KEY_MECH_LAST_LOCATION);
  return raw ? JSON.parse(raw) : null;
}

export async function clearLastMechanicLocation() {
  await AsyncStorage.removeItem(KEY_MECH_LAST_LOCATION);
}

/* ================= RESET HELPERS ================= */

export async function resetMechanicRegistration() {
  await AsyncStorage.multiRemove([
    KEY_MECH_REG_FORM,
    KEY_MECH_REG_STEP,
    KEY_MECHANIC_PROFILE_COMPLETED,
    KEY_MECHANIC_PROFILE_DATA, // 🔥 UPDATED (important fix)
  ]);
}

/* ================= CLEAR ALL (LOGOUT) ================= */

export async function clearAuthStorage() {
  await AsyncStorage.multiRemove([
    KEY_PHONE,
    KEY_ROLE,
    KEY_MECHANIC_PROFILE_COMPLETED,
    KEY_MECHANIC_PROFILE_DATA, // 🔥 important
    KEY_MECH_REG_STEP,
    KEY_MECH_REG_FORM,
    KEY_MECH_DUTY_STATUS,
    KEY_MECH_LAST_LOCATION,
  ]);
}
