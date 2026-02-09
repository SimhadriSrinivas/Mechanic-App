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
      {/* LEFT: APP NAME */}
      <Text style={styles.title}>MEC</Text>

      {/* RIGHT ACTIONS */}
      <View style={styles.right}>
        {/* ON DUTY TOGGLE */}
        <TouchableOpacity
          style={[
            styles.dutyBtn,
            onDuty ? styles.on : styles.off,
          ]}
          onPress={toggleDuty}
        >
          <Text style={styles.dutyText}>
            {onDuty ? "ON DUTY" : "OFF DUTY"}
          </Text>
        </TouchableOpacity>

        {/* PROFILE ICON */}
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("../(mechanic)/profile")}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  dutyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 12,
  },

  on: {
    backgroundColor: "#4CAF50",
  },

  off: {
    backgroundColor: "#9E9E9E",
  },

  dutyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  profileBtn: {
    padding: 4,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1976D2",
    alignItems: "center",
    justifyContent: "center",
  },
});
