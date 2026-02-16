import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type Garage = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceLabel: string;
};

export default function GarageMapScreen() {
  const router = useRouter();

  const userLat = 17.385044;
  const userLng = 78.486671;

  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Garage | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setGarages([
        {
          id: "g1",
          name: "Sri Sai Auto Garage",
          lat: 17.389,
          lng: 78.486,
          distanceLabel: "500 m",
        },
        {
          id: "g2",
          name: "Ravi Bike Point",
          lat: 17.372,
          lng: 78.486,
          distanceLabel: "1.5 km",
        },
        {
          id: "g3",
          name: "Speed Car Care",
          lat: 17.385,
          lng: 78.510,
          distanceLabel: "3 km",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  /* ================= MAP URL ================= */

  const mapUrl = `https://www.google.com/maps?q=${userLat},${userLng}&z=14&output=embed`;

  const onRequestHelp = () => {
    if (!selected) return;

    router.push({
      pathname: "/garage/vehicles",
      params: {
        garageId: selected.id,
        garageName: selected.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nearby Garages</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {/* ================= MAP ================= */}

          {Platform.OS === "web" ? (
            <iframe
              src={mapUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
            />
          ) : (
            (() => {
              const { WebView } = require("react-native-webview");
              return (
                <WebView
                  source={{ uri: mapUrl }}
                  style={styles.map}
                />
              );
            })()
          )}

          {/* ================= GARAGE LIST ================= */}

          {garages.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={styles.listItem}
              onPress={() => setSelected(g)}
            >
              <Text style={styles.garageName}>{g.name}</Text>
              <Text style={styles.distance}>{g.distanceLabel}</Text>
            </TouchableOpacity>
          ))}

          {/* ================= BOTTOM CARD ================= */}

          {selected && (
            <View style={styles.bottomCard}>
              <Text style={styles.bottomTitle}>{selected.name}</Text>
              <Text style={styles.bottomAddress}>
                Distance: {selected.distanceLabel}
              </Text>

              <TouchableOpacity style={styles.helpBtn} onPress={onRequestHelp}>
                <Text style={styles.helpText}>Request Help</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  title: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  map: { height: 300 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  garageName: { fontWeight: "700" },

  distance: { color: "#555", marginTop: 4 },

  bottomCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 4,
  },

  bottomTitle: { fontSize: 16, fontWeight: "700" },

  bottomAddress: { marginTop: 4, color: "#555" },

  helpBtn: {
    marginTop: 10,
    backgroundColor: "#0b66d6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  helpText: { color: "#fff", fontWeight: "700" },
});
