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

export default function BikeDetails() {
  const { id } = useLocalSearchParams();

  /* ================= DYNAMIC BIKE DATA ================= */

  const bikeData: any = {
    hero125: {
      image: require("../../../assets/images/hero_xtreme.avif"),
      name: "Hero Xtreme 125R",
      price: "₹95,000",
      displacement: "124.7 cc",
      power: "11.4 bhp",
      torque: "10.5 Nm",
    },
    shine100: {
      image: require("../../../assets/images/honda_shine.avif"),
      name: "Honda Shine 100",
      price: "₹80,000",
      displacement: "98.98 cc",
      power: "7.3 bhp",
      torque: "8.05 Nm",
    },
    raider125: {
      image: require("../../../assets/images/tvs_raider.avif"),
      name: "TVS Raider 125",
      price: "₹1,00,000",
      displacement: "124.8 cc",
      power: "11.2 bhp",
      torque: "11.2 Nm",
    },
    r15v4: {
      image: require("../../../assets/images/r15.avif"),
      name: "Yamaha R15 V4",
      price: "₹1,80,000",
      displacement: "155 cc",
      power: "18.4 bhp",
      torque: "14.2 Nm",
    },
    ns200: {
      image: require("../../../assets/images/ns200.avif"),
      name: "Bajaj Pulsar NS200",
      price: "₹1,60,000",
      displacement: "199.5 cc",
      power: "24.1 bhp",
      torque: "18.7 Nm",
    },
    hunter350: {
      image: require("../../../assets/images/hunter350.avif"),
      name: "Royal Enfield Hunter 350",
      price: "₹1,75,000",
      displacement: "349.34 cc",
      power: "20.2 bhp @ 6100 rpm",
      torque: "27 Nm @ 4000 rpm",
    },
  };

  const bike = bikeData[id as string];

  if (!bike) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ padding: 20 }}>
          <Text>Bike not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* IMAGE */}
        <Image source={bike.image} style={styles.image} />

        {/* BASIC INFO */}
        <Text style={styles.title}>{bike.name}</Text>
        <Text style={styles.price}>{bike.price}</Text>

        <Text style={styles.sectionTitle}>Specifications</Text>

        <SpecSection
          title="Power & Performance"
          specs={[
            ["Displacement", bike.displacement],
            ["Max Power", bike.power],
            ["Max Torque", bike.torque],
            ["Top Speed", "130 kmph"],
          ]}
        />

        <SpecSection
          title="Brakes & Wheels"
          specs={[
            ["Braking System", "Single Channel ABS"],
            ["Front Brake", "Disc"],
            ["Rear Brake", "Drum"],
            ["Wheel Type", "Alloy"],
          ]}
        />

        <SpecSection
          title="Dimensions"
          specs={[
            ["Kerb Weight", "181 kg"],
            ["Seat Height", "790 mm"],
            ["Ground Clearance", "160 mm"],
          ]}
        />

        <SpecSection
          title="Features"
          specs={[
            ["Bluetooth", "Yes"],
            ["USB Charging Port", "Yes"],
            ["Hazard Lights", "Yes"],
            ["GPS Navigation", "No"],
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= REUSABLE SPEC COMPONENT ================= */

function SpecSection({
  title,
  specs,
}: {
  title: string;
  specs: string[][];
}) {
  return (
    <View style={styles.specBox}>
      <Text style={styles.specTitle}>{title}</Text>
      {specs.map((item, index) => (
        <View key={index} style={styles.specRow}>
          <Text style={styles.specLabel}>{item[0]}</Text>
          <Text style={styles.specValue}>{item[1]}</Text>
        </View>
      ))}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 240,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  price: {
    fontSize: 18,
    color: "#0b66d6",
    marginVertical: 8,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 16,
  },
  specBox: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  specLabel: {
    color: "#555",
  },
  specValue: {
    fontWeight: "600",
  },
});