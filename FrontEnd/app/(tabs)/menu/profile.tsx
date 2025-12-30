// app/(tabs)/menu/profile.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile } from "../../../services/userApi";

export default function ProfileDetail() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let m = true;
    (async () => {
      const p = await getUserProfile();
      if (!m) return;
      setProfile(p);
      setLoading(false);
    })();
    return () => {
      m = false;
    };
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} />;

  return (
    <SafeAreaView style={local.container}>
      <View>
        <Text style={local.title}>User Profile</Text>
        <View style={local.card}>
          <Text style={local.label}>Name</Text>
          <Text style={local.value}>{profile?.name ?? "—"}</Text>

          <Text style={local.label}>Phone</Text>
          <Text style={local.value}>{profile?.phone ?? "—"}</Text>

          <Text style={local.label}>Email</Text>
          <Text style={local.value}>{profile?.email ?? "—"}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#efeae6",
  },
  label: { marginTop: 10, color: "#777", fontSize: 13 },
  value: { marginTop: 4, fontSize: 16, fontWeight: "600", color: "#111" },
});
