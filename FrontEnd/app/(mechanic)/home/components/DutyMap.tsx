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
        require("../../../../assets/images/Mechnaic-icon.webp"),
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
        setIconBase64(`data:image/webp;base64,${base64}`);
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
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const quick = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

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
        },
      );
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

.mechanic-icon{
width:52px;
height:52px;
background-image:url('${iconBase64}');
background-size:contain;
background-repeat:no-repeat;
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

let mechanicIcon = L.divIcon({
html:'<div class="mechanic-icon"></div>',
iconSize:[52,52],
iconAnchor:[26,26],
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
