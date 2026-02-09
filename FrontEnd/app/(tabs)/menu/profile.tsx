import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getCurrentUser, getUserProfile } from "@/services/userApi";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        try {
          setLoading(true);
          setError(null);

          // Get logged-in Appwrite user
          const user = await getCurrentUser();

          if (!user?.phone) {
            throw new Error("Phone number not found");
          }

          // Fetch profile from DB
          const data = await getUserProfile(user.phone);

          if (isActive) {
            setProfile(data);
          }
        } catch (err: any) {
          if (isActive) {
            setError(err.message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadProfile();

      return () => {
        isActive = false; // cleanup on menu close / navigation
      };
    }, [])
  );

  // ---------------- UI ----------------

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text>Name: {profile?.name}</Text>
      <Text>Phone: {profile?.phone}</Text>
      <Text>Role: {profile?.role}</Text>
    </View>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  error: {
    color: "red",
  },
});
