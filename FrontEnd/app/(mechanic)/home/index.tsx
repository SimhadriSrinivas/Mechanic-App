import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import TopNavBar from "./components/TopNavBar";
import DutyMap from "./components/DutyMap";
import StatusCard from "./components/StatusCard";
import ReferEarnCard from "./components/ReferEarnCard";

import {
  clearAuthStorage,
  getMechanicRegStep,
} from "../../../utils/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const MECHANIC_PHONE = "9000258071"; // TODO: get from auth/storage

type ServiceRequest = {
  id: string;
  user_phone: string;
  service: string;
  status: "pending" | "accepted";
  mechanic_phone: string | null;
};

export default function MechanicHome() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [onDuty, setOnDuty] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  /* ================= ROUTE GUARD ================= */
  useEffect(() => {
    (async () => {
      const step = await getMechanicRegStep();

      if (step !== "done") {
        router.replace(
          step === "image"
            ? "/(auth)/mechanic-image"
            : "/(auth)/mechanic-register"
        );
        return;
      }

      setChecking(false);
    })();
  }, []);

  /* ================= FETCH REQUESTS ================= */
  useEffect(() => {
    if (!onDuty) return;

    const fetchRequests = async () => {
      try {
        setLoadingRequests(true);

        const res = await fetch(
          `${API_URL}/api/service?mechanicPhone=${MECHANIC_PHONE}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) return;

        const normalized: ServiceRequest[] = data.requests.map((r: any) => ({
          id: r.$id,
          user_phone: r.user_phone,
          service: r.service ?? "General Service",
          status: r.status,
          mechanic_phone: r.mechanic_phone ?? null,
        }));

        setRequests(normalized);
      } catch (err) {
        console.log("Failed to fetch requests");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
    const timer = setInterval(fetchRequests, 5000);
    return () => clearInterval(timer);
  }, [onDuty]);

  /* ================= LOGOUT ================= */
  const onLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearAuthStorage();
          router.replace("/login");
        },
      },
    ]);
  };

  /* ================= LOADING ================= */
  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= TOP BAR ================= */}
      <TopNavBar
        onDuty={onDuty}
        toggleDuty={() => setOnDuty((p) => !p)}
        onLogout={onLogout}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ================= OFF DUTY ================= */}
        {!onDuty && <ReferEarnCard />}

        {/* ================= ON DUTY ================= */}
        {onDuty && (
          <View style={styles.onDutyWrapper}>
            {/* ❌ EXIT DUTY */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOnDuty(false)}
            >
              <Ionicons name="close" size={26} color="#000" />
            </TouchableOpacity>

            {/* MAP */}
            <DutyMap />

            {/* REQUESTS OVER MAP */}
            {loadingRequests && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" />
              </View>
            )}

            {requests.length > 0 && (
              <View style={styles.requestOverlay}>
                {requests.map((req) => (
                  <StatusCard
                    key={req.id}
                    requestId={req.id}
                    userPhone={req.user_phone}
                    service={req.service}
                    status={req.status}
                    mechanicPhone={MECHANIC_PHONE}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  onDutyWrapper: {
    position: "relative",
    minHeight: 520,
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
  },
  requestOverlay: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  loadingOverlay: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
  },
});
