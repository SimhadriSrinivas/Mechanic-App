import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileHeader from "./components/ProfileHeader";
import ProfileMenu from "./components/ProfileMenu";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const MECHANIC_PHONE = "9000258071"; // TODO: replace from auth/storage

type MechanicProfile = {
  name: string;
  phone: string;
  rating: number;
};

export default function MechanicProfile() {
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/mechanic/profile?phone=${MECHANIC_PHONE}`
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          Alert.alert("Error", data.message || "Failed to load profile");
          return;
        }

        setProfile({
          name: data.data.name,
          phone: data.data.phone,
          rating: data.data.rating ?? 4.5,
        });
      } catch (err) {
        console.error("fetchProfile error:", err);
        Alert.alert("Error", "Unable to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  /* ================= FAIL SAFE ================= */
  if (!profile) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= PROFILE HEADER ================= */}
        <ProfileHeader
          name={profile.name}
          phone={profile.phone}
          rating={profile.rating}
        />

        {/* ================= PROFILE MENU ================= */}
        <ProfileMenu />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
