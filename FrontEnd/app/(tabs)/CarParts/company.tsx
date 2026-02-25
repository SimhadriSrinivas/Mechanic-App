import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CompanyPartsScreen() {
  const { company, name } = useLocalSearchParams();
  const router = useRouter();

  /* ================= SPARE PARTS DATA ================= */

  const spareParts: any = {
    maruti: [
      {
        id: "1",
        name: "Car Battery",
        price: "₹4500",
        image: require("../../../assets/images/car_battery.webp"),
        description: "High performance battery for Maruti cars.",
      },
      {
        id: "2",
        name: "Brake Pads",
        price: "₹2200",
        image: require("../../../assets/images/car_brakepad.webp"),
        description: "Durable brake pads for smooth braking.",
      },
    ],

    hyundai: [
      {
        id: "3",
        name: "Headlight Assembly",
        price: "₹3500",
        image: require("../../../assets/images/car_headlight.webp"),
        description: "Bright LED headlight system.",
      },
      {
        id: "4",
        name: "Air Filter",
        price: "₹800",
        image: require("../../../assets/images/car_airfilter.webp"),
        description: "Premium engine air filter.",
      },
    ],

    tata: [
      {
        id: "5",
        name: "Clutch Kit",
        price: "₹6500",
        image: require("../../../assets/images/car_clutch.webp"),
        description: "Complete clutch kit replacement.",
      },
      {
        id: "6",
        name: "Front Bumper",
        price: "₹7000",
        image: require("../../../assets/images/car_bumper.webp"),
        description: "Original front bumper.",
      },
    ],

    mahindra: [
      {
        id: "7",
        name: "Shock Absorber",
        price: "₹3200",
        // original asset missing, using a generic bumper image as placeholder
        image: require("../../../assets/images/car_bumper.webp"),
        description: "Heavy duty suspension system.",
      },
    ],

    toyota: [
      {
        id: "8",
        name: "Oil Filter",
        price: "₹600",
        // asset not present, using battery as a fallback
        image: require("../../../assets/images/car_battery.webp"),
        description: "Premium oil filtration system.",
      },
    ],

    kia: [
      {
        id: "9",
        name: "Radiator",
        price: "₹5500",
        // no radiator image available, using headlight icon
        image: require("../../../assets/images/car_headlight.webp"),
        description: "Efficient cooling radiator.",
      },
    ],

    honda_car: [
      {
        id: "10",
        name: "Disc Brake",
        price: "₹2800",
        // disc brake asset missing; reuse brake pad image
        image: require("../../../assets/images/car_brakepad.webp"),
        description: "High quality disc brake.",
      },
    ],
  };
  const parts = spareParts[company as string] || [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{name} Spare Parts</Text>

        <FlatList
          data={parts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.partCard}
              onPress={() =>
                router.push({
                  pathname: "/CarParts/product",
                  params: {
                    name: item.name,
                    price: item.price,
                    description: item.description,
                  },
                })
              }
            >
              <Image source={item.image} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  partCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 14,
  },
  image: { width: 60, height: 60, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { marginTop: 4, color: "#666" },
});
