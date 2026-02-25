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
    honda: [
      {
        id: "1",
        name: "Brake Pads",
        price: "₹450",
        image: require("../../../assets/images/brake.webp"),
        description: "Premium brake pads for Honda bikes.",
      },
      {
        id: "2",
        name: "Clutch Plate",
        price: "₹950",
        image: require("../../../assets/images/clutch.webp"),
        description: "Durable clutch plate with long life.",
      },
      {
        id: "3",
        name: "Air Filter",
        price: "₹300",
        image: require("../../../assets/images/spark.webp"),
        description: "High performance air filter.",
      },
    ],

    hero: [
      {
        id: "4",
        name: "Spark Plug",
        price: "₹150",
        image: require("../../../assets/images/spark.webp"),
        description: "Reliable spark plug for smooth ignition.",
      },
      {
        id: "5",
        name: "Chain Sprocket",
        price: "₹1200",
        image: require("../../../assets/images/brake.webp"),
        description: "Strong chain sprocket for Hero bikes.",
      },
      {
        id: "6",
        name: "Battery",
        price: "₹2500",
        image: require("../../../assets/images/clutch.webp"),
        description: "Long-lasting battery.",
      },
    ],

    bajaj: [
      {
        id: "7",
        name: "Disc Plate",
        price: "₹1500",
        image: require("../../../assets/images/brake.webp"),
        description: "High quality disc plate.",
      },
      {
        id: "8",
        name: "Side Mirror",
        price: "₹350",
        image: require("../../../assets/images/spark.webp"),
        description: "Durable side mirror set.",
      },
      {
        id: "9",
        name: "Fuel Pump",
        price: "₹2800",
        image: require("../../../assets/images/clutch.webp"),
        description: "Efficient fuel pump.",
      },
    ],

    tvs: [
      {
        id: "10",
        name: "Brake Lever",
        price: "₹250",
        image: require("../../../assets/images/brake.webp"),
        description: "Original TVS brake lever.",
      },
      {
        id: "11",
        name: "Oil Filter",
        price: "₹200",
        image: require("../../../assets/images/clutch.webp"),
        description: "Premium oil filter.",
      },
      {
        id: "12",
        name: "Headlight",
        price: "₹800",
        image: require("../../../assets/images/spark.webp"),
        description: "Bright LED headlight.",
      },
    ],

    yamaha: [
      {
        id: "13",
        name: "Racing Chain",
        price: "₹2200",
        image: require("../../../assets/images/brake.webp"),
        description: "High performance racing chain.",
      },
      {
        id: "14",
        name: "Performance Clutch",
        price: "₹1800",
        image: require("../../../assets/images/clutch.webp"),
        description: "Smooth clutch experience.",
      },
      {
        id: "15",
        name: "Premium Brake Disc",
        price: "₹1700",
        image: require("../../../assets/images/spark.webp"),
        description: "Advanced braking system.",
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
                  pathname: "/BikeParts/product",
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