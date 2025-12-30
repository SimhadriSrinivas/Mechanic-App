// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= STORAGE KEYS ================= */

const KEY_PHONE = "auth_phone";
const KEY_ROLE = "auth_role";
const KEY_MECHANIC_PROFILE = "mechanic_profile_completed";

// Mechanic registration resume support
const KEY_MECH_REG_STEP = "mechanic_reg_step";
const KEY_MECH_REG_FORM = "mechanic_reg_form";

/* ================= TYPES ================= */

export type UserRole = "user" | "mechanic";
export type MechanicRegStep = "form" | "image" | "done";

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
  await AsyncStorage.setItem(
    KEY_MECHANIC_PROFILE,
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
  if (step === "form" || step === "image" || step === "done") return step;
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

export async function clearAuthStorage() {
  await AsyncStorage.multiRemove([
    KEY_PHONE,
    KEY_ROLE,
    KEY_MECHANIC_PROFILE,
    KEY_MECH_REG_STEP,
    KEY_MECH_REG_FORM,
  ]);
}
