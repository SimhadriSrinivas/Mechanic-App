// app/(tabs)/home/components/AdBanner.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";

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
      // fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // switch image
        setIndex((prev) => (prev + 1) % IMAGES.length);

        // fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.banner, { width: "100%", height: 90 }]}>
      <Animated.Image
        source={IMAGES[index]}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e6e6e6",
    borderWidth: 2,
    borderColor: "#9ec9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
