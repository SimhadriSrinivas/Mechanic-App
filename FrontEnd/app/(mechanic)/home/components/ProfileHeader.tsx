import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileHeader() {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Text style={styles.name}>Mechanic</Text>
      <TouchableOpacity onPress={() => router.push("/(mechanic)/profile")}>
        <FontAwesome5 name="user-circle" size={26} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  name: { fontSize: 18, fontWeight: "700" },
});
