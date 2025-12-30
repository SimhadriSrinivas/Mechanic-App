// services/placesApi.ts
import { Platform } from "react-native";

const BACKEND_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000"
    : "http://localhost:3000";

export type Garage = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

export type ServiceCenter = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function getNearbyGarages(
  lat: number,
  lng: number
): Promise<Garage[]> {
  const url = `${BACKEND_URL}/api/garages/nearby?lat=${lat}&lng=${lng}`;
  return getJson<Garage[]>(url);
}

export function getNearbyServiceCenters(
  lat: number,
  lng: number
): Promise<ServiceCenter[]> {
  const url = `${BACKEND_URL}/api/service-centers/nearby?lat=${lat}&lng=${lng}`;
  return getJson<ServiceCenter[]>(url);
}
