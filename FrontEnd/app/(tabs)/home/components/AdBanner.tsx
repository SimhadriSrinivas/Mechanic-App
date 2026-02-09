// app/(tabs)/home/components/AdBanner.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";

const IMAGES = [
  require("../../../../assets/images/Add-1.webp"),
  require("../../../../assets/images/Add-2.webp"),
  require("../../../../assets/images/Add-3.webp"),
  require("../../../../assets/images/Add-4.webp"),
];

export default function AdBanner() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250, // smoother
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % IMAGES.length);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [fadeAnim]);

  return (
    <View style={styles.wrapper}>
      <Animated.Image
        source={IMAGES[index]}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Premium card wrapper */
  wrapper: {
    width: "105%",
    height: 120,
    borderRadius: 14, // ⬅️ smoother, premium
    overflow: "hidden",
    backgroundColor: "#eef3fb", // soft fallback
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  image: {
    width: "100%",
    height: "100%",
  },
});
