import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";

import { createRequest } from "@/services/requests";
import { getLoggedInPhone } from "@/utils/storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Tracking() {
  const router = useRouter();
  const { vehicleType } = useLocalSearchParams<{ vehicleType?: string }>();

  const webViewRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permission required", "Location permission is needed");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!mounted) return;

        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        Alert.alert("Error", "Failed to get location");
      }
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

 /* ================= FETCH NEARBY MECHANICS (ROLE BASED) ================= */
useEffect(() => {
  if (!coords || !vehicleType) return;

  const roleMap: Record<string, string> = {
    bike: "Bike Mechanic",
    car: "Car Mechanic",
    auto: "Auto Mechanic",
    truck: "Truck Mechanic",
  };

  const selectedRole = roleMap[vehicleType];

  if (!selectedRole) {
    console.log("Invalid vehicleType:", vehicleType);
    return;
  }

  const fetchNearby = async () => {
    try {
      const url = `${API_URL}/api/mechanic/nearby?lat=${coords.latitude}&lng=${coords.longitude}&role=${encodeURIComponent(
        selectedRole
      )}&radius=10&_=${Date.now()}`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "Cache-Control": "no-cache",
        },
      });

      const text = await res.text();

      // 🔥 Prevent crash if backend returns HTML (ngrok issue)
      if (!text.startsWith("{")) {
        console.log("Invalid JSON response:", text);
        return;
      }

      const data = JSON.parse(text);

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

  // First call immediately
  fetchNearby();

  // Then repeat every 3 seconds
  intervalRef.current = setInterval(fetchNearby, 3000);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [coords, vehicleType]);
  /* ================= SEND SERVICE REQUEST ================= */
  const sendRequest = async () => {
    try {
      if (loading) return;

      setLoading(true);

      const phone = await getLoggedInPhone();

      if (!phone || !coords) {
        Alert.alert("Error", "User not logged in or location unavailable");
        return;
      }

      if (!vehicleType) {
        Alert.alert("Error", "Vehicle type missing");
        return;
      }

      const payload = {
        userPhone: phone,
        lat: coords.latitude,
        lng: coords.longitude,
        service: "general-repair",
        vehicleType,
      };

      const requestId = await createRequest(payload);

      router.replace({
        pathname: "/service/waiting",
        params: { requestId },
      });
    } catch (err) {
      console.error("sendRequest error:", err);
      Alert.alert("Error", "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  if (!coords) {
    return <ActivityIndicator style={{ marginTop: 100 }} />;
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
.user-marker{
  width:18px;
  height:18px;
  background:#007bff;
  border-radius:50%;
  border:3px solid white;
}
.mechanic-marker{
  width:16px;
  height:16px;
  background:#e74c3c;
  border-radius:50%;
  border:3px solid white;
}
</style>
</head>

<body>
<div id="map"></div>

<script>
let map = L.map('map',{
  zoomControl:false,
  attributionControl:false
}).setView([${coords.latitude}, ${coords.longitude}], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19
}).addTo(map);

let userIcon = L.divIcon({
  html:'<div class="user-marker"></div>',
  iconSize:[18,18],
  className:''
});

L.marker([${coords.latitude}, ${coords.longitude}],{icon:userIcon}).addTo(map);

let mechanicMarkers = [];

function updateMechanics(mechanics) {

  mechanicMarkers.forEach(m => map.removeLayer(m));
  mechanicMarkers = [];

  mechanics.forEach(m => {
    if(!m.latitude || !m.longitude) return;

    let icon = L.divIcon({
      html:'<div class="mechanic-marker"></div>',
      iconSize:[16,16],
      className:''
    });

    const marker = L.marker([m.latitude, m.longitude],{icon}).addTo(map);
    mechanicMarkers.push(marker);
  });
}
</script>
</body>
</html>
`;

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === "web" ? (
        <iframe
          srcDoc={mapHtml}
          style={{ flex: 1, border: "none", width: "100%" }}
        />
      ) : (
        (() => {
          const { WebView } = require("react-native-webview");
          return (
            <WebView
              ref={webViewRef}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              mixedContentMode="always"
              style={{ flex: 1 }}
            />
          );
        })()
      )}

      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.button}
          onPress={sendRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Sending Request..."
              : `Request ${vehicleType ?? ""} Mechanic`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
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
});
