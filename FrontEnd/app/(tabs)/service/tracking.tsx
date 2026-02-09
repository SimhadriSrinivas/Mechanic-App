import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";

import { createRequest } from "@/services/requests";
import { getLoggedInPhone } from "@/utils/storage";

export default function Tracking() {
  const router = useRouter();
  const { vehicleType } = useLocalSearchParams<{ vehicleType: string }>();

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission is needed");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  /* ================= SEND SERVICE REQUEST ================= */
  const sendRequest = async () => {
    try {
      setLoading(true);

      const phone = await getLoggedInPhone();
      if (!phone || !coords) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const payload = {
        userPhone: phone,
        lat: coords.latitude,
        lng: coords.longitude,
        service: "general-repair",
        vehicleType, // ✅ CORRECT VEHICLE TYPE
      };

      console.log("📤 Final payload sent:", payload);

      const requestId = await createRequest(payload);

      router.replace({
        pathname: "/service/waiting",
        params: { requestId },
      });
    } catch (err) {
      console.error("❌ sendRequest error:", err);
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
.leaflet-div-icon{
  background:transparent !important;
  border:none !important;
}
.user-marker{
  width:18px;
  height:18px;
  background:#007bff;
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
}).setView([${coords.latitude}, ${coords.longitude}], 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19
}).addTo(map);

let icon = L.divIcon({
  html:'<div class="user-marker"></div>',
  iconSize:[18,18],
  className:''
});

L.marker([${coords.latitude}, ${coords.longitude}],{icon}).addTo(map);
</script>
</body>
</html>
`;

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <WebView
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        style={{ flex: 1 }}
      />

      {/* BOTTOM ACTION (RAPIDO STYLE) */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.button}
          onPress={sendRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending Request..." : `Request ${vehicleType} Mechanic`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

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
