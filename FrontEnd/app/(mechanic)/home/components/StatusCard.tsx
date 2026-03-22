import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import { getLoggedInPhone } from "@/utils/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  requestId: string;
  userPhone: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  userLat: number;
  userLng: number;
  vehicleType?: string;
  onAccepted?: () => void;
  onCancelled?: (id: string) => void;
};

export default function StatusCard({
  requestId,
  status,
  userLat,
  userLng,
  vehicleType,
  onAccepted,
  onCancelled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState("0");
  const [pickupAddress, setPickupAddress] = useState("Fetching...");
  const [mechanicAddress, setMechanicAddress] = useState("Fetching...");
  const [mechanicCoords, setMechanicCoords] = useState<any>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") return;

      const mech = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setMechanicCoords({
        latitude: mech.coords.latitude,
        longitude: mech.coords.longitude,
      });

      const dist = calculateDistance(
        mech.coords.latitude,
        mech.coords.longitude,
        userLat,
        userLng
      );

      setDistanceKm(dist);

      const [userAddr, mechAddr] = await Promise.all([
        Location.reverseGeocodeAsync({
          latitude: userLat,
          longitude: userLng,
        }),
        Location.reverseGeocodeAsync({
          latitude: mech.coords.latitude,
          longitude: mech.coords.longitude,
        }),
      ]);

      if (userAddr.length > 0)
        setPickupAddress(formatAddress(userAddr[0]));

      if (mechAddr.length > 0)
        setMechanicAddress(formatAddress(mechAddr[0]));
    } catch (err) {
      console.log(err);
    }
  };

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

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const formatAddress = (a: any) => {
    return `${a.street || ""}, ${a.city || a.subregion || ""}, ${
      a.region || ""
    }`;
  };

  const acceptRequest = async () => {
    try {
      if (!API_URL || !mechanicCoords) return;

      setLoading(true);

      const mechanicPhone = await getLoggedInPhone();

      await fetch(`${API_URL}/api/service/accept`, {
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

      onAccepted?.();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    onCancelled?.(requestId);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.distance}>{distanceKm} km away</Text>

          <View style={styles.vehicleBadge}>
            <Text style={styles.vehicleText}>
              {vehicleType?.toUpperCase() || "VEHICLE"}
            </Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.dotColumn}>
            <View style={styles.pickupDot} />
            <View style={styles.line} />
            <View style={styles.mechanicDot} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.address}>{pickupAddress}</Text>

            <Text style={[styles.locationLabel, { marginTop: 12 }]}>
              Your Location
            </Text>
            <Text style={styles.address}>{mechanicAddress}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={acceptRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptText}>ACCEPT REQUEST</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showCancelModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Request</Text>

            <Text style={styles.modalSubtitle}>
              Are you sure you want to remove this request?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelText}>No</Text>
              </Pressable>

              <Pressable
                style={styles.modalConfirm}
                onPress={confirmCancel}
              >
                <Text style={styles.modalConfirmText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    elevation: 6,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  distance: {
    fontSize: 20,
    fontWeight: "700",
  },

  vehicleBadge: {
    backgroundColor: "#e8f0ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  vehicleText: {
    color: "#2563eb",
    fontWeight: "700",
  },

  locationRow: {
    flexDirection: "row",
  },

  dotColumn: {
    width: 20,
    alignItems: "center",
    marginRight: 10,
  },

  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },

  mechanicDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },

  line: {
    width: 2,
    height: 30,
    backgroundColor: "#cbd5e1",
  },

  locationLabel: {
    fontSize: 13,
    color: "#64748b",
  },

  address: {
    fontSize: 14,
  },

  acceptBtn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "rgba(239,68,68,0.08)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#ef4444",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalSubtitle: {
    marginTop: 8,
    color: "#64748b",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },

  modalCancel: {
    backgroundColor: "#ebe9e9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },

  modalCancelText: {
    color: "#64748b",
    fontWeight: "600",
  },

  modalConfirm: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});