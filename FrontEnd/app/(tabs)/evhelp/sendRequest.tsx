// app/(tabs)/evhelp/sendRequest.tsx
import React, { useState } from "react";
import {
  View,
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
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission is required to request mechanic.");
        setLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const userPhone = await getLoggedInPhone();
      const userId = userPhone ?? "anonymous";

      // create EV-specific request (stored in separate collection)
      const reqId = await createEvRequest({
        userId,
        userPhone: userPhone ?? "unknown",
        service: "EV Help",
        vehicleType: vehicle ?? "car",
        lat,
        lng,
      });

      // go to EV tracking
      router.replace({
        pathname: "/evhelp/tracking",
        params: { requestId: reqId },
      });
    } catch (err) {
      console.warn("EV request failed", err);
      Alert.alert("Failed", "Could not create EV request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Request EV Help</Text>
      <Text style={s.subtitle}>Vehicle: {vehicle ?? "car"}</Text>

      <TouchableOpacity style={s.btn} onPress={send} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send Request</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginTop: 18 },
  subtitle: { marginTop: 8, color: "#555", marginBottom: 16 },
  btn: { marginTop: 18, backgroundColor: "#0b66d6", padding: 14, borderRadius: 10, width: "80%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
