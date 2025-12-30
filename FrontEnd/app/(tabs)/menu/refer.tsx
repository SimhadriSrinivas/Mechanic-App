// app/(tabs)/menu/refer.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Refer() {
  const onShare = async () => {
    await Share.share({
      message:
        "Use my app referral code: ABC123 — download at https://example.com",
    });
  };

  return (
    <SafeAreaView style={r.container}>
      <View>
        <Text style={r.title}>Refer & Earn</Text>
        <View style={r.card}>
          <Text style={r.info}>
            Share and earn credits when friends sign up.
          </Text>
          <TouchableOpacity onPress={onShare} style={r.btn}>
            <Text style={r.btnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const r = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700" },
  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efeae6",
  },
  info: { color: "#555" },
  btn: {
    marginTop: 12,
    backgroundColor: "#0b66d6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
