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

  const intervalRef = useRef<number | null>(null);

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
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* ================= POLLING ================= */
  useEffect(() => {
    if (!onDuty || !mechanicPhone) {
      setRequests([]);
      return;
    }

    fetchRequests();
    intervalRef.current = setInterval(fetchRequests, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onDuty, mechanicPhone]);

  /* ================= LOADING ================= */
  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  /* ================= REQUEST LOGIC ================= */

  const acceptedRequest = requests.find(
    (r) => r.status === "accepted"
  );

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
          {/* 🔵 IF ACCEPTED → SHOW FULL MAP WITH ROUTE */}
          {acceptedRequest && (
            <DutyMap acceptedRequest={acceptedRequest} />
          )}

          {/* 🟢 IF ONLY PENDING → SHOW REQUEST CARDS */}
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
                  onAccepted={fetchRequests}
                />
              ))}
            </ScrollView>
          )}

          {/* 🟡 IF NO REQUESTS → NORMAL MAP */}
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
