import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  onDuty: boolean;
  toggleDuty: () => void;
  onLogout: () => void;
};

export default function TopNavBar({
  onDuty,
  toggleDuty,
  onLogout,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.left}>
        <Text style={styles.title}>Mechanic</Text>
        <Text style={styles.subtitle}>
          {onDuty ? "You are online" : "You are offline"}
        </Text>
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.right}>
        {/* DUTY TOGGLE */}
        <TouchableOpacity
          style={[
            styles.dutyChip,
            onDuty ? styles.dutyOn : styles.dutyOff,
          ]}
          onPress={toggleDuty}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: onDuty ? "#16a34a" : "#ef4444" },
            ]}
          />

          <Text
            style={[
              styles.dutyText,
              { color: onDuty ? "#065f46" : "#7f1d1d" },
            ]}
          >
            {onDuty ? "ON DUTY" : "OFF DUTY"}
          </Text>
        </TouchableOpacity>

        {/* PROFILE BUTTON */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/(mechanic)/menu")}
        >
          <Ionicons name="person" size={22} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    height: 70,
    paddingHorizontal: 18,
    paddingTop: 8,
    backgroundColor: "#ffffff",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  left: {
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* DUTY CHIP */

  dutyChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 14,
  },

  dutyOn: {
    backgroundColor: "#dcfce7",
  },

  dutyOff: {
    backgroundColor: "#fee2e2",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  dutyText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* PROFILE */

  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",

    alignItems: "center",
    justifyContent: "center",
  },
});