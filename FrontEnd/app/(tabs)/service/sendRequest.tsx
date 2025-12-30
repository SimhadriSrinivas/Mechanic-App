// // app/(tabs)/service/sendRequest.tsx
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as Location from "expo-location";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { createRequest } from "../../../services/requests";
// import { getLoggedInPhone } from "../../../utils/storage";

// export default function SendRequest() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { service, vehicle } = params as {
//     service?: string;
//     vehicle?: string;
//   };
//   const [loading, setLoading] = useState(false);

//   const send = async () => {
//     setLoading(true);
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission required",
//           "Location permission is required to request mechanic."
//         );
//         setLoading(false);
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
//       const lat = loc.coords.latitude;
//       const lng = loc.coords.longitude;

//       const userPhone = await getLoggedInPhone();
//       const userId = userPhone ?? "anonymous";

//       const reqId = await createRequest({
//         userId,
//         userPhone: userPhone ?? "unknown",
//         service: service ?? "Service",
//         vehicleType: vehicle ?? "bike",
//         lat,
//         lng,
//       });

//       router.replace({
//         pathname: "/service/waiting",
//         params: { requestId: reqId },
//       });
//     } catch (err) {
//       console.warn(err);
//       Alert.alert("Failed", "Could not create request. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={s.container}>
//       <Text style={s.title}>
//         Request {service} - {vehicle}
//       </Text>

//       <TouchableOpacity style={s.btn} onPress={send} disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={s.btnText}>Send Request</Text>
//         )}
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#fff",
//     alignItems: "center",
//   },
//   title: { fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 24 },
//   btn: {
//     backgroundColor: "#0b66d6",
//     padding: 14,
//     borderRadius: 10,
//     width: "80%",
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SendRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { service, vehicle } = params as {
    service?: string;
    vehicle?: string;
  };

  const [loading, setLoading] = useState(false);

  // ✅ FAKE SEND FUNCTION
  const send = async () => {
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1500));
      const fakeRequestId = "REQ_" + Date.now();
      router.replace({
        pathname: "/service/tracking",
        params: { requestId: fakeRequestId },
      });
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>
        Request {service ?? "Service"} - {vehicle ?? "Vehicle"}
      </Text>

      <TouchableOpacity
        style={s.btn}
        onPress={send}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>Send Request</Text>
        )}
      </TouchableOpacity>

      <Text style={s.note}>
        (Fake request for testing – no backend)
      </Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 30,
  },
  btn: {
    backgroundColor: "#0b66d6",
    paddingVertical: 14,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  note: {
    marginTop: 16,
    color: "#777",
    fontSize: 12,
  },
});
