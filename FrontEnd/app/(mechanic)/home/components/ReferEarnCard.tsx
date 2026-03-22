import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReferEarnCard() {

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const cardWidth = 216;
  const totalVideos = 4;

  useEffect(() => {

    const interval = setInterval(() => {

      let nextIndex = index + 1;

      scrollRef.current?.scrollTo({
        x: nextIndex * cardWidth,
        animated: true,
      });

      setIndex(nextIndex);

      if (nextIndex === 8) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            x: 0,
            animated: false,
          });
          setIndex(0);
        }, 300);
      }

    }, 3000);

    return () => clearInterval(interval);

  }, [index]);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Join MEC Mechanics App and start earning today! https://mec-temp-link.com",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDotPress = (dotIndex: number): void => {
    scrollRef.current?.scrollTo({
      x: dotIndex * cardWidth,
      animated: true,
    });
    setIndex(dotIndex);
  };

  const activeIndex = index % totalVideos;

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* VIDEO SLIDER */}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
      >

        {cards()}
        {cards()}

      </ScrollView>

      {/* DOTS INDICATOR */}

      <View style={styles.dotsContainer}>
        {Array.from({ length: totalVideos }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleDotPress(i)}
            style={[
              styles.dot,
              activeIndex === i && styles.activeDot
            ]}
          />
        ))}
      </View>


      {/* INSTRUCTIONS */}

      <View style={styles.instructionsBox}>

        <Text style={styles.instructionsTitle}>Instructions</Text>

        <Text style={styles.instructionItem}>
          • Turn ON duty to receive service requests
        </Text>

        <Text style={styles.instructionItem}>
          • Accept requests quickly to increase earnings
        </Text>

        <Text style={styles.instructionItem}>
          • Reach the customer location safely
        </Text>

        <Text style={styles.instructionItem}>
          • Complete the service to get paid
        </Text>

      </View>


      {/* REFER CARD */}

      <View style={styles.card}>

        <View style={styles.iconBox}>
          <Ionicons name="gift-outline" size={34} color="#2563eb" />
        </View>

        <View style={styles.textSection}>

          <Text style={styles.title}>
            Refer Mechanics & Earn
          </Text>

          <Text style={styles.subtitle}>
            Invite other mechanics to join MEC and earn rewards
            for every successful signup.
          </Text>

        </View>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>
            Refer Now
          </Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

/* reusable cards */

function cards() {
  return (
    <>
      <View style={styles.videoCard}>
        <Ionicons name="play-circle" size={50} color="#2563eb" />
        <Text style={styles.videoText}>How to Accept Requests</Text>
      </View>

      <View style={styles.videoCard}>
        <Ionicons name="play-circle" size={50} color="#2563eb" />
        <Text style={styles.videoText}>How to Reach Customer</Text>
      </View>

      <View style={styles.videoCard}>
        <Ionicons name="play-circle" size={50} color="#2563eb" />
        <Text style={styles.videoText}>Complete Service</Text>
      </View>

      <View style={styles.videoCard}>
        <Ionicons name="play-circle" size={50} color="#2563eb" />
        <Text style={styles.videoText}>Get More Earnings</Text>
      </View>
    </>
  );
}


/* STYLES */

const styles = StyleSheet.create({

  wrapper: {
    paddingHorizontal: 18,
  },

  content: {
    paddingTop: 32,
  },

  videoCard: {
    width: 200,
    height: 150,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginRight: 16,

    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  videoText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 12,   // added padding here
    marginBottom: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2563eb",
  },

  instructionsBox: {
    marginBottom: 20,
  },

  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111827",
  },

  instructionItem: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#e0edff",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 16,
  },

  textSection: {
    marginBottom: 20,
  },

  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

});