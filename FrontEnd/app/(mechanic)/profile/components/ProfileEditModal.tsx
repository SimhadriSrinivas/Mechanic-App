import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

type Props = {
  visible: boolean;
  onClose: () => void;
  phone: string;
  initialName: string;
  initialService?: string;
  onUpdated?: () => void;
};

export default function ProfileEditModal({
  visible,
  onClose,
  phone,
  initialName,
  initialService = "",
  onUpdated,
}: Props) {
  const [name, setName] = useState(initialName);
  const [service, setService] = useState(initialService);
  const [loading, setLoading] = useState(false);

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/mechanic/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          name,
          service,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        Alert.alert("Error", data.message || "Update failed");
        return;
      }

      Alert.alert("Success", "Profile updated successfully");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("update profile error:", err);
      Alert.alert("Error", "Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* ================= HEADER ================= */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* ================= FORM ================= */}
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your name"
            />

            <Text style={styles.label}>Service Type</Text>
            <TextInput
              value={service}
              onChangeText={setService}
              style={styles.input}
              placeholder="Bike / Car / General"
            />
          </View>

          {/* ================= ACTION ================= */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: "#1e88e5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
