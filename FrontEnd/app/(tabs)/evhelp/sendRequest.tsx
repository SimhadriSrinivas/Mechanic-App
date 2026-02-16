// app/(tabs)/evhelp/sendRequest.tsx

import React, { useState } from "react";
import {
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";

import { createEvRequest } from "@/services/evRequests";
import { getLoggedInPhone } from "@/utils/storage";

export default function EvSendRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { vehicle } = params as { vehicle?: string };

  const [loading, setLoading] = useState(false);

  const send = async () => {
    try {
      setLoading(true);

      // 1️⃣ Check location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to request EV mechanic."
        );
        return;
      }

      // 2️⃣ Get current location
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // 3️⃣ Get logged in phone
      const userPhone = await getLoggedInPhone();

      if (!userPhone) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      // 4️⃣ Create EV request (Backend handles DB)
      const requestId = await createEvRequest({
        userPhone,
        service: "EV Help",
        vehicleType: vehicle ?? "car",
        lat,
        lng,
      });

      if (!requestId) {
        Alert.alert("Error", "Failed to create request");
        return;
      }

      // 5️⃣ Navigate to tracking
      router.replace({
        pathname: "/evhelp/tracking",
        params: { requestId },
      });
    } catch (err) {
      console.error("EV request failed:", err);
      Alert.alert("Failed", "Could not create EV request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Request EV Help</Text>
      <Text style={styles.subtitle}>
        Vehicle: {vehicle ?? "car"}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={send}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Request</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    color: "#555",
    marginBottom: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: "#0b66d6",
    padding: 16,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
