// app/(tabs)/menu/helpline.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Helpline() {
  const hotline = "+911234567890";

  return (
    <SafeAreaView style={h.container}>
      <View>
        <Text style={h.title}>Help line</Text>

        <View style={h.card}>
          <Text style={h.info}>Call for immediate assistance</Text>
          <TouchableOpacity
            style={h.callBtn}
            onPress={() => Linking.openURL(`tel:${hotline}`)}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={h.callText}>{hotline}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const h = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efeae6",
  },
  info: { marginBottom: 12, color: "#444" },
  callBtn: {
    backgroundColor: "#0b66d6",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  callText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
});
