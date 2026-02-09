import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const VEHICLES = [
  {
    id: "bike",
    label: "Bike Mechanics",
    icon: <FontAwesome5 name="motorcycle" size={22} color="#0b66d6" />,
  },
  {
    id: "car",
    label: "Car Mechanics",
    icon: (
      <MaterialCommunityIcons name="car-wrench" size={24} color="#0b66d6" />
    ),
  },
  {
    id: "auto",
    label: "Auto Mechanics",
    icon: <MaterialCommunityIcons name="rickshaw" size={26} color="#0b66d6" />,
  },
  {
    id: "truck",
    label: "Truck Mechanics",
    icon: (
      <MaterialCommunityIcons name="truck-check" size={26} color="#0b66d6" />
    ),
  },
];

export default function VehiclesScreen() {
  const router = useRouter();
  const { service } = useLocalSearchParams<{ service?: string }>();

  const onSelect = (vehicleType: string) => {
    router.push({
      pathname: "/service/tracking", // 👉 map screen
      params: {
        service: service ?? "general-repair",
        vehicleType, // ✅ SINGLE SOURCE OF TRUTH
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerWrap}>
        <Text style={styles.heading}>{service ?? "Select Vehicle Type"}</Text>

        {VEHICLES.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={styles.card}
            onPress={() => onSelect(v.id)}
            activeOpacity={0.85}
          >
            <View style={styles.leftIcon}>{v.icon}</View>
            <Text style={styles.cardText}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* 🔥 CENTER CONTENT VERTICALLY */
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#012d79",
    backgroundColor: "#fafafa",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  leftIcon: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
