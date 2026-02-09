import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  requestId: string;
  userPhone: string;
  service: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  mechanicPhone: string;
  onAccepted?: () => void;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function StatusCard({
  requestId,
  userPhone,
  service,
  status,
  mechanicPhone,
  onAccepted,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ================= ACCEPT REQUEST ================= */
  const acceptRequest = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/service/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          mechanic_phone: mechanicPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to accept request");
        return;
      }

      // Inform parent (index.tsx)
      onAccepted?.();
    } catch (err) {
      Alert.alert("Error", "Network error while accepting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* ================= HEADER ================= */}
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={26} color="#444" />
        <Text style={styles.userPhone}>{userPhone}</Text>
      </View>

      {/* ================= SERVICE ================= */}
      <Text style={styles.service}>{service}</Text>

      {/* ================= STATUS ================= */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.status,
            status === "pending" && styles.pending,
            status === "accepted" && styles.accepted,
          ]}
        >
          {status.toUpperCase()}
        </Text>
      </View>

      {/* ================= ACTION ================= */}
      {status === "pending" && (
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={acceptRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptText}>Accept Request</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  userPhone: {
    fontSize: 15,
    fontWeight: "600",
  },

  service: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  statusLabel: {
    fontSize: 13,
    marginRight: 6,
    color: "#666",
  },

  status: {
    fontSize: 13,
    fontWeight: "600",
  },

  pending: {
    color: "#ff9800",
  },

  accepted: {
    color: "#2e7d32",
  },

  acceptBtn: {
    marginTop: 14,
    backgroundColor: "#1976d2",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
});
