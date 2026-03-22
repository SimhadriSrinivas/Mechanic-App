import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";

type Props = {
  mechanic: {
    name?: string;
    phone?: string;
    rating?: number;
  };
};

const MechanicCard = ({ mechanic }: Props) => {
  const handleCall = () => {
    if (mechanic?.phone) {
      Linking.openURL(`tel:${mechanic.phone}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* 👤 NAME */}
      <Text style={styles.name}>
        {mechanic?.name || "Mechanic"}
      </Text>

      {/* ⭐ RATING */}
      <Text style={styles.rating}>
        ⭐ {mechanic?.rating || "4.5"}
      </Text>

      {/* 📞 PHONE */}
      <Text style={styles.phone}>
        {mechanic?.phone || "No phone available"}
      </Text>

      {/* 📞 CALL BUTTON */}
      <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
        <Text style={styles.callText}>Call Mechanic</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MechanicCard;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    // Shadow (iOS + Android)
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  rating: {
    marginTop: 6,
    fontSize: 14,
    color: "#f59e0b",
  },

  phone: {
    marginTop: 6,
    color: "#64748b",
  },

  callBtn: {
    marginTop: 14,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  callText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});