import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { getLastLocation, saveLastLocation } from "@/utils/mapStorage";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Coords = {
  latitude: number;
  longitude: number;
  heading: number;
  timestamp: number;
};

export default function DutyMap() {
  const webViewRef = useRef<WebView>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastGoodRef = useRef<Coords | null>(null);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconBase64, setIconBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= ICON LOAD (APK SAFE, ONCE) ================= */
  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(
        require("../../../../assets/images/Mechnaic-icon.webp"),
      );
      await asset.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
        encoding: "base64",
      });
      setIconBase64(`data:image/webp;base64,${base64}`);
    })();
  }, []);

  /* ================= INSTANT MAP LOCATION (CACHE FIRST) ================= */
  useEffect(() => {
    (async () => {
      const stored = await getLastLocation();
      if (stored) {
        lastGoodRef.current = stored;
        setCoords(stored);
        setLoading(false);
      }
    })();
  }, []);

  /* ================= GPS INIT + LIVE TRACKING ================= */
  useEffect(() => {
    let active = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // FAST FIRST FIX (DO NOT BLOCK MAP)
      const quick = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const first: Coords = {
        latitude: quick.coords.latitude,
        longitude: quick.coords.longitude,
        heading: quick.coords.heading ?? 0,
        timestamp: Date.now(),
      };

      lastGoodRef.current = first;
      setCoords(first);
      await saveLastLocation(first);
      setLoading(false);

      // HIGH ACCURACY CONTINUOUS TRACKING
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (loc) => {
          if (!active) return;
          if (loc.coords.accuracy && loc.coords.accuracy > 15) return;

          const next: Coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading:
              loc.coords.speed && loc.coords.speed > 0.5
                ? (loc.coords.heading ?? lastGoodRef.current?.heading ?? 0)
                : (lastGoodRef.current?.heading ?? 0),
            timestamp: Date.now(),
          };

          lastGoodRef.current = next;
          setCoords(next);
          await saveLastLocation(next);

          // 🔥 UPDATE MARKER WITHOUT RELOADING MAP
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(
              `window.updateMarker(${JSON.stringify(next)});true;`,
            );
          }
        },
      );
    })();

    return () => {
      active = false;
      watchRef.current?.remove();
    };
  }, []);

  /* ================= MAP HTML (LOAD ONCE) ================= */
  const mapHtml = coords
    ? `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<style>
html,body,#map{height:100%;margin:0}

/* REMOVE LEAFLET DEFAULT BOX */
.leaflet-div-icon{
  background:transparent !important;
  border:none !important;
}

/* MECHANIC ICON */
.mechanic-icon{
  width:64px;
  height:64px;
  background-image:url('${iconBase64}');
  background-repeat:no-repeat;
  background-size:contain;
  background-position:center;
  transform-origin:50% 70%;
}

/* CONTROLS */
.ctrl-group{
  position:absolute;
  right:12px;
  bottom:12px;
  display:flex;
  flex-direction:column;
  gap:10px;
  z-index:1000;
}
.ctrl-btn{
  width:44px;
  height:44px;
  background:#fff;
  border-radius:22px;
  box-shadow:0 2px 6px rgba(0,0,0,.3);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
}
</style>
</head>

<body>
<div id="map"></div>

<div class="ctrl-group">
  <div class="ctrl-btn" onclick="map.zoomIn()">+</div>
  <div class="ctrl-btn" onclick="map.zoomOut()">−</div>
  <div class="ctrl-btn" onclick="center()">📍</div>
</div>

<script>
let map=L.map('map',{zoomControl:false,attributionControl:false})
  .setView([${coords.latitude},${coords.longitude}],18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19
}).addTo(map);

let icon=L.divIcon({
  html:'<div id="bike" class="mechanic-icon"></div>',
  iconSize:[64,64],
  iconAnchor:[32,45],
  className:''
});

let marker=L.marker(
  [${coords.latitude},${coords.longitude}],
  {icon}
).addTo(map);

window.updateMarker=function(d){
  marker.setLatLng([d.latitude,d.longitude]);
  document.getElementById("bike").style.transform =
    'rotate('+d.heading+'deg)';
};

window.center=function(){
  map.setView(marker.getLatLng(),map.getZoom(),{animate:true});
};
</script>
</body>
</html>
`
    : "";

  if (loading || !coords || !iconBase64) {
    return (
      <View style={[styles.container, { height: SCREEN_HEIGHT * 0.75 }]}>
        <ActivityIndicator size="large" />
        <Text>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT * 0.75 }]}>
      <WebView
        ref={webViewRef}
        key="mechanic-map"
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f2f2f2",
  },
});
