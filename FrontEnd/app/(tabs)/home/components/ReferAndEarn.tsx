// app/(tabs)/home/components/ReferAndEarn.tsx
import React from "react";
import { Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { styles } from "../../../../styles/homeStyles";
import { useRouter } from "expo-router";

export default function ReferAndEarn() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.referCard}
      activeOpacity={0.9}
      onPress={() => router.push("/menu/refer")}   // Navigate to your Refer screen
    >
      <Image
        source={require("../../../../assets/images/Refer-Earn.webp")}
        style={local.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const local = StyleSheet.create({
  image: {
    width: "100%",
    height: "110%",   // stays proportional inside your referCard
    borderRadius: 10,
    marginBottom: 12,
  },
});
