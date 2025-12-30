// app/(tabs)/garage/vehicles.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

const VEHICLES = [
  { id: "bike", label: "Bike" },
  { id: "car", label: "Car" },
  { id: "auto", label: "Auto" },
  { id: "truck", label: "Truck" },
];

export default function GarageVehiclesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { garageId, garageName } = params as {
    garageId?: string;
    garageName?: string;
  };

  const onSelect = (vehicleType: string) => {
    // Reuse common sendRequest screen
    router.push({
      pathname: "/service/sendRequest",
      params: {
        service: "Garage",
        vehicle: vehicleType,
        garageId,
        garageName,
      },
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.heading}>
        Request help from {garageName ?? "garage"}
      </Text>

      {VEHICLES.map((v) => (
        <TouchableOpacity
          key={v.id}
          style={s.card}
          onPress={() => onSelect(v.id)}
        >
          <Text style={s.cardText}>{v.label}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  card: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  cardText: { fontSize: 16, fontWeight: "700" },
});
