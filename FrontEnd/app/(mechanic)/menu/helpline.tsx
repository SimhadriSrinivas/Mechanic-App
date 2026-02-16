import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Helpline() {
  const handleCall = () => {
    Linking.openURL("tel:+919876543210"); // 🔥 Replace with real support number later
  };

  const handleWhatsApp = () => {
    Alert.alert("WhatsApp Support", "WhatsApp integration coming soon.");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@mecapp.com"); // 🔥 Replace later
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Helpline & Support</Text>

      {/* CALL SUPPORT */}
      <TouchableOpacity style={styles.card} onPress={handleCall}>
        <Ionicons name="call-outline" size={24} color="#000" />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Call Support</Text>
          <Text style={styles.cardSubtitle}>
            Speak directly with our support team
          </Text>
        </View>
      </TouchableOpacity>

      {/* WHATSAPP SUPPORT */}
      <TouchableOpacity style={styles.card} onPress={handleWhatsApp}>
        <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>WhatsApp Support</Text>
          <Text style={styles.cardSubtitle}>
            Chat with us instantly
          </Text>
        </View>
      </TouchableOpacity>

      {/* EMAIL SUPPORT */}
      <TouchableOpacity style={styles.card} onPress={handleEmail}>
        <Ionicons name="mail-outline" size={24} color="#000" />
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Email Support</Text>
          <Text style={styles.cardSubtitle}>
            Send us your issue via email
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
    color: "#000",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },

  textContainer: {
    marginLeft: 15,
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
});
