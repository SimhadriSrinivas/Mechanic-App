// app/(tabs)/centers/index.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Map components are imported dynamically on native only to avoid web bundling issues
import * as Location from "expo-location";
import {
  ServiceCenter,
  getNearbyServiceCenters,
} from "../../../services/placesApi";

export default function ServiceCentersScreen() {
  const [MapComponents, setMapComponents] = useState<any>(null);
  const mapRef = useRef<any>(null);

  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let mounted = true;
    (async () => {
      const mod = await import("react-native-maps");
      if (mounted) setMapComponents(mod);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setUserLoc({ latitude: lat, longitude: lng });

        const list = await getNearbyServiceCenters(lat, lng);
        setCenters(list);

        setLoading(false);

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            800
          );
        }
      } catch (e) {
        console.warn("Error loading service centers", e);
        setLoading(false);
      }
    })();
  }, []);

  const openInGoogleMaps = (center: ServiceCenter) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nearby Service Centers</Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}

      {!loading && !userLoc && (
        <View style={styles.center}>
          <Text>Location permission denied.</Text>
        </View>
      )}

      {!loading &&
        userLoc &&
        (Platform.OS === "web" ? (
          <View style={styles.map}>
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Map not available on web
            </Text>
            <Text style={{ textAlign: "center" }}>
              Location: {userLoc.latitude.toFixed(5)},
              {userLoc.longitude.toFixed(5)}
            </Text>
          </View>
        ) : !MapComponents ? (
          <ActivityIndicator />
        ) : (
          (() => {
            const MapViewComp: any =
              MapComponents.default ?? MapComponents.MapView ?? MapComponents;
            const MarkerComp: any = MapComponents.Marker ?? MapViewComp?.Marker;
            if (!MapViewComp) return <ActivityIndicator />;
            return (
              <MapViewComp
                ref={(r: any) => {
                  mapRef.current = r;
                }}
                style={styles.map}
                initialRegion={{
                  latitude: userLoc.latitude,
                  longitude: userLoc.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
              >
                {centers.map((c) =>
                  MarkerComp ? (
                    <MarkerComp
                      key={c.id}
                      coordinate={{ latitude: c.lat, longitude: c.lng }}
                      title={c.name}
                      description={c.address}
                      onPress={() => openInGoogleMaps(c)}
                    />
                  ) : MapViewComp?.Marker ? (
                    <MapViewComp.Marker
                      key={c.id}
                      coordinate={{ latitude: c.lat, longitude: c.lng }}
                      title={c.name}
                      description={c.address}
                      onPress={() => openInGoogleMaps(c)}
                    />
                  ) : null
                )}
              </MapViewComp>
            );
          })()
        ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
