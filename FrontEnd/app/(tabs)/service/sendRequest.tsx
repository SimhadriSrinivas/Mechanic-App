import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import * as Location from "expo-location";

import { createRequest } from "@/services/requests";
import { getLoggedInPhone } from "@/utils/storage";

export default function SendRequest() {
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get logged-in user phone (SOURCE OF TRUTH)
      const phone = await getLoggedInPhone();
      if (!phone) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      // 2️⃣ Ask location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Location permission is required to request a mechanic",
        );
        return;
      }

      // 3️⃣ Get current GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // 4️⃣ Build payload (CLEAN & SAFE)
      const payload = {
        userPhone: phone,
        lat: location.coords.latitude, // ✅ latitude
        lng: location.coords.longitude, // ✅ longitude (NO llng possible)
        service: "general-repair",
        vehicleType: "car",
      };

      // 🔍 Debug log (temporary – helps confirm correctness)
      console.log("Final payload sent:", payload);

      // 5️⃣ Send request to backend
      await createRequest(payload);

      Alert.alert("Request Sent", "A mechanic will reach you soon");
    } catch (err) {
      console.error("sendRequest error:", err);
      Alert.alert("Error", "Failed to send request");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Breakdown?</Text>
      <Text style={styles.subtitle}>
        Send your live location to nearby mechanics
      </Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
        onPress={sendRequest}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Request Mechanic"}
        </Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 8,
    color: "#f9f8f8",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#002e6e",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
