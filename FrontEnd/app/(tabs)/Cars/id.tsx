import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function CarDetails() {
  const { id } = useLocalSearchParams();

  const carData: any = {
    city: {
      name: "Honda City",
      price: "₹11,50,000",
      image: require("../../../assets/images/Cars/city.avif"),
      engine: "1498 cc",
      power: "119 bhp",
    },
    fortuner: {
      name: "Toyota Fortuner",
      price: "₹33,00,000",
      image: require("../../../assets/images/Cars/fortuner.avif"),
      engine: "2755 cc",
      power: "201 bhp",
    },
    harrier: {
      name: "Tata Harrier",
      price: "₹15,00,000",
      image: require("../../../assets/images/Cars/harrier.avif"),
      engine: "1956 cc",
      power: "168 bhp",
    },
    maruti_baleno: {
      name: "Maruti Baleno",
      price: "₹7,50,000",
      image: require("../../../assets/images/Cars/maruti_baleno.avif"),
      engine: "1197 cc",
      power: "88 bhp",
    },
    maruti_swift: {
      name: "Maruti Swift",
      price: "₹6,50,000",
      image: require("../../../assets/images/Cars/maruti_swift.avif"),
      engine: "1197 cc",
      power: "89 bhp",
    },
    nexon: {
      name: "Tata Nexon",
      price: "₹9,00,000",
      image: require("../../../assets/images/Cars/nexon.avif"),
      engine: "1199 cc",
      power: "118 bhp",
    },
    scorpio: {
      name: "Mahindra Scorpio",
      price: "₹13,00,000",
      image: require("../../../assets/images/Cars/scorpio.avif"),
      engine: "2184 cc",
      power: "130 bhp",
    },
    thar: {
      name: "Mahindra Thar",
      price: "₹14,00,000",
      image: require("../../../assets/images/Cars/thar.avif"),
      engine: "1997 cc",
      power: "150 bhp",
    },
    xuv700: {
      name: "Mahindra XUV700",
      price: "₹15,50,000",
      image: require("../../../assets/images/Cars/xuv700.avif"),
      engine: "1999 cc",
      power: "197 bhp",
    },
  };

  const car = carData[id as string];

  if (!car) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 20 }}>Car not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={car.image} style={styles.image} />
        <Text style={styles.title}>{car.name}</Text>
        <Text style={styles.price}>{car.price}</Text>

        <View style={styles.specBox}>
          <Text style={styles.specTitle}>Specifications</Text>
          <Spec label="Engine" value={car.engine} />
          <Spec label="Power" value={car.power} />
          <Spec label="Transmission" value="Manual / Automatic" />
          <Spec label="Fuel Type" value="Petrol / Diesel" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16 },
  image: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700" },
  price: {
    fontSize: 18,
    color: "#0b66d6",
    marginVertical: 8,
    fontWeight: "700",
  },
  specBox: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#555" },
  value: { fontWeight: "600" },
});