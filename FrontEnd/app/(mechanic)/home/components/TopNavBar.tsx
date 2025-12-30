import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onDuty: boolean;
  toggleDuty: () => void;
};

export default function TopNavBar({ onDuty, toggleDuty }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Profile */}
      <TouchableOpacity onPress={() => router.push("/(mechanic)/settings")}>
        <Image
          source={{
            uri: "https://i.pravatar.cc/150", // later replace with real image
          }}
          style={styles.profile}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Mechanic</Text>

      {/* Duty Toggle */}
      <TouchableOpacity
        style={[
          styles.dutyBtn,
          { backgroundColor: onDuty ? "#16a34a" : "#374151" },
        ]}
        onPress={toggleDuty}
      >
        <Ionicons
          name={onDuty ? "power" : "power-outline"}
          size={18}
          color="#fff"
        />
        <Text style={styles.dutyText}>
          {onDuty ? "On Duty" : "Off Duty"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: "#020b2d",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },
  profile: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  dutyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dutyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
