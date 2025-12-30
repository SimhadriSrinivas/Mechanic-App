import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatusCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>You are Online</Text>
      <Text>Waiting for service requests</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: "#eef6ff", marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 4 },
});
