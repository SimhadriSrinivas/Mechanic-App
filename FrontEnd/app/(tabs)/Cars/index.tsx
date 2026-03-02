import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Car = {
  id: string;
  name: string;
  price: string;
  image: any;
};

export default function CarsScreen() {
  const router = useRouter();

  const cars: Car[] = [
    {
      id: "city",
      name: "Honda City",
      price: "₹11,50,000",
      image: require("../../../assets/images/Cars/city.avif"),
    },
    {
      id: "fortuner",
      name: "Toyota Fortuner",
      price: "₹33,00,000",
      image: require("../../../assets/images/Cars/fortuner.avif"),
    },
    {
      id: "harrier",
      name: "Tata Harrier",
      price: "₹15,00,000",
      image: require("../../../assets/images/Cars/harrier.avif"),
    },
    {
      id: "maruti_baleno",
      name: "Maruti Baleno",
      price: "₹7,50,000",
      image: require("../../../assets/images/Cars/maruti_baleno.avif"),
    },
    {
      id: "maruti_swift",
      name: "Maruti Swift",
      price: "₹6,50,000",
      image: require("../../../assets/images/Cars/maruti_swift.avif"),
    },
    {
      id: "nexon",
      name: "Tata Nexon",
      price: "₹9,00,000",
      image: require("../../../assets/images/Cars/nexon.avif"),
    },
    {
      id: "scorpio",
      name: "Mahindra Scorpio",
      price: "₹13,00,000",
      image: require("../../../assets/images/Cars/scorpio.avif"),
    },
    {
      id: "thar",
      name: "Mahindra Thar",
      price: "₹14,00,000",
      image: require("../../../assets/images/Cars/thar.avif"),
    },
    {
      id: "xuv700",
      name: "Mahindra XUV700",
      price: "₹15,50,000",
      image: require("../../../assets/images/Cars/xuv700.avif"),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>New Cars in Market</Text>

        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/Cars/id",
                  params: { id: item.id },
                })
              }
            >
              <Image source={item.image} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    width: SCREEN_WIDTH / 2.2,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  price: {
    marginTop: 4,
    color: "#0b66d6",
    fontWeight: "700",
  },
});