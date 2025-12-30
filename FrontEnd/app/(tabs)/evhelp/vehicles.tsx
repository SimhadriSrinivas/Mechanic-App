// app/(tabs)/evhelp/vehicles.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const VEHICLES = [
  {
    id: "car",
    label: "Car (EV)",
    icon: <MaterialCommunityIcons name="car-electric" size={26} color="#0b66d6" />,
  },
  {
    id: "bike",
    label: "Bike (EV)",
    icon: <MaterialCommunityIcons name="motorbike-electric" size={26} color="#0b66d6" />,
  },
];

export default function EvVehicles() {
  const router = useRouter();

  const onSelect = (vehicleType: string) => {
    router.push({
      pathname: "/evhelp/sendRequest",
      params: { vehicle: vehicleType },
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.heading}>Select vehicle type</Text>

      <View style={s.list}>
        {VEHICLES.map((v) => (
          <TouchableOpacity key={v.id} style={s.card} onPress={() => onSelect(v.id)}>
            <View style={s.icon}>{v.icon}</View>
            <Text style={s.cardText}>{v.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  list: { width: "100%" },
  card: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    marginBottom: 12,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 40,
    alignItems: "center",
    marginRight: 10,
  },
  cardText: { fontSize: 16, fontWeight: "700" },
});
