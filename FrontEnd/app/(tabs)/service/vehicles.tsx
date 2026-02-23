import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
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
    icon: (
      <MaterialCommunityIcons name="rickshaw" size={26} color="#0b66d6" />
    ),
  },
  {
    id: "truck",
    label: "Truck Mechanics",
    icon: (
      <MaterialCommunityIcons name="truck-check" size={26} color="#0b66d6" />
    ),
  },
  {
    id: "home",
    label: "Home Service",
    icon: (
      <MaterialCommunityIcons name="hammer-wrench" size={26} color="#0b66d6" />
    ),
  },
];

export default function VehiclesScreen() {
  const router = useRouter();
  const { service } = useLocalSearchParams<{ service?: string }>();

  const [selected, setSelected] = useState<string | null>(null);

  const onSelect = (vehicleType: string) => {
    setSelected(vehicleType);

    setTimeout(() => {
      router.push({
        pathname: "/service/tracking",
        params: {
          service: service ?? "general-repair",
          vehicleType,
        },
      });
    }, 150);
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selected === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.leftIcon}>{item.icon}</View>

        <Text
          style={[
            styles.cardText,
            isSelected && styles.selectedText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.heading}>
          {service ?? "Select Vehicle Type"}
        </Text>

        <FlatList
          data={VEHICLES}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },

  list: {
    paddingBottom: 40,
  },

  card: {
    height: 65,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.05 : 0,
    shadowRadius: 6,
    elevation: 2,
  },

  selectedCard: {
    borderColor: "#0b66d6",
    backgroundColor: "#eef4ff",
  },

  leftIcon: {
    width: 45,
    alignItems: "center",
    marginRight: 14,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  selectedText: {
    color: "#0b66d6",
  },
});
