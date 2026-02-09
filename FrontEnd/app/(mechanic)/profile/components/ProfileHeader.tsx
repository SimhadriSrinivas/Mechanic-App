import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProfileEditModal from "./ProfileEditModal";

type ProfileHeaderProps = {
  name: string;
  phone: string;
  rating?: number;
  service?: string;
  onProfileUpdated?: () => void;
};

export default function ProfileHeader({
  name,
  phone,
  rating = 4.5,
  service = "",
  onProfileUpdated,
}: ProfileHeaderProps) {
  const [editVisible, setEditVisible] = useState(false);

  const initial = name?.charAt(0)?.toUpperCase() || "M";

  return (
    <>
      {/* ================= HEADER CARD ================= */}
      <View style={styles.container}>
        {/* AVATAR */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {/* EDIT ICON */}
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => setEditVisible(true)}
          >
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* ================= EDIT MODAL ================= */}
      <ProfileEditModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        phone={phone}
        initialName={name}
        initialService={service}
        onUpdated={onProfileUpdated}
      />
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1976D2",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },

  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    marginLeft: 16,
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  phone: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },

  ratingRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
