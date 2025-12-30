// // app/(tabs)/service/tracking.tsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// // Map components are imported dynamically on native only to avoid web bundling issues
// import { useLocalSearchParams } from "expo-router";
// import { listenRequest } from "../../../services/requests";
// import * as Location from "expo-location";

// export default function TrackingScreen() {
//   const params = useLocalSearchParams();
//   const { requestId } = params as { requestId?: string };
//   const [request, setRequest] = useState<any>(null);
//   const [userLoc, setUserLoc] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [MapComponents, setMapComponents] = useState<any>(null);
//   const mapRef = useRef<any>(null);

//   useEffect(() => {
//     if (Platform.OS === "web") return;
//     let mounted = true;
//     (async () => {
//       const mod = await import("react-native-maps");
//       if (mounted) setMapComponents(mod);
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") return;
//       const pos = await Location.getCurrentPositionAsync({});
//       setUserLoc({
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//       });
//     })();
//   }, []);

//   useEffect(() => {
//     if (!requestId) return;
//     let unsubscribe: (() => void) | null = null;

//     listenRequest(requestId, (data) => {
//       setRequest(data);
//     }).then((off) => {
//       unsubscribe = off;
//     });

//     return () => {
//       unsubscribe?.();
//     };
//   }, [requestId]);

//   useEffect(() => {
//     const mechLoc = request?.mechanicLocation;
//     if (mapRef.current && userLoc && mechLoc) {
//       mapRef.current.fitToCoordinates(
//         [
//           { latitude: userLoc.latitude, longitude: userLoc.longitude },
//           { latitude: mechLoc.lat, longitude: mechLoc.lng },
//         ],
//         {
//           edgePadding: { top: 60, right: 60, bottom: 120, left: 60 },
//           animated: true,
//         }
//       );
//     }
//   }, [userLoc, request?.mechanicLocation]);

//   if (!request) {
//     return (
//       <SafeAreaView style={t.container}>
//         <ActivityIndicator />
//       </SafeAreaView>
//     );
//   }

//   const mechLoc = request.mechanicLocation;

//   return (
//     <SafeAreaView style={t.container}>
//       {Platform.OS === "web" ? (
//         <View style={t.map}>
//           <Text style={{ textAlign: "center", marginTop: 20 }}>
//             Map not available on web
//           </Text>
//           {mechLoc && (
//             <Text style={{ textAlign: "center" }}>
//               Mechanic: {mechLoc.lat.toFixed(5)},{mechLoc.lng.toFixed(5)}
//             </Text>
//           )}
//         </View>
//       ) : !MapComponents ? (
//         <ActivityIndicator />
//       ) : (
//         (() => {
//           const MapViewComp: any =
//             MapComponents.default ?? MapComponents.MapView;
//           const MarkerComp: any = MapComponents.Marker;
//           const PolylineComp: any = MapComponents.Polyline;
//           return (
//             <MapViewComp
//               ref={(r: any) => {
//                 mapRef.current = r;
//               }}
//               style={t.map}
//               initialRegion={{
//                 latitude: userLoc?.latitude ?? (mechLoc ? mechLoc.lat : 17.0),
//                 longitude: userLoc?.longitude ?? (mechLoc ? mechLoc.lng : 82.0),
//                 latitudeDelta: 0.02,
//                 longitudeDelta: 0.02,
//               }}
//               showsUserLocation={true}
//             >
//               {mechLoc && (
//                 <MarkerComp
//                   coordinate={{ latitude: mechLoc.lat, longitude: mechLoc.lng }}
//                   title="Mechanic"
//                 >
//                   <View style={t.mechMarker}>
//                     <Text style={{ color: "#fff", fontWeight: "700" }}>🔧</Text>
//                   </View>
//                 </MarkerComp>
//               )}

//               {userLoc && mechLoc && (
//                 <PolylineComp
//                   coordinates={[
//                     {
//                       latitude: userLoc.latitude,
//                       longitude: userLoc.longitude,
//                     },
//                     { latitude: mechLoc.lat, longitude: mechLoc.lng },
//                   ]}
//                   strokeWidth={3}
//                 />
//               )}
//             </MapViewComp>
//           );
//         })()
//       )}

//       <View style={t.info}>
//         <Text style={t.infoText}>
//           Mechanic: {request?.mechanicInfo?.name ?? "Assigned"}
//         </Text>
//         <Text style={t.infoText}>Vehicle: {request?.vehicleType}</Text>
//         <Text style={t.infoText}>Status: {request?.status}</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const t = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   map: { flex: 1 },
//   mechMarker: { backgroundColor: "#0b66d6", padding: 6, borderRadius: 20 },
//   info: {
//     position: "absolute",
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     elevation: 3,
//   },
//   infoText: { fontWeight: "700" },
// });/

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

export default function TrackingScreen() {
  const mapRef = useRef<any>(null);

  // ✅ Fake request data
  const [request, setRequest] = useState<any>({
    vehicleType: "Bike",
    status: "On the way",
    mechanicInfo: { name: "Ravi (Fake)" },
    mechanicLocation: {
      lat: 17.385044, // Initial fake mechanic location
      lng: 78.486671,
    },
  });

  // ✅ Fake user location
  const [userLoc, setUserLoc] = useState({
    latitude: 17.38714,
    longitude: 78.491684,
  });

  const [MapComponents, setMapComponents] = useState<any>(null);

  // Load map dynamically (native only)
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

  // 🔁 FAKE mechanic movement (every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setRequest((prev: any) => ({
        ...prev,
        mechanicLocation: {
          lat: prev.mechanicLocation.lat + 0.0003,
          lng: prev.mechanicLocation.lng + 0.0003,
        },
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto fit both points
  useEffect(() => {
    if (mapRef.current && userLoc && request?.mechanicLocation) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLoc.latitude, longitude: userLoc.longitude },
          {
            latitude: request.mechanicLocation.lat,
            longitude: request.mechanicLocation.lng,
          },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 120, left: 60 },
          animated: true,
        }
      );
    }
  }, [request?.mechanicLocation]);

  if (!MapComponents && Platform.OS !== "web") {
    return (
      <SafeAreaView style={t.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const MapViewComp: any =
    MapComponents?.default ?? MapComponents?.MapView ?? MapComponents;
  const MarkerComp: any = MapComponents?.Marker ?? MapViewComp?.Marker;
  const PolylineComp: any = MapComponents?.Polyline ?? MapViewComp?.Polyline;
  if (!MapViewComp) {
    return (
      <SafeAreaView style={t.container}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={t.container}>
      {Platform.OS === "web" ? (
        <View style={t.map}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Map not available on web
          </Text>
        </View>
      ) : (
        <MapViewComp
          ref={(r: any) => (mapRef.current = r)}
          style={t.map}
          initialRegion={{
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation
        >
          {/* User Marker */}
          <MarkerComp coordinate={userLoc} title="You" />

          {/* Mechanic Marker */}
          <MarkerComp
            coordinate={{
              latitude: request.mechanicLocation.lat,
              longitude: request.mechanicLocation.lng,
            }}
            title="Mechanic"
          >
            <View style={t.mechMarker}>
              <Text style={{ color: "#fff" }}>🔧</Text>
            </View>
          </MarkerComp>

          {/* Route line */}
          <PolylineComp
            coordinates={[
              userLoc,
              {
                latitude: request.mechanicLocation.lat,
                longitude: request.mechanicLocation.lng,
              },
            ]}
            strokeWidth={4}
          />
        </MapViewComp>
      )}

      {/* Info Card */}
      <View style={t.info}>
        <Text style={t.infoText}>Mechanic: {request.mechanicInfo.name}</Text>
        <Text style={t.infoText}>Vehicle: {request.vehicleType}</Text>
        <Text style={t.infoText}>Status: {request.status}</Text>
      </View>
    </SafeAreaView>
  );
}

const t = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  mechMarker: {
    backgroundColor: "#0b66d6",
    padding: 8,
    borderRadius: 20,
  },
  info: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 4,
  },
  infoText: { fontWeight: "700" },
});
