import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  Platform,
} from "react-native";

import * as Location from "expo-location";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { getLastLocation, saveLastLocation } from "@/utils/mapStorage";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Coords = {
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: number;
};

type Props = {
  acceptedRequest?: {
    $id: string;
    user_lat: number;
    user_lng: number;
  } | null;
};

export default function DutyMap({ acceptedRequest }: Props) {
  const webViewRef = useRef<any>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastGoodRef = useRef<Coords | null>(null);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconBase64, setIconBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= ICON LOAD ================= */
  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(
        require("../../../../assets/images/Mechnaic-icon.webp")
      );
      await asset.downloadAsync();

      if (Platform.OS === "web") {
        setIconBase64(asset.uri);
      } else {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
          encoding: "base64",
        });
        setIconBase64(`data:image/webp;base64,${base64}`);
      }
    })();
  }, []);

  /* ================= GPS ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const quick = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const first: Coords = {
        latitude: quick.coords.latitude,
        longitude: quick.coords.longitude,
        heading: quick.coords.heading ?? 0,
        timestamp: Date.now(),
      };

      setCoords(first);
      lastGoodRef.current = first;
      await saveLastLocation(first);
      setLoading(false);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        async (loc) => {
          if (!active) return;

          const next: Coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? 0,
            timestamp: Date.now(),
          };

          setCoords(next);
          lastGoodRef.current = next;
          await saveLastLocation(next);

          /* 🔥 SEND LIVE LOCATION TO BACKEND */
          if (acceptedRequest && API_URL) {
            fetch(`${API_URL}/api/service/update-location`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify({
                requestId: acceptedRequest.$id,
                mechanic_lat: next.latitude,
                mechanic_lng: next.longitude,
              }),
            }).catch(() => {});
          }
        }
      );
    })();

    return () => {
      active = false;
      watchRef.current?.remove();
    };
  }, [acceptedRequest]);

  /* ================= MAP HTML ================= */
  const mapHtml =
  coords && iconBase64
    ? `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css"/>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>

<style>
html,body,#map{height:100%;margin:0}
.leaflet-div-icon{background:transparent;border:none;}
.mechanic-icon{
  width:64px;height:64px;
  background-image:url('${iconBase64}');
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

let mechanicIcon=L.divIcon({
  html:'<div class="mechanic-icon"></div>',
  iconSize:[64,64],
  iconAnchor:[32,32],
  className:''
});

let mechMarker=L.marker(
  [${coords.latitude},${coords.longitude}],
  {icon: mechanicIcon}
).addTo(map);

${
  acceptedRequest
    ? `
L.Routing.control({
  waypoints: [
    L.latLng(${coords.latitude}, ${coords.longitude}),
    L.latLng(${acceptedRequest.user_lat}, ${acceptedRequest.user_lng})
  ],
  lineOptions: {
    styles: [{color: 'blue', weight: 6}]
  },
  createMarker: function(i, wp, nWps) {
    return L.marker(wp.latLng);
  },
  routeWhileDragging: false,
  addWaypoints: false,
  draggableWaypoints: false,
  fitSelectedRoutes: true,
  show: false
}).addTo(map);
`
    : ""
}
</script>
</body>
</html>
`
    : "";


  if (loading || !coords || !iconBase64) {
    return (
      <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
        <ActivityIndicator size="large" />
        <Text>Loading map…</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
        <iframe
          srcDoc={mapHtml}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </View>
    );
  }

  const NativeWebView = require("react-native-webview").WebView;

  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
      <NativeWebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
});
