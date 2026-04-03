import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  request: any;
};

const THUMB_SIZE = 62;

export default function AcceptedRequestView({ request }: Props) {
  const router = useRouter();

  const [stage, setStage] = useState<"going" | "arrived" | "ready">("going");

  const [distanceKm, setDistanceKm] = useState(0);
  const [etaMin, setEtaMin] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("Loading address...");

  const railWidthRef = useRef(0);
  const swipeX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2,

      onPanResponderMove: (_, g) => {
        const max = Math.max(railWidthRef.current - THUMB_SIZE, 0);

        let x = g.dx;
        if (x < 0) x = 0;
        if (x > max) x = max;

        swipeX.setValue(x);
      },

      onPanResponderRelease: (_, g) => {
        const max = Math.max(railWidthRef.current - THUMB_SIZE, 0);
        const endX = Math.min(Math.max(g.dx, 0), max);

        if (endX >= max * 0.7) {
          Animated.timing(swipeX, {
            toValue: max,
            duration: 150,
            useNativeDriver: false,
          }).start(() => handleSwipe());
        } else {
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const handleSwipe = () => {
    if (stage === "going") {
      setStage("arrived");
      swipeX.setValue(0);
    } else if (stage === "ready") {
      alert("Job Completed");
    }
  };

  const getSwipeText = () => {
    if (stage === "going") return ">  >  >  Arrived  >  >  >";
    if (stage === "ready") return "Swipe to Complete Job";
    return "";
  };

  const getCleanPhone = (phone: unknown) => {
    if (phone === null || phone === undefined) return "";
    let cleaned = String(phone).replace(/\D/g, "");

    // Keep the last 10 digits so values with +91/country code still work.
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(-10);
    }

    return cleaned;
  };

  const rawPhone =
    request?.user_phone ??
    request?.userPhone ??
    request?.phone ??
    request?.customer_phone ??
    request?.customerPhone ??
    "";

  const displayPhone = getCleanPhone(rawPhone);

  const callUser = async () => {
    const cleaned = getCleanPhone(rawPhone);
    if (!cleaned) {
      alert("Phone number is missing");
      return;
    }

    const primaryNumber = cleaned.length === 10 ? `+91${cleaned}` : cleaned;
    const urls =
      Platform.OS === "ios"
        ? [
            `telprompt:${primaryNumber}`,
            `tel:${primaryNumber}`,
            `tel:${cleaned}`,
          ]
        : [`tel:${primaryNumber}`, `tel:${cleaned}`];

    for (const url of urls) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // Try the next fallback URL.
      }
    }

    alert("Unable to open phone dialer");
  };

  useEffect(() => {
    loadDistanceAndAddress();
  }, [request]);

  const loadDistanceAndAddress = async () => {
    try {
      const userLat = Number(request?.user_lat);
      const userLng = Number(request?.user_lng);

      if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
        setPickupAddress("Location unavailable");
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setPickupAddress("Location permission denied");
        return;
      }

      let mech = null;
      try {
        mech = await Location.getCurrentPositionAsync({});
      } catch {
        mech = await Location.getLastKnownPositionAsync();
      }

      if (mech) {
        const dist = calculateDistance(
          mech.coords.latitude,
          mech.coords.longitude,
          userLat,
          userLng,
        );

        const d = Number(dist);
        setDistanceKm(d);
        setEtaMin(Math.max(1, Math.round((d / 30) * 60)));
      }

      const addr = await Location.reverseGeocodeAsync({
        latitude: userLat,
        longitude: userLng,
      });

      if (addr.length > 0) {
        const a = addr[0];
        setPickupAddress(`${a.street || ""}, ${a.city || ""}`);
      }
    } catch (error) {
      console.warn("AcceptedRequestView: location load failed", error);
      setPickupAddress("Location unavailable");
    }
  };

  const calculateDistance = (a: number, b: number, c: number, d: number) => {
    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(c - a);
    const dLon = toRad(d - b);

    const val =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val))).toFixed(1);
  };

  if (!request) return null;

  const textColor = swipeX.interpolate({
    inputRange: [0, 150],
    outputRange: ["#1f2937", "#ffffff"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <View style={styles.arrivalCard}>
        <Text style={styles.arrivalTitle}>Arriving in {etaMin} min</Text>
        <Text style={styles.arrivalSubtitle}>
          Customer {distanceKm} km away
        </Text>
      </View>

      <View style={styles.phoneCard}>
        <View style={styles.phoneInfo}>
          <Text style={styles.phone}>
            {displayPhone || "Phone not available"}
          </Text>
          <Text style={styles.phoneSubText}>
            {displayPhone ? "Call customer" : "Waiting for customer number"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.callBtn, !displayPhone && styles.callBtnDisabled]}
          onPress={callUser}
          disabled={!displayPhone}
        >
          <Text
            style={[styles.callText, !displayPhone && styles.callTextDisabled]}
          >
            CALL
          </Text>
        </TouchableOpacity>
      </View>

      {(stage === "going" || stage === "ready") && (
        <View style={styles.swipeWrapper}>
          <View
            {...panResponder.panHandlers}
            style={styles.swipeRail}
            onLayout={(e) => {
              railWidthRef.current = e.nativeEvent.layout.width;
            }}
          >
            {/* ✅ CORRECT FILL */}
            <Animated.View
              style={[
                styles.swipeFill,
                {
                  width: Animated.add(
                    swipeX,
                    new Animated.Value(THUMB_SIZE / 2),
                  ),
                },
              ]}
            />

            {/* TEXT */}
            <Animated.Text style={[styles.swipeText, { color: textColor }]}>
              {getSwipeText()}
            </Animated.Text>

            {/* THUMB */}
            <Animated.View
              style={[
                styles.swipeThumb,
                { transform: [{ translateX: swipeX }] },
              ]}
            >
              <Ionicons name="arrow-forward" size={24} color="#2563eb" />
            </Animated.View>
          </View>
        </View>
      )}

      {stage === "arrived" && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (!request?.$id) {
              alert("Request ID missing!");
              return;
            }

            router.push({
              pathname: "/(mechanic)/home/PaymentScreens/RepairScreen",
              params: {
                requestId: request.$id, // 🔥 MAIN FIX
              },
            });
          }}
        >
          <Text style={styles.btnText}>Start Inspection</Text>
        </TouchableOpacity>
      )}

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Pickup From</Text>
        <Text style={styles.address}>{pickupAddress}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },

  arrivalCard: {
    backgroundColor: "rgba(37,99,235,0.06)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
  },

  arrivalTitle: { fontSize: 17, fontWeight: "700", color: "#2563eb" },
  arrivalSubtitle: { fontSize: 14, color: "#2563eb", marginTop: 2 },

  phoneCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1fdf6",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#087630",
  },

  phoneInfo: {
    flex: 1,
  },

  phone: { fontSize: 22, fontWeight: "700" },
  phoneSubText: { fontSize: 13, color: "#6b7280" },

  callBtn: {
    borderWidth: 1,
    borderColor: "#087630",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#52e88960",
  },

  callBtnDisabled: {
    borderColor: "#94a3b8",
    backgroundColor: "#e2e8f0",
  },

  callText: { color: "#087630", fontWeight: "700" },

  callTextDisabled: {
    color: "#64748b",
  },

  swipeWrapper: { marginTop: 22 },

  swipeRail: {
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    overflow: "hidden",
  },

  swipeFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#2563eb",
  },

  swipeText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    zIndex: 1,
  },

  swipeThumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    borderColor: "#2563eb",
    borderWidth: 1,
    zIndex: 2,
  },

  primaryBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  addressCard: { marginTop: 16 },
  addressLabel: { fontSize: 13, color: "#6b7280" },
  address: { fontSize: 15, fontWeight: "500" },
});
