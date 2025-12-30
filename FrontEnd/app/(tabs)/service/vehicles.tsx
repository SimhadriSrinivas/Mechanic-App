// app/(tabs)/service/vehicles.tsx
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
    icon: <MaterialCommunityIcons name="car-wrench" size={24} color="#0b66d6" />,
  },
  {
    id: "auto",
    label: "Auto Mechanics",
    icon: <MaterialCommunityIcons name="rickshaw" size={26} color="#0b66d6" />,
  },
  {
    id: "truck",
    label: "Truck Mechanics",
    icon: <MaterialCommunityIcons name="truck-check" size={26} color="#0b66d6" />,
  },
];

export default function VehiclesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { service } = params as { service?: string };

  const onSelect = (vehicleType: string) => {
    router.push({
      pathname: "/service/sendRequest",
      params: { service: service ?? "Service", vehicle: vehicleType },
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.heading}>{service ?? "Choose Vehicle"}</Text>

      {VEHICLES.map((v) => (
        <TouchableOpacity key={v.id} style={s.card} onPress={() => onSelect(v.id)}>
          <View style={s.leftIcon}>{v.icon}</View>
          <Text style={s.cardText}>{v.label}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#012d79ff",
    marginBottom: 12,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: {
    width: 40,
    alignItems: "center",
    marginRight: 10,
  },
  cardText: { fontSize: 16, fontWeight: "700" },
});
