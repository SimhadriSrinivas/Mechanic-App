import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Asset } from "expo-asset";
import { useLocalSearchParams } from "expo-router";

import { createRequest } from "@/services/requests";
import { getLoggedInPhone } from "@/utils/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Coords = {
  latitude: number;
  longitude: number;
};

export default function Tracking() {
  const { vehicleType } = useLocalSearchParams<{ vehicleType?: string }>();

  const webViewRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconUri, setIconUri] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stage, setStage] = useState<"idle" | "waiting">("idle");
  const [requestId, setRequestId] = useState<string | null>(null);

  /* ================= LOAD ICON ================= */
  useEffect(() => {
    const asset = Asset.fromModule(
      require("../../../assets/images/Mechnaic-icon.webp")
    );
    setIconUri(asset.uri);
  }, []);

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

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
    };
  }, []);

  /* ================= FETCH NEARBY MECHANICS ================= */
  useEffect(() => {
    if (!coords || !vehicleType) return;

    const roleMap: Record<string, string> = {
      bike: "Bike Mechanic",
      car: "Car Mechanic",
      auto: "Auto Mechanic",
      truck: "Truck Mechanic",
    };

    const selectedRole = roleMap[vehicleType];
    if (!selectedRole) return;

    const fetchNearby = async () => {
      try {
        const url = `${API_URL}/api/mechanic/nearby?lat=${coords.latitude}&lng=${coords.longitude}&role=${encodeURIComponent(
          selectedRole
        )}&radius=10&_=${Date.now()}`;

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
  }, [coords, vehicleType]);

  /* ================= SEND REQUEST (MERGED) ================= */
  const handleSendRequest = async () => {
    if (!coords || !vehicleType || sending) return;

    try {
      setSending(true);

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
      setStage("waiting"); // 🔥 Instead of navigating
    } catch (err) {
      console.error("Send request error:", err);
      Alert.alert("Error", "Failed to send request");
    } finally {
      setSending(false);
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

  /* ================= MAP HTML ================= */
  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{height:100%;margin:0}
.leaflet-div-icon{background:transparent;border:none}

.user-dot{
  width:18px;
  height:18px;
  background:#007AFF;
  border-radius:50%;
  border:3px solid white;
  box-shadow:0 0 0 8px rgba(0,122,255,0.2);
}

.mechanic-icon{
  width:64px;
  height:64px;
  background-image:url('${iconUri}');
  background-size:contain;
  background-repeat:no-repeat;
}
</style>
</head>
<body>
<div id="map"></div>
<script>
let map=L.map('map').setView([${coords.latitude},${coords.longitude}],16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19
}).addTo(map);

let userIcon=L.divIcon({
  html:'<div class="user-dot"></div>',
  iconSize:[24,24],
  iconAnchor:[12,12],
  className:''
});

L.marker([${coords.latitude},${coords.longitude}],{icon:userIcon}).addTo(map);

let mechanicMarkers=[];

let mechanicIcon=L.divIcon({
  html:'<div class="mechanic-icon"></div>',
  iconSize:[64,64],
  iconAnchor:[32,32],
  className:''
});

function updateMechanics(mechanics){
  mechanicMarkers.forEach(m=>map.removeLayer(m));
  mechanicMarkers=[];
  mechanics.forEach(m=>{
    if(!m.latitude || !m.longitude) return;
    const marker=L.marker([m.latitude,m.longitude],{icon:mechanicIcon}).addTo(map);
    mechanicMarkers.push(marker);
  });
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
          <iframe
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <NativeWebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
          />
        )}
      </View>

      {/* IDLE STATE */}
      {stage === "idle" && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendRequest}
            disabled={sending}
          >
            <Text style={styles.buttonText}>
              {sending
                ? "Sending..."
                : `Request ${vehicleType ?? ""} Mechanic`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WAITING STATE (MERGED waiting.tsx UI) */}
      {stage === "waiting" && (
        <View style={styles.waitingPanel}>
          <View style={styles.dragIndicator} />
          <Text style={styles.waitingTitle}>
            Searching for Mechanic...
          </Text>
          <Text style={styles.waitingSub}>
            Request ID: {requestId}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  bottomSheet: {
    padding: 16,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
    padding: 20,
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

  waitingSub: {
    marginTop: 10,
    color: "#666",
  },
});