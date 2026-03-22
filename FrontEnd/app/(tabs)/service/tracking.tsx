// app/(tabs)/service/tracking.tsx

// ✅ SAME IMPORTS (unchanged)
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Asset } from "expo-asset";
import { useLocalSearchParams, useRouter } from "expo-router";
import MechanicCard from "./components/MechanicCard";
import LoadingBars from "./components/LoadingBars";
import {
  startRequestTimer,
  stopRequestTimer,
  formatTime,
} from "./utils/requestTimer";
import { createRequest, cancelRequest } from "@/services/requests";
import {
  getLoggedInPhone,
  saveActiveUserRequestId,
  getActiveUserRequestId,
  clearActiveUserRequestId,
} from "@/utils/storage";
import { getServiceRequestByIdApi } from "@/services/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Coords = {
  latitude: number;
  longitude: number;
};

export default function Tracking() {
  const { vehicleType } = useLocalSearchParams<{ vehicleType?: string }>();
  const router = useRouter();

  const webViewRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const trackingRef = useRef<any>(null);
  const completionHandledRef = useRef(false);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconUri, setIconUri] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stage, setStage] = useState<"idle" | "waiting" | "tracking">("idle");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [mechanic, setMechanic] = useState<any>(null);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("Searching...");
  const [restoring, setRestoring] = useState(true);
  const [showCompletionCard, setShowCompletionCard] = useState(false);

  /* ================= RESTORE ACTIVE REQUEST ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedRequestId = await getActiveUserRequestId();
        if (!savedRequestId || !mounted) {
          setRestoring(false);
          return;
        }

        const res = await getServiceRequestByIdApi(savedRequestId);
        if (!mounted) return;

        if (!res?.success || !res?.data) {
          await clearActiveUserRequestId();
          return;
        }

        const data = res.data;
        const liveLat = Number(data.mechanic_lat ?? data.mechanic?.latitude);
        const liveLng = Number(data.mechanic_lng ?? data.mechanic?.longitude);

        if (data.status === "pending") {
          setRequestId(savedRequestId);
          setStage("waiting");
          return;
        }

        if (
          data.status === "accepted" &&
          Number.isFinite(liveLat) &&
          Number.isFinite(liveLng)
        ) {
          setRequestId(savedRequestId);
          setStage("tracking");
          setMechanic(
            data.mechanic || {
              phone: data.mechanic_phone,
            },
          );
          return;
        }

        await clearActiveUserRequestId();
      } catch (err) {
        console.log("Restore active request failed:", err);
      } finally {
        if (mounted) setRestoring(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= LOAD ICON ================= */
  useEffect(() => {
    const asset = Asset.fromModule(
      require("../../../assets/images/Mechnaic-icon.webp"),
    );
    setIconUri(asset.uri);
  }, []);

  /* ================= LOCATION ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (!active) return;
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setLoading(false);
    })();

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (trackingRef.current) clearInterval(trackingRef.current);
    };
  }, []);

  /* ================= NEARBY MECHANICS ================= */
  useEffect(() => {
    if (!coords || stage === "tracking") return;

    const roleMap: Record<string, string> = {
      bike: "Bike Mechanic",
      car: "Car Mechanic",
      auto: "Auto Mechanic",
      truck: "Truck Mechanic",
    };

    const normalizedVehicleType = (vehicleType || "").toLowerCase().trim();
    let selectedRole = "";

    if (normalizedVehicleType.includes("bike")) {
      selectedRole = roleMap.bike;
    } else if (normalizedVehicleType.includes("car")) {
      selectedRole = roleMap.car;
    } else if (normalizedVehicleType.includes("auto")) {
      selectedRole = roleMap.auto;
    } else if (normalizedVehicleType.includes("truck")) {
      selectedRole = roleMap.truck;
    }

    const roleQuery = selectedRole
      ? `&role=${encodeURIComponent(selectedRole)}`
      : "";

    const fetchNearby = async () => {
      try {
        const url = `${API_URL}/api/mechanic/nearby?lat=${coords.latitude}&lng=${coords.longitude}${roleQuery}&radius=10&_=${Date.now()}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            updateMechanics(${JSON.stringify(data.mechanics || [])});
            true;
          `);
        }
      } catch (err) {
        console.log("Nearby fetch error:", err);
      }
    };

    fetchNearby();
    intervalRef.current = setInterval(fetchNearby, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [coords, vehicleType, stage]);

  /* ================= SEND REQUEST ================= */
  const handleSendRequest = async () => {
    if (!coords || !vehicleType || sending || stage !== "idle" || restoring)
      return;

    try {
      setSending(true);

      const existingRequestId = await getActiveUserRequestId();
      if (existingRequestId) {
        const existing = await getServiceRequestByIdApi(existingRequestId);
        if (existing?.success && existing?.data) {
          const status = existing.data.status;
          if (status === "pending" || status === "accepted") {
            setRequestId(existingRequestId);
            setStage(status === "accepted" ? "tracking" : "waiting");
            Alert.alert(
              "Active request",
              "You already have an active request.",
            );
            return;
          }
        }

        await clearActiveUserRequestId();
      }

      const phone = await getLoggedInPhone();
      if (!phone) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const payload = {
        userPhone: phone,
        lat: coords.latitude,
        lng: coords.longitude,
        service: "general-repair",
        vehicleType,
      };

      const id = await createRequest(payload);

      setRequestId(id);
      setStage("waiting");
      completionHandledRef.current = false;
      await saveActiveUserRequestId(id);
    } catch (err) {
      Alert.alert("Error", "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  /* ================= TRACKING ================= */
  useEffect(() => {
    if (!requestId) return;

    const track = async () => {
      try {
        const res = await getServiceRequestByIdApi(requestId);

        if (!res?.success) return;

        const data = res.data;

        if (data.status === "cancelled") {
          setStage("idle");
          setRequestId(null);
          setMechanic(null);
          clearActiveUserRequestId();
          return;
        }

        if (data.status === "completed") {
          if (completionHandledRef.current) return;
          completionHandledRef.current = true;

          setStage("idle");
          setRequestId(null);
          setMechanic(null);
          await clearActiveUserRequestId();
          stopRequestTimer();
          setShowCompletionCard(true);
          return;
        }

        const liveLat = Number(data.mechanic_lat ?? data.mechanic?.latitude);
        const liveLng = Number(data.mechanic_lng ?? data.mechanic?.longitude);

        if (
          data.status === "accepted" &&
          Number.isFinite(liveLat) &&
          Number.isFinite(liveLng)
        ) {
          setMechanic(
            data.mechanic || {
              phone: data.mechanic_phone,
            },
          );
          setStage("tracking");

          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              drawRoute(${liveLat}, ${liveLng});
              moveMechanic(${liveLat}, ${liveLng});
              true;
            `);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    track();
    trackingRef.current = setInterval(track, 3000);

    return () => {
      if (trackingRef.current) clearInterval(trackingRef.current);
    };
  }, [requestId]);

  useEffect(() => {
    if (stage !== "waiting") return;

    startRequestTimer((sec) => {
      setSeconds(sec);

      if (sec < 5) {
        setMessage("Searching for nearby mechanics...");
      } else if (sec < 10) {
        setMessage("Contacting mechanics...");
      } else if (sec < 20) {
        setMessage("Waiting for response...");
      } else {
        setMessage("Still trying... Please wait");
      }
    });

    return () => stopRequestTimer();
  }, [stage]);

  const handleCancel = async (_reason?: string) => {
    if (!requestId) return;

    try {
      await cancelRequest(requestId);
      setStage("idle");
      setRequestId(null);
      setMechanic(null);
      stopRequestTimer();
      await clearActiveUserRequestId();
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("route not found")) {
        Alert.alert(
          "Cancel unavailable",
          "Your backend cancel route is not deployed yet. Please deploy the latest backend and try again.",
        );
        return;
      }

      Alert.alert("Error", msg || "Cancel failed");
    }
  };

  if (loading || !coords || !iconUri) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading map…</Text>
      </SafeAreaView>
    );
  }

  /* ================= MAP HTML (FIXED) ================= */
  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{height:100%;margin:0;padding:0;}
.leaflet-div-icon{background:transparent;border:none;}
.user-dot{width:18px;height:18px;background:#007AFF;border-radius:50%;border:3px solid white;box-shadow:0 0 0 8px rgba(0,122,255,0.2);}
.mechanic-icon{width:64px;height:64px;background-image:url('${iconUri}');background-size:contain;background-repeat:no-repeat;}
</style>
</head>
<body>
<div id="map"></div>
<script>

let map = L.map('map').setView([${coords.latitude},${coords.longitude}],16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//  USER MARKER
let userIcon = L.divIcon({
  html:'<div class="user-dot"></div>',
  iconSize:[24,24],
  iconAnchor:[12,12],
});
L.marker([${coords.latitude},${coords.longitude}],{icon:userIcon}).addTo(map);

//  MECHANICS
let mechanicMarkers=[];
let mechanicIcon = L.divIcon({
  html:'<div class="mechanic-icon"></div>',
  iconSize:[64,64],
  iconAnchor:[32,32],
});

function updateMechanics(mechanics){
  mechanicMarkers.forEach(m=>map.removeLayer(m));
  mechanicMarkers=[];
  mechanics.forEach(m=>{
    if(!m.latitude || !m.longitude) return;
    if(Math.abs(m.latitude - ${coords.latitude}) < 0.00005 && Math.abs(m.longitude - ${coords.longitude}) < 0.00005) return;
    const marker=L.marker([m.latitude,m.longitude],{icon:mechanicIcon}).addTo(map);
    mechanicMarkers.push(marker);
  });
}

function clearNearbyMechanics(){
  mechanicMarkers.forEach(m=>map.removeLayer(m));
  mechanicMarkers=[];
}

// ✅ ROUTE + MOVEMENT
let routeLine=null;
let movingMarker=null;

function drawRoute(lat,lng){
  const userLat = ${coords.latitude};
  const userLng = ${coords.longitude};

  fetch('https://router.project-osrm.org/route/v1/driving/' + lng + ',' + lat + ';' + userLng + ',' + userLat + '?overview=full&geometries=geojson')
    .then(res=>res.json())
    .then(data=>{
      if(routeLine) map.removeLayer(routeLine);

      const routeCoords = data?.routes?.[0]?.geometry?.coordinates;
      if(!routeCoords || !routeCoords.length) return;

      const latLngs = routeCoords.map(c => [c[1], c[0]]);
      routeLine = L.polyline(latLngs,{color:'blue',weight:4}).addTo(map);
    })
    .catch(()=>{
      if(routeLine) map.removeLayer(routeLine);
      routeLine=L.polyline([[userLat,userLng],[lat,lng]],{color:'blue',weight:4}).addTo(map);
    });
}

function moveMechanic(lat,lng){
  if(!movingMarker){
    movingMarker=L.marker([lat,lng],{icon:mechanicIcon}).addTo(map);
  }else{
    movingMarker.setLatLng([lat,lng]);
  }
}

</script>
</body>
</html>
`;

  const NativeWebView = require("react-native-webview").WebView;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? (
          <iframe srcDoc={mapHtml} style={{ width: "100%", height: "100%" }} />
        ) : (
          <NativeWebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            javaScriptEnabled
          />
        )}
      </View>

      {/* ================= BOTTOM UI ================= */}

      {stage === "idle" && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.button} onPress={handleSendRequest}>
            <Text style={styles.buttonText}>Request Mechanic</Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === "waiting" && (
        <View style={styles.waitingPanel}>
          <View style={styles.dragIndicator} />
          <Text style={styles.waitingTitle}>{message}</Text>
          <Text style={styles.timer}>{formatTime(seconds)}</Text>
          <LoadingBars
            vehicleType={vehicleType}
            onCancel={(reason) => {
              handleCancel(reason);
            }}
          />
        </View>
      )}

      {stage === "tracking" && mechanic && <MechanicCard mechanic={mechanic} />}

      <Modal
        visible={showCompletionCard}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCompletionCard(false);
          router.replace("/(tabs)");
        }}
      >
        <View style={styles.completionBackdrop}>
          <View style={styles.completionCard}>
            <View style={styles.completionBadge}>
              <Text style={styles.completionBadgeText}>DONE</Text>
            </View>

            <Text style={styles.completionTitle}>Service Completed</Text>
            <Text style={styles.completionMessage}>
              Please check all the repairs before payment.
            </Text>

            <TouchableOpacity
              style={styles.completionButton}
              onPress={() => {
                setShowCompletionCard(false);
                router.replace("/(tabs)");
              }}
            >
              <Text style={styles.completionButtonText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "#ffffff",

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    elevation: 10,
  },
  button: {
    backgroundColor: "#0938c5",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  waitingPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 20,

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },

  waitingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  timer: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38bdf8",
    marginTop: 10,
  },

  cancelBtn: {
    marginTop: 20,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },

  waitingSub: {
    marginTop: 10,
    color: "#666",
  },

  completionBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  completionCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 12,
  },

  completionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },

  completionBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  completionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },

  completionMessage: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: "#334155",
  },

  completionButton: {
    marginTop: 20,
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  completionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
