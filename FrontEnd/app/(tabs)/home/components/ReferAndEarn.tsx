// app/(tabs)/home/components/ReferAndEarn.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, Image, View } from "react-native";
import { useRouter } from "expo-router";
// import { styles } from "../../../../styles/homeStyles";

export default function ReferAndEarn() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/menu/refer")}
      style={local.wrapper}
    >
      <View style={local.card}>
        <Image
          source={require("../../../../assets/images/Refer-Earn.webp")}
          style={local.image}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
}

const local = StyleSheet.create({
  /* Outer spacing stays controlled by home layout */
  wrapper: {
    width: "103%",
  },

  /* Premium card container */
  card: {
    borderRadius: 16, // ⬅️ smoother, PhonePe-style
    overflow: "hidden",
    backgroundColor: "#0b4fa2", // fallback behind image

    // subtle elevation
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  image: {
    width: "100%",
    height: 350, // ⬅️ stable height, no overflow hacks
  },
});
