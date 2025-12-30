// // app/(tabs)/garage/index.tsx
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// // Map components are imported dynamically on native only to avoid web bundling issues
// import * as Location from "expo-location";
// import { useRouter } from "expo-router";
// import { Garage, getNearbyGarages } from "../../../services/placesApi";

// export default function GarageMapScreen() {
//   const router = useRouter();
//   const [MapComponents, setMapComponents] = useState<any>(null);
//   const mapRef = useRef<any>(null);

//   const [userLoc, setUserLoc] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

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
//   const [garages, setGarages] = useState<Garage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState<Garage | null>(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           setLoading(false);
//           return;
//         }

//         const pos = await Location.getCurrentPositionAsync({});
//         const lat = pos.coords.latitude;
//         const lng = pos.coords.longitude;

//         setUserLoc({ latitude: lat, longitude: lng });

//         const list = await getNearbyGarages(lat, lng);
//         setGarages(list);

//         setLoading(false);

//         if (mapRef.current) {
//           mapRef.current.animateToRegion(
//             {
//               latitude: lat,
//               longitude: lng,
//               latitudeDelta: 0.05,
//               longitudeDelta: 0.05,
//             },
//             800
//           );
//         }
//       } catch (e) {
//         console.warn("Error loading garages", e);
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const onRequestHelp = () => {
//     if (!selected) return;
//     router.push({
//       pathname: "/garage/vehicles",
//       params: {
//         garageId: selected.id,
//         garageName: selected.name,
//       },
//     });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Nearby Garages</Text>

//       {loading && (
//         <View style={styles.center}>
//           <ActivityIndicator />
//         </View>
//       )}

//       {!loading && !userLoc && (
//         <View style={styles.center}>
//           <Text>Location permission denied.</Text>
//         </View>
//       )}

//       {!loading && userLoc && (
//         <>
//           {Platform.OS === "web" ? (
//             <View style={styles.map}>
//               <Text style={{ textAlign: "center", marginTop: 20 }}>
//                 Map not available on web
//               </Text>
//               {userLoc && (
//                 <Text style={{ textAlign: "center" }}>
//                   Location: {userLoc.latitude.toFixed(5)},
//                   {userLoc.longitude.toFixed(5)}
//                 </Text>
//               )}
//             </View>
//           ) : !MapComponents ? (
//             <ActivityIndicator />
//           ) : (
//             (() => {
//               const MapViewComp: any =
//                 MapComponents.default ?? MapComponents.MapView;
//               const MarkerComp: any = MapComponents.Marker;
//               return (
//                 <MapViewComp
//                   ref={(r: any) => {
//                     mapRef.current = r;
//                   }}
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: userLoc.latitude,
//                     longitude: userLoc.longitude,
//                     latitudeDelta: 0.05,
//                     longitudeDelta: 0.05,
//                   }}
//                   showsUserLocation={true}
//                 >
//                   {garages.map((g) => (
//                     <MarkerComp
//                       key={g.id}
//                       coordinate={{ latitude: g.lat, longitude: g.lng }}
//                       title={g.name}
//                       description={g.address}
//                       onPress={() => setSelected(g)}
//                     />
//                   ))}
//                 </MapViewComp>
//               );
//             })()
//           )}

//           {selected && (
//             <View style={styles.bottomCard}>
//               <Text style={styles.bottomTitle}>{selected.name}</Text>
//               {selected.address ? (
//                 <Text style={styles.bottomAddress}>{selected.address}</Text>
//               ) : null}

//               <TouchableOpacity style={styles.helpBtn} onPress={onRequestHelp}>
//                 <Text style={styles.helpText}>Request Help</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 4,
//   },
//   map: { flex: 1 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   bottomCard: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 20,
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     elevation: 4,
//   },
//   bottomTitle: { fontSize: 16, fontWeight: "700" },
//   bottomAddress: { marginTop: 4, color: "#555" },
//   helpBtn: {
//     marginTop: 10,
//     backgroundColor: "#0b66d6",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   helpText: { color: "#fff", fontWeight: "700" },
// });



import React, { useEffect, useRef, useState } from "react";
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

// ✅ Garage type
type Garage = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  distanceLabel: string;
};

export default function GarageMapScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [MapComponents, setMapComponents] = useState<any>(null);

  // 📍 User location (center)
  const userLoc = {
    latitude: 17.385044,
    longitude: 78.486671,
  };

  // 🔢 Distance helpers
  const kmToLat = (km: number) => km / 111;
  const kmToLng = (km: number, lat: number) =>
    km / (111 * Math.cos((lat * Math.PI) / 180));

  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Garage | null>(null);

  // Load maps dynamically
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

  // ✅ Garages at fixed distances
  useEffect(() => {
    setTimeout(() => {
      const lat = userLoc.latitude;
      const lng = userLoc.longitude;

      setGarages([
        {
          id: "g1",
          name: "Sri Sai Auto Garage",
          lat: lat + kmToLat(0.5), // ⬆️ 500m North
          lng,
          address: "500 meters away",
          distanceLabel: "500 m",
        },
        {
          id: "g2",
          name: "Ravi Bike Point",
          lat: lat - kmToLat(1.5), // ⬇️ 1.5 km South
          lng,
          address: "1.5 km away",
          distanceLabel: "1.5 km",
        },
        {
          id: "g3",
          name: "Speed Car Care",
          lat,
          lng: lng + kmToLng(3, lat), // ➡️ 3 km East
          address: "3 km away",
          distanceLabel: "3 km",
        },
        {
          id: "g4",
          name: "City Auto Works",
          lat,
          lng: lng - kmToLng(4, lat), // ⬅️ 4 km West
          address: "4 km away",
          distanceLabel: "4 km",
        },
      ]);

      setLoading(false);

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        800
      );
    }, 800);
  }, []);

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
      ) : Platform.OS === "web" ? (
        <View style={styles.map}>
          <Text>Map not available on web</Text>
        </View>
      ) : !MapComponents ? (
        <ActivityIndicator />
      ) : (
        (() => {
          const MapViewComp: any =
            MapComponents.default ?? MapComponents.MapView;
          const MarkerComp: any = MapComponents.Marker;

          return (
            <MapViewComp
              ref={(r: any) => (mapRef.current = r)}
              style={styles.map}
              initialRegion={{
                latitude: userLoc.latitude,
                longitude: userLoc.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              showsUserLocation
            >
              {/* User */}
              <MarkerComp coordinate={userLoc} title="You" />

              {/* Garages */}
              {garages.map((g) => (
                <MarkerComp
                  key={g.id}
                  coordinate={{ latitude: g.lat, longitude: g.lng }}
                  title={g.name}
                  description={g.distanceLabel}
                  onPress={() => setSelected(g)}
                />
              ))}
            </MapViewComp>
          );
        })()
      )}

      {/* Bottom Card */}
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
  },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
