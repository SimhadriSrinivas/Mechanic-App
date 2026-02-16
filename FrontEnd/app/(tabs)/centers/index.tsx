import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

export default function ServiceCentersScreen() {
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        setUserLoc({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        setLoading(false);
      } catch (e) {
        console.log("Location error:", e);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!userLoc) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Location permission denied.</Text>
      </SafeAreaView>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/service+center/@${userLoc.latitude},${userLoc.longitude},14z`;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nearby Service Centers</Text>

      {/* ================= WEB ================= */}
      {Platform.OS === "web" ? (
        <iframe
          src={googleMapsUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      ) : (
        /* ================= MOBILE ================= */
        (() => {
          const WebView = require("react-native-webview").WebView;

          return (
            <WebView
              source={{ uri: googleMapsUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
            />
          );
        })()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
