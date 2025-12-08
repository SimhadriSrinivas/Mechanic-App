// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PHONE = "loggedInPhone";

export async function saveLoggedInPhone(phone: string) {
  await AsyncStorage.setItem(KEY_PHONE, phone);
}

export async function getLoggedInPhone(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PHONE);
}

export async function clearLoggedInPhone() {
  await AsyncStorage.removeItem(KEY_PHONE);
}
