import React from "react";
import {
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function ProductScreen() {
  const { name, price, description } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../../../assets/images/brake.webp")}
          style={styles.bigImage}
        />

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity style={styles.cartBtn}>
          <Text style={styles.btnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.btnText}>Buy Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16 },
  bigImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: "700" },
  price: { fontSize: 18, color: "#0b66d6", marginVertical: 8 },
  description: { fontSize: 14, color: "#555", marginBottom: 20 },
  cartBtn: {
    backgroundColor: "#ff9900",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buyBtn: {
    backgroundColor: "#0b66d6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});