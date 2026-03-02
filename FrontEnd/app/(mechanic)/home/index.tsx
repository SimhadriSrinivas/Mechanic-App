import React, { useEffect, useState, useContext, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DutyMap from "./components/DutyMap";
import StatusCard from "./components/StatusCard";
import ReferEarnCard from "./components/ReferEarnCard";

import { getMechanicRegStep, getLoggedInPhone } from "../../../utils/storage";
import { DutyContext } from "../_layout";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function MechanicHome() {
  const router = useRouter();
  const { onDuty } = useContext(DutyContext);

  const [checking, setChecking] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [mechanicPhone, setMechanicPhone] = useState("");
  const [lockedAcceptedRequest, setLockedAcceptedRequest] =
    useState<any | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================= INIT ================= */
  useEffect(() => {
    (async () => {
      const step = await getMechanicRegStep();
      if (step !== "done") {
        router.replace("/(auth)/mechanic-register");
        return;
      }

      const phone = await getLoggedInPhone();
      if (phone) setMechanicPhone(phone);

      setChecking(false);
    })();
  }, []);

  /* ================= FETCH REQUESTS ================= */
  const fetchRequests = async () => {
    if (!mechanicPhone) return;

    try {
      const res = await fetch(
        `${API_URL}/api/service?mechanicPhone=${mechanicPhone}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      const data = await res.json();

      if (data.success) {
        const newRequests = data.requests || [];
        setRequests(newRequests);

        // 🔥 LOCK accepted request immediately
        const accepted = newRequests.find(
          (r: any) => r.status === "accepted"
        );

        if (accepted) {
          setLockedAcceptedRequest(accepted);

          // stop polling once accepted
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!onDuty || !mechanicPhone) {
      setRequests([]);
      setLockedAcceptedRequest(null);
      return;
    }

    // already accepted → no polling
    if (lockedAcceptedRequest) return;

    fetchRequests();

    intervalRef.current = setInterval(fetchRequests, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onDuty, mechanicPhone, lockedAcceptedRequest]);

  /* ================= LOADING ================= */
  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  /* ================= REQUEST LOGIC ================= */

  const acceptedRequest =
    lockedAcceptedRequest ||
    requests.find((r) => r.status === "accepted");

  const pendingRequests = requests.filter(
    (r) => r.status === "pending"
  );

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      {/* OFF DUTY */}
      {!onDuty && <ReferEarnCard />}

      {/* ON DUTY */}
      {onDuty && (
        <>
          {/* 🔵 IF ACCEPTED → FULL SCREEN MAP */}
          {acceptedRequest && (
            <DutyMap acceptedRequest={acceptedRequest} />
          )}

          {/* 🟢 IF ONLY PENDING */}
          {!acceptedRequest && pendingRequests.length > 0 && (
            <ScrollView contentContainerStyle={styles.requestScreen}>
              {pendingRequests.map((req: any) => (
                <StatusCard
                  key={req.$id}
                  requestId={req.$id}
                  userPhone={req.user_phone}
                  status={req.status}
                  userLat={Number(req.user_lat)}
                  userLng={Number(req.user_lng)}
                  vehicleType={req.vehicle_type}
                />
              ))}
            </ScrollView>
          )}

          {/* 🟡 IF NO REQUESTS */}
          {!acceptedRequest && pendingRequests.length === 0 && (
            <DutyMap />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  requestScreen: {
    padding: 20,
    paddingBottom: 80,
  },
});