import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MechanicSettings() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  btn: { backgroundColor: "#02112b", padding: 14, borderRadius: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
