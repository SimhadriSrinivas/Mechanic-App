import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform,
} from "react-native";

import * as Location from "expo-location";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { saveLastLocation } from "@/utils/mapStorage";

// Conditional import for web
let WebView: any;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

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
    user_phone?: string;
  } | null;
};

export default function DutyMap({ acceptedRequest }: Props) {
  const webViewRef = useRef<any>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastSentRef = useRef<number>(0);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconBase64, setIconBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ICON ================= */

  useEffect(() => {
    const loadIcon = async () => {
      const asset = Asset.fromModule(
        require("../../../../assets/images/Mechanic-icon.png"),
      );

      await asset.downloadAsync();

      const uri = asset.localUri || asset.uri;
      if (!uri) {
        console.warn("DutyMap: icon URI is unavailable");
        return;
      }

      if (Platform.OS === "web") {
        // expo-file-system.readAsStringAsync is not available on web
        setIconBase64(uri);
        return;
      }

      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setIconBase64(`data:image/png;base64,${base64}`);
      } catch (error) {
        console.warn(
          "DutyMap: FileSystem.readAsStringAsync failed, using URI fallback",
          error,
        );
        setIconBase64(uri);
      }
    };

    loadIcon();
  }, []);

  /* ================= SEND LOCATION ================= */

  const sendLocationToServer = async (location: Coords) => {
    if (!acceptedRequest || !API_URL) return;

    try {
      const now = Date.now();
      if (now - lastSentRef.current < 3000) return;
      lastSentRef.current = now;

      await fetch(`${API_URL}/api/service/update-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          requestId: acceptedRequest.$id,
          mechanic_lat: location.latitude,
          mechanic_lng: location.longitude,
        }),
      });
    } catch (err) {
      console.log("Location update failed:", err);
    }
  };

  /* ================= GPS ================= */

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLoading(false);
          return;
        }

        let quick = null;
        try {
          quick = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
        } catch {
          quick = await Location.getLastKnownPositionAsync();
        }

        if (!quick) {
          console.warn("DutyMap: current location unavailable");
          setLoading(false);
          return;
        }

        const first: Coords = {
          latitude: quick.coords.latitude,
          longitude: quick.coords.longitude,
          heading: quick.coords.heading ?? 0,
          timestamp: Date.now(),
        };

        if (!active) return;

        setCoords(first);
        await saveLastLocation(first);
        await sendLocationToServer(first);

        setLoading(false);

        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 3000,
            distanceInterval: 3,
          },
          async (loc) => {
            if (!active) return;

            try {
              const next: Coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                heading: loc.coords.heading ?? 0,
                timestamp: Date.now(),
              };

              setCoords(next);
              await saveLastLocation(next);
              await sendLocationToServer(next);

              // Only inject JS on native platforms
              if (Platform.OS !== "web") {
                webViewRef.current?.injectJavaScript(`
                  window.updateMechanic(${next.latitude}, ${next.longitude});
                  true;
                `);
              }
            } catch (watchErr) {
              console.warn("DutyMap: watch location update failed", watchErr);
            }
          },
        );
      } catch (err) {
        console.warn("DutyMap: location initialization failed", err);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
      try {
        watchRef.current?.remove();
      } catch {}
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

<link rel="stylesheet"
href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<style>

html,body,#map{
height:100%;
margin:0;
padding:0;
}

.leaflet-div-icon{
background:transparent;
border:none;
}

.user-dot{
width:16px;
height:16px;
background:#2563eb;
border-radius:50%;
border:3px solid white;
box-shadow:0 0 0 6px rgba(37,99,235,0.2);
}

.mechanic-icon-img{
filter:drop-shadow(0 1px 2px rgba(0,0,0,0.25));
}
</style>
</head>

<body>

<div id="map"></div>

<script>

let map = L.map('map',{
zoomControl:false,
preferCanvas:true
}).setView([${coords.latitude},${coords.longitude}],16);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
maxZoom:19
}).addTo(map);

let userIcon = L.divIcon({
html:'<div class="user-dot"></div>',
iconSize:[24,24],
iconAnchor:[12,12],
className:''
});

/* Mechanic marker SVG (top view) */
const svg = \`<svg xmlns="http://www.w3.org/2000/svg"
  width="100%" height="100%" viewBox="0 0 52 52"
  style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">

  <!-- Front wheel -->
  <g transform="rotate(90 26 8)">
    <rect x="18.5" y="5.2" width="15" height="5.6" rx="2.8" fill="#0b0f14" stroke="#374151" stroke-width="0.8"/>
    <line x1="20" y1="8" x2="32" y2="8" stroke="#6b7280" stroke-width="0.5" opacity="0.45"/>
  </g>

  <!-- Steering and fork -->
  <rect x="25.2" y="10.7" width="1.6" height="4.1" rx="0.8" fill="#1f2937"/>
  <rect x="15.7" y="14.3" width="20.6" height="3.3" rx="1.6" fill="#1f2937" stroke="#374151" stroke-width="0.45"/>

  <!-- Main frame -->
  <path d="M23.6 17.8 L24.8 42.9 L27.2 42.9 L28.4 17.8Z" fill="#0f172a"/>
  <rect x="25.35" y="18.9" width="1.3" height="22.2" rx="0.65" fill="#1e293b"/>

  <!-- Body panel -->
  <rect x="21.8" y="21.4" width="8.4" height="9.4" rx="2.4" fill="#1e3a5f" stroke="#2563eb" stroke-width="0.9"/>
  <line x1="23.1" y1="24" x2="28.9" y2="24" stroke="#3b82f6" stroke-width="0.55" opacity="0.8"/>
  <line x1="23.1" y1="26" x2="28.9" y2="26" stroke="#3b82f6" stroke-width="0.55" opacity="0.8"/>
  <line x1="23.1" y1="28" x2="28.9" y2="28" stroke="#3b82f6" stroke-width="0.55" opacity="0.55"/>

  <!-- Rear wheel (moved slightly to front) -->
  <g transform="translate(0 -7.8) rotate(90 26 46)">
    <rect x="18.6" y="43" width="14.8" height="5.8" rx="2.9" fill="#0b0f14" stroke="#374151" stroke-width="0.8"/>
    <line x1="20" y1="46" x2="32" y2="46" stroke="#6b7280" stroke-width="0.5" opacity="0.45"/>
  </g>

  <!-- Rider torso -->
  <path d="M19.1 18.7 Q19 16.9 26 16.9 Q33 16.9 32.9 18.7 L32.1 28 Q32 30.6 26 30.6 Q20 30.6 19.9 28Z"
    fill="#0f172a" stroke="#1d4ed8" stroke-width="0.8"/>
  <line x1="26" y1="17.3" x2="26" y2="30" stroke="#1e40af" stroke-width="0.75" opacity="0.6"/>

  <!-- Arms and hands -->
  <path d="M20.8 21 Q18.7 20 17.2 18.2" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M31.2 21 Q33.3 20 34.8 18.2" stroke="#1f2937" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <circle cx="17" cy="18" r="1.2" fill="#475569"/>
  <circle cx="35" cy="18" r="1.2" fill="#475569"/>

  <!-- Tool bag -->
  <path d="M31.2 32.3 L32.4 33.4" stroke="#1f2937" stroke-width="1" stroke-linecap="round"/>
  <rect x="32.2" y="31.2" width="8.8" height="7.6" rx="1.8" fill="#1e3a5f" stroke="#2563eb" stroke-width="0.75"/>
  <rect x="32.6" y="29.7" width="8" height="2.1" rx="1" fill="#334155" stroke="#4b5563" stroke-width="0.35"/>
  <line x1="33.2" y1="35.5" x2="40.2" y2="35.5" stroke="#60a5fa" stroke-width="0.45" opacity="0.65"/>

  <!-- Helmet / head (cleaner look) -->
  <ellipse cx="26" cy="14.3" rx="6.9" ry="6.1" fill="#0369a1" stroke="#0284c7" stroke-width="0.95"/>
  <path d="M19.7 12.1 Q26 10.1 32.3 12.1 Q31.8 15 26 15 Q20.2 15 19.7 12.1Z" fill="#082f49" opacity="0.74"/>
  <ellipse cx="23.9" cy="11.8" rx="2.2" ry="1.2" fill="#bae6fd" opacity="0.27" transform="rotate(-15 23.9 11.8)"/>

  <!-- Helmet badge -->
  <circle cx="26" cy="17.4" r="2.5" fill="#ffffff" stroke="#bae6fd" stroke-width="0.45"/>
  <text x="26" y="18.4" text-anchor="middle"
    font-size="3.4" font-weight="700"
    font-family="Arial, sans-serif"
    fill="#0369a1">M</text>
</svg>\`;

let mechanicIcon = L.divIcon({
html:svg,
iconSize:[46,46],
iconAnchor:[23,38],
popupAnchor:[0,-41],
className:''
});

let mechanicMarker = L.marker(
[${coords.latitude},${coords.longitude}],
{icon:mechanicIcon}
).addTo(map);

window.updateMechanic = function(lat,lng){
mechanicMarker.setLatLng([lat,lng]);
map.panTo([lat,lng],{
animate:true,
duration:0.5
});
};

window.centerMechanic = function(){
map.panTo(mechanicMarker.getLatLng(),{
animate:true,
duration:0.5
});
};

${
  acceptedRequest
    ? `
let userMarker = L.marker(
[${acceptedRequest.user_lat},${acceptedRequest.user_lng}],
{icon:userIcon}
).addTo(map);

fetch(
'https://router.project-osrm.org/route/v1/driving/${coords.longitude},${coords.latitude};${acceptedRequest.user_lng},${acceptedRequest.user_lat}?overview=simplified&geometries=geojson'
)
.then(res=>res.json())
.then(data=>{
const route=data.routes[0].geometry;

L.geoJSON(route,{
style:{
color:'#2563eb',
weight:5
}
}).addTo(map);

});
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading map…</Text>
      </View>
    );
  }

  /* expose function to other components */
  (window as any).centerMechanicOnMap = () => {
    if (Platform.OS !== "web") {
      webViewRef.current?.injectJavaScript(`
        window.centerMechanic();
        true;
      `);
    } else {
      // On web, call the function directly
      const mapWindow = (webViewRef.current as any)?.contentWindow || window;
      try {
        mapWindow.centerMechanic?.();
      } catch (e) {
        console.warn("Could not call centerMechanic on web:", e);
      }
    }
  };

  // Render for web using iframe
  if (Platform.OS === "web") {
    return (
      <iframe
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        srcDoc={mapHtml}
        title="Service Location Map"
      />
    );
  }

  // Render for native using WebView
  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        cacheEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  mapContainer: {
    flex: 1,
  },
});
