import React, { useEffect, useState, useContext, useRef } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";

import DutyMap from "./components/DutyMap";
import ReferEarnCard from "./components/ReferEarnCard";
import TopNavBar from "./components/TopNavBar";
import RequestBottomSheet from "./components/bottom-sheet/RequestBottomSheet";
import StatusCard from "./components/StatusCard";

import { getMechanicRegStep, getLoggedInPhone } from "../../../utils/storage";
import { DutyContext } from "../_layout";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

export default function MechanicHome() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { onDuty, toggleDuty } = useContext(DutyContext);

  const [checking, setChecking] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [mechanicPhone, setMechanicPhone] = useState("");
  const [acceptedRequest, setAcceptedRequest] = useState<any | null>(null);

  const acceptedRequestRef = useRef<any | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      try {
        const step = await getMechanicRegStep();

        if (step !== "done") {
          router.replace("/(auth)/mechanic-register");
          return;
        }

        const phone = await getLoggedInPhone();
        if (phone) setMechanicPhone(phone);
      } catch (err) {
        console.log("Init error:", err);
      } finally {
        setChecking(false);
      }
    };

    init();
  }, []);

  /* ================= FETCH REQUESTS ================= */

  const fetchRequests = async () => {
    if (!mechanicPhone || !API_URL) return;

    try {
      const res = await fetch(
        `${API_URL}/api/service?mechanicPhone=${mechanicPhone}`,
        { headers: { "ngrok-skip-browser-warning": "true" } },
      );

      const data = await res.json();
      if (!data?.success) return;

      const newRequests = data.requests || [];

      setRequests(newRequests);

      const accepted = newRequests.find((r: any) => r.status === "accepted");

      if (accepted) {
        const req = {
          ...accepted,
          user_lat: Number(accepted.user_lat),
          user_lng: Number(accepted.user_lng),
          user_phone: accepted.user_phone || "",
        };

        acceptedRequestRef.current = req;
        setAcceptedRequest(req);
      } else {
        acceptedRequestRef.current = null;
        setAcceptedRequest(null);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  /* ================= POLLING ================= */

  useEffect(() => {
    if (!onDuty || !mechanicPhone) {
      setRequests([]);
      setAcceptedRequest(null);

      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    fetchRequests();

    intervalRef.current = setInterval(fetchRequests, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onDuty, mechanicPhone]);

  /* 🔥 REFRESH AFTER PAYMENT */
  useEffect(() => {
    if (params.refresh) {
      fetchRequests();
    }
  }, [params.refresh]);

  /* ================= REMOVE REQUEST ================= */

  const removeRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.$id !== id));
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar onDuty={onDuty} toggleDuty={toggleDuty} onLogout={() => {}} />

      {!onDuty && <ReferEarnCard />}

      {onDuty && (
        <>
          {/* 🔥 MAP ALWAYS */}
          <DutyMap acceptedRequest={acceptedRequest} />

          {/* 🔥 SHOW ONLY WHEN REQUEST EXISTS */}
          {!acceptedRequest && (
            <LinearGradient
              colors={["#f8fafc", "#eef2f6"]}
              style={[
                styles.requestBackground,
                {
                  display: pendingRequests.length === 0 ? "none" : "flex",
                },
              ]}
            >
              <View style={styles.requestContainer}>
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
                    onCancelled={removeRequest}
                  />
                ))}
              </View>
            </LinearGradient>
          )}

          {/* ACTIVE JOB */}
          {acceptedRequest && (
            <RequestBottomSheet
              acceptedRequest={acceptedRequest}
              pendingRequests={pendingRequests}
              onAccepted={fetchRequests}
            />
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
    backgroundColor: "#eef2f6",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  requestBackground: {
    position: "absolute",
    top: 110,
    left: 0,
    right: 0,
    bottom: 0,
  },

  requestContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
