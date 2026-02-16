// app/(tabs)/evhelp/tracking.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function EvTrackingScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();

  const [request, setRequest] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const intervalRef = useRef<any>(null);

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserLoc({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({});
      setUserLoc({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    })();
  }, []);

  /* ================= POLL BACKEND ================= */
  const fetchRequest = async () => {
    try {
      if (!requestId) return;

      const res = await fetch(`${API_URL}/api/ev/${requestId}`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }

      if (res.ok && data.success) {
        setRequest(data.data);
      }
    } catch (err) {
      console.log("EV tracking fetch error:", err);
    }
  };

  useEffect(() => {
    if (!requestId) return;

    fetchRequest();
    intervalRef.current = setInterval(fetchRequest, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [requestId]);

  if (!request || !userLoc) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const mechLat = request?.mechanic_lat ?? userLoc.latitude;
  const mechLng = request?.mechanic_lng ?? userLoc.longitude;

  /* ================= GOOGLE MAP HTML ================= */

  const mapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAP_API_KEY"></script>
    <script>
      function initMap() {
        const user = { lat: ${userLoc.latitude}, lng: ${userLoc.longitude} };
        const mechanic = { lat: ${mechLat}, lng: ${mechLng} };

        const map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: user,
        });

        new google.maps.Marker({
          position: user,
          map: map,
          title: "You",
        });

        new google.maps.Marker({
          position: mechanic,
          map: map,
          title: "Mechanic",
        });

        const line = new google.maps.Polyline({
          path: [user, mechanic],
          geodesic: true,
          strokeColor: "#1a84e6",
          strokeOpacity: 1.0,
          strokeWeight: 3,
        });

        line.setMap(map);
      }
    </script>
  </head>
  <body onload="initMap()">
    <div id="map"></div>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
      />

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Mechanic: {request?.mechanic_phone ?? "Searching..."}
        </Text>
        <Text style={styles.infoText}>
          Vehicle: {request?.vehicle_type ?? "EV"}
        </Text>
        <Text style={styles.infoText}>
          Status: {request?.status ?? "pending"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  info: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 3,
  },
  infoText: { fontWeight: "700" },
});
