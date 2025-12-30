// app/(tabs)/evhelp/tracking.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Map components are imported dynamically on native only to avoid web bundling issues
import { useLocalSearchParams } from "expo-router";
import { listenEvRequest, EvRequest } from "../../../services/evRequests";
import * as Location from "expo-location";

export default function EvTrackingScreen() {
  const params = useLocalSearchParams();
  const { requestId } = params as { requestId?: string };
  const [request, setRequest] = useState<any>(null);
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [MapComponents, setMapComponents] = useState<any>(null);
  const mapRef = useRef<any>(null);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      setUserLoc({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (!requestId) return;
    let unsubscribe: (() => void) | null = null;

    const unsubscribePromise = listenEvRequest(requestId, (doc: EvRequest) => {
      setRequest(doc);
    });
    unsubscribePromise.then((off: () => void) => {
      unsubscribe = off;
    });

    return () => {
      unsubscribe?.();
    };
  }, [requestId]);

  useEffect(() => {
    const mechLoc = request?.mechanicLocation;
    if (mapRef.current && userLoc && mechLoc) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLoc.latitude, longitude: userLoc.longitude },
          { latitude: mechLoc.lat, longitude: mechLoc.lng },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 120, left: 60 },
          animated: true,
        }
      );
    }
  }, [userLoc, request?.mechanicLocation]);

  if (!request) {
    return (
      <SafeAreaView style={t.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const mechLoc = request.mechanicLocation;

  return (
    <SafeAreaView style={t.container}>
      {Platform.OS === "web" ? (
        <View style={t.map}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Map not available on web
          </Text>
          {mechLoc && (
            <Text style={{ textAlign: "center" }}>
              Mechanic: {mechLoc.lat.toFixed(5)},{mechLoc.lng.toFixed(5)}
            </Text>
          )}
        </View>
      ) : !MapComponents ? (
        <ActivityIndicator />
      ) : (
        (() => {
          const MapViewComp: any =
            MapComponents.default ?? MapComponents.MapView ?? MapComponents;
          const MarkerComp: any = MapComponents.Marker ?? MapViewComp?.Marker;
          const PolylineComp: any =
            MapComponents.Polyline ?? MapViewComp?.Polyline;
          if (!MapViewComp) return <ActivityIndicator />;
          return (
            <MapViewComp
              ref={(r: any) => {
                mapRef.current = r;
              }}
              style={t.map}
              initialRegion={{
                latitude: userLoc?.latitude ?? (mechLoc ? mechLoc.lat : 17.0),
                longitude: userLoc?.longitude ?? (mechLoc ? mechLoc.lng : 82.0),
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
            >
              {mechLoc &&
                (MarkerComp ? (
                  <MarkerComp
                    coordinate={{
                      latitude: mechLoc.lat,
                      longitude: mechLoc.lng,
                    }}
                    title="EV Mechanic"
                  >
                    <View style={t.mechMarker}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        ⚡️
                      </Text>
                    </View>
                  </MarkerComp>
                ) : MapViewComp?.Marker ? (
                  <MapViewComp.Marker
                    coordinate={{
                      latitude: mechLoc.lat,
                      longitude: mechLoc.lng,
                    }}
                    title="EV Mechanic"
                  >
                    <View style={t.mechMarker}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        ⚡️
                      </Text>
                    </View>
                  </MapViewComp.Marker>
                ) : null)}

              {userLoc &&
                mechLoc &&
                (PolylineComp ? (
                  <PolylineComp
                    coordinates={[
                      {
                        latitude: userLoc.latitude,
                        longitude: userLoc.longitude,
                      },
                      { latitude: mechLoc.lat, longitude: mechLoc.lng },
                    ]}
                    strokeWidth={3}
                  />
                ) : MapViewComp?.Polyline ? (
                  <MapViewComp.Polyline
                    coordinates={[
                      {
                        latitude: userLoc.latitude,
                        longitude: userLoc.longitude,
                      },
                      { latitude: mechLoc.lat, longitude: mechLoc.lng },
                    ]}
                    strokeWidth={3}
                  />
                ) : null)}
            </MapViewComp>
          );
        })()
      )}

      <View style={t.info}>
        <Text style={t.infoText}>
          Mechanic: {request?.mechanicInfo?.name ?? "Assigned"}
        </Text>
        <Text style={t.infoText}>Vehicle: {request?.vehicleType}</Text>
        <Text style={t.infoText}>Status: {request?.status}</Text>
      </View>
    </SafeAreaView>
  );
}

const t = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  mechMarker: { backgroundColor: "#0b86d6", padding: 6, borderRadius: 20 },
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
