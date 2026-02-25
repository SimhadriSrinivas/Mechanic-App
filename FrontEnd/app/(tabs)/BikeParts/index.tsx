import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function BikePartsScreen() {
  const router = useRouter();

  const companies = [
    {
      id: "honda",
      name: "Honda",
      logo: require("../../../assets/images/honda.webp"),
    },
    {
      id: "hero",
      name: "Hero",
      logo: require("../../../assets/images/Hero.webp"),
    },
    {
      id: "bajaj",
      name: "Bajaj",
      logo: require("../../../assets/images/bajaj.webp"),
    },
    {
      id: "tvs",
      name: "TVS",
      logo: require("../../../assets/images/tvs.webp"),
    },
    {
      id: "yamaha",
      name: "Yamaha",
      logo: require("../../../assets/images/yamaha.webp"),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Bike Company</Text>

        <FlatList
          data={companies}
          numColumns={3}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.companyCard}
              onPress={() =>
                router.push({
                  pathname: "/BikeParts/company",
                  params: { company: item.id, name: item.name },
                })
              }
            >
              <Image source={item.logo} style={styles.companyLogo} />
              <Text style={styles.companyName}>{item.name}</Text>
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
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  companyCard: {
    width: SCREEN_WIDTH / 3.5,
    alignItems: "center",
    marginBottom: 25,
  },
  companyLogo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 8,
  },
  companyName: { fontSize: 13, fontWeight: "600" },
});
