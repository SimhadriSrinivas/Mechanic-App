// app/(tabs)/service/waiting.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { listenRequest, cancelRequest } from "../../../services/requests";

export default function WaitingScreen() {
  const params = useLocalSearchParams();
  const { requestId } = params as { requestId?: string };
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (!requestId) return;

    listenRequest(requestId, (data) => {
      setRequest(data);
      if (data?.acceptedBy) {
        router.replace({
          pathname: "/service/tracking",
          params: { requestId },
        });
      }
      if (data?.status === "cancelled") {
        Alert.alert("Request cancelled");
        router.replace("/");
      }
    }).then((off) => {
      unsubscribe = off;
    });

    return () => {
      unsubscribe?.();
    };
  }, [requestId, router]);

  const onCancel = async () => {
    if (!requestId) return;
    await cancelRequest(requestId);
    router.replace("/");
  };

  return (
    <SafeAreaView style={w.container}>
      <Text style={w.title}>Searching for nearby mechanics...</Text>
      <ActivityIndicator style={{ marginTop: 18 }} />
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
