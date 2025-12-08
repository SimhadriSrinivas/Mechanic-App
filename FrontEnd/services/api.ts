// src/services/api.ts
import { Platform } from "react-native";

/// Choose correct backend URL based on platform
// - Android emulator: 10.0.2.2 = your PC's localhost
// - iOS simulator / web: localhost
const BACKEND_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";

console.log("BACKEND_URL =", BACKEND_URL);

type SendOtpResponse = {
  ok?: boolean;
  message?: string;
};

type VerifyOtpResponse = {
  ok?: boolean;
  message?: string;
  user?: any;
  reason?: string;
};

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as T;

  if (!res.ok) {
    throw new Error((json as any).message || "Request failed");
  }

  return json;
}

export function sendOtp(phone: string): Promise<SendOtpResponse> {
  return request<SendOtpResponse>("/api/auth/send-otp", { phone });
}

export function verifyOtp(
  phone: string,
  otp: string
): Promise<VerifyOtpResponse> {
  return request<VerifyOtpResponse>("/api/auth/verify-otp", { phone, otp });
}
