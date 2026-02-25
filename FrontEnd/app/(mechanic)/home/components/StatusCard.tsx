import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { getLoggedInPhone } from "@/utils/storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  requestId: string;
  userPhone: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  userLat: number;
  userLng: number;
  vehicleType?: string;
};

export default function StatusCard({
  requestId,
  userPhone,
  status,
  userLat,
  userLng,
  vehicleType,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState<string>("0");
  const [pickupAddress, setPickupAddress] = useState("Loading...");
  const [mechanicAddress, setMechanicAddress] = useState("Loading...");
  const [mechanicCoords, setMechanicCoords] = useState<any>(null);

  /* ================= LOAD LOCATION ================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const mech = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setMechanicCoords(mech.coords);

      const dist = calculateDistance(
        mech.coords.latitude,
        mech.coords.longitude,
        userLat,
        userLng
      );

      setDistanceKm(dist);

      const userAddr = await Location.reverseGeocodeAsync({
        latitude: userLat,
        longitude: userLng,
      });

      if (userAddr.length > 0) {
        setPickupAddress(formatAddress(userAddr[0]));
      }

      const mechAddr = await Location.reverseGeocodeAsync({
        latitude: mech.coords.latitude,
        longitude: mech.coords.longitude,
      });

      if (mechAddr.length > 0) {
        setMechanicAddress(formatAddress(mechAddr[0]));
      }
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  /* ================= DISTANCE ================= */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return (
      R *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    ).toFixed(1);
  };

  const formatAddress = (a: any) => {
    return `${a.street || ""}, ${
      a.city || a.subregion || ""
    }, ${a.region || ""} - ${a.postalCode || ""}`;
  };

  /* ================= ACCEPT REQUEST ================= */
  const acceptRequest = async () => {
    try {
      if (!API_URL || !mechanicCoords) return;
      if (loading) return;

      setLoading(true);

      const mechanicPhone = await getLoggedInPhone();
      if (!mechanicPhone) {
        Alert.alert("Not logged in");
        return;
      }

      const res = await fetch(`${API_URL}/api/service/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          requestId,
          mechanic_phone: mechanicPhone,
          mechanic_lat: mechanicCoords.latitude,
          mechanic_lng: mechanicCoords.longitude,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Accept failed");
      }

      /* 🔥 NAVIGATE TO DUTY MAP */
      router.replace({
        pathname: "/mechanic/DutyMap",
        params: {
          requestId,
          userLat: userLat.toString(),
          userLng: userLng.toString(),
          userPhone,
        },
      });

    } catch (err: any) {
      Alert.alert("Error", err.message || "Accept failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.mainKm}>{distanceKm} KM</Text>

        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleText}>
            {vehicleType?.toUpperCase() || "VEHICLE"}
          </Text>
        </View>

        <View style={styles.locationBlock}>
          <Text style={styles.zeroKm}>0 KM</Text>
          <Text style={styles.address}>{pickupAddress}</Text>
        </View>

        <View style={styles.verticalLine} />

        <View style={styles.locationBlock}>
          <Text style={styles.destKm}>{distanceKm} KM</Text>
          <Text style={styles.address}>{mechanicAddress}</Text>
        </View>

        {status === "pending" && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={acceptRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptText}>ACCEPT</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
    paddingHorizontal: 20,
    paddingLeft: 50,
  },
  card: {
    borderWidth: 2,
    borderColor: "#000",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  mainKm: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  vehicleBadge: {
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  vehicleText: {
    fontWeight: "600",
  },
  locationBlock: {
    marginBottom: 10,
  },
  zeroKm: {
    fontWeight: "600",
  },
  destKm: {
    fontWeight: "600",
  },
  address: {
    fontSize: 14,
    marginTop: 4,
  },
  verticalLine: {
    borderLeftWidth: 2,
    height: 50,
    marginVertical: 10,
  },
  acceptBtn: {
    marginTop: 20,
    backgroundColor: "#1565C0",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});