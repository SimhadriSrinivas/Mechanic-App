import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Dimensions,
  Platform,
} from "react-native";

import * as Location from "expo-location";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { saveLastLocation } from "@/utils/mapStorage";

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
  const fallbackIntervalRef = useRef<any>(null);
  const lastSentRef = useRef<number>(0);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [iconBase64, setIconBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= ICON LOAD ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const asset = Asset.fromModule(
        require("../../../../assets/images/Mechnaic-icon.webp")
      );
      await asset.downloadAsync();

      if (!mounted) return;

      if (Platform.OS === "web") {
        setIconBase64(asset.uri);
      } else {
        const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
          encoding: "base64",
        });
        setIconBase64(`data:image/webp;base64,${base64}`);
      }
    })();

    return () => {
      mounted = false;
    };
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
        const { status } =
          await Location.requestForegroundPermissionsAsync();

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
          }
        );

        fallbackIntervalRef.current = setInterval(async () => {
          if (coords) {
            await sendLocationToServer(coords);
          }
        }, 5000);
      } catch (err) {
        console.log("GPS Error:", err);
        setLoading(false);
      }
    })();

    return () => {
      active = false;

      try {
        if (watchRef.current?.remove) {
          watchRef.current.remove();
        }
      } catch {}

      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
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
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

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

let map=L.map('map',{
  preferCanvas:true,
  zoomAnimation:false,
  fadeAnimation:false
}).setView([${coords.latitude},${coords.longitude}],15);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  maxZoom:19,
  maxNativeZoom:19,
  updateWhenIdle:true,
  keepBuffer:2
}).addTo(map);

// Mechanic Marker
let mechanicIcon=L.divIcon({
  html:'<div class="mechanic-icon"></div>',
  iconSize:[64,64],
  iconAnchor:[32,32],
  className:''
});

let mechanicMarker=L.marker([${coords.latitude},${coords.longitude}],{icon:mechanicIcon}).addTo(map);

// User Marker
${acceptedRequest ? `
let userMarker=L.marker([${acceptedRequest.user_lat},${acceptedRequest.user_lng}]).addTo(map);

// Draw route using OSRM (FREE)
fetch('https://router.project-osrm.org/route/v1/driving/${coords.longitude},${coords.latitude};${acceptedRequest.user_lng},${acceptedRequest.user_lat}?overview=simplified&geometries=geojson')
.then(res=>res.json())
.then(data=>{
  const route=data.routes[0].geometry;
  L.geoJSON(route,{style:{color:'blue',weight:5}}).addTo(map);
});
` : ""}

</script>
</body>
</html>
`
      : "";

  if (loading || !coords || !iconBase64) {
    return (
      <View style={{ height: SCREEN_HEIGHT, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={{ height: SCREEN_HEIGHT }}>
      {Platform.OS === "web" ? (
        <iframe
          srcDoc={mapHtml}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      ) : (
        (() => {
          const NativeWebView = require("react-native-webview").WebView;
          return (
            <NativeWebView
              ref={webViewRef}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              cacheEnabled={true}
              androidLayerType="hardware"
              startInLoadingState={true}
            />
          );
        })()
      )}
    </View>
  );
}