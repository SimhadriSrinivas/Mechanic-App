import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ReferEarnCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Refer & Earn</Text>
      <Text>Invite mechanics and earn rewards</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#fff3e0" },
  title: { fontWeight: "700", marginBottom: 4 },
});
