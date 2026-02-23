// app/(tabs)/service/waiting.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { cancelRequest } from "../../../services/requests";
import { getServiceRequestByIdApi } from "../../../services/api";

export default function WaitingScreen() {
  const params = useLocalSearchParams();
  const { requestId } = params as { requestId?: string };
  const router = useRouter();

  const pollingRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;

    console.log("Starting polling for request:", requestId);

    const poll = async () => {
      try {
        const response = await getServiceRequestByIdApi(requestId);

        if (!response?.success) return;

        const data = response.data;

        // 🔹 If accepted → go to tracking
        if (data?.status === "accepted") {
          stopPolling();
          router.replace({
            pathname: "/service/tracking",
            params: { requestId },
          });
        }

        // 🔹 If cancelled → go home
        if (data?.status === "cancelled") {
          stopPolling();
          Alert.alert("Request cancelled");
          router.replace("/");
        }
      } catch (err) {
        console.log("Polling error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Start polling every 3 seconds
    poll();
    pollingRef.current = setInterval(poll, 3000);

    return () => {
      stopPolling();
    };
  }, [requestId]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const onCancel = async () => {
    if (!requestId) return;

    await cancelRequest(requestId);
    stopPolling();
    router.replace("/");
  };

  return (
    <SafeAreaView style={w.container}>
      <Text style={w.title}>Searching for nearby mechanics...</Text>
      {loading && <ActivityIndicator style={{ marginTop: 18 }} />}
      <TouchableOpacity style={w.cancelBtn} onPress={onCancel}>
        <Text style={w.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const w = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  cancelBtn: { marginTop: 24, padding: 12 },
  cancelText: { color: "#d00", fontWeight: "700" },
});
