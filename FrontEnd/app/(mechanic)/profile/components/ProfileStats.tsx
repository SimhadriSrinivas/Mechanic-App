import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProfileStatsProps = {
  rating: number;
  pending: number;
  rejected: number;
  total: number;
};

export default function ProfileStats({
  rating,
  pending,
  rejected,
  total,
}: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      {/* RATING */}
      <View style={styles.card}>
        <Ionicons name="star" size={20} color="#FFC107" />
        <Text style={styles.value}>{rating.toFixed(1)}</Text>
        <Text style={styles.label}>Rating</Text>
      </View>

      {/* PENDING */}
      <View style={styles.card}>
        <Ionicons name="time-outline" size={20} color="#ff9800" />
        <Text style={styles.value}>{pending}</Text>
        <Text style={styles.label}>Pending</Text>
      </View>

      {/* REJECTED */}
      <View style={styles.card}>
        <Ionicons
          name="close-circle-outline"
          size={20}
          color="#f44336"
        />
        <Text style={styles.value}>{rejected}</Text>
        <Text style={styles.label}>Rejected</Text>
      </View>

      {/* TOTAL */}
      <View style={styles.card}>
        <Ionicons
          name="list-outline"
          size={20}
          color="#4caf50"
        />
        <Text style={styles.value}>{total}</Text>
        <Text style={styles.label}>Total</Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },

  value: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  label: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
});
