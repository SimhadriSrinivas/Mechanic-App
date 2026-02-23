import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";

import { getLoggedInPhone } from "@/utils/storage";
import { updateDutyStatus } from "@/services/mechanicApi";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const DutyContext = createContext<{
  onDuty: boolean;
  toggleDuty: () => void;
}>({
  onDuty: false,
  toggleDuty: () => {},
});

export default function MechanicLayout() {
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  /* ================= LOAD DUTY STATE FROM BACKEND ================= */

  useEffect(() => {
    const loadDutyState = async () => {
      try {
        const phone = await getLoggedInPhone();
        if (!phone || !API_URL) {
          setInitialLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/api/mechanic/profile?phone=${phone}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setOnDuty(data.data.state === "OnDuty");
        }
      } catch (err) {
        console.log("Load duty error:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadDutyState();
  }, []);

  /* ================= TOGGLE DUTY ================= */

  const toggleDuty = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const phone = await getLoggedInPhone();
      if (!phone) {
        Alert.alert("Error", "Mechanic not logged in");
        return;
      }

      const newState = onDuty ? "OffDuty" : "OnDuty";

      const success = await updateDutyStatus(phone, newState);

      if (!success) {
        Alert.alert("Error", "Failed to update duty status");
        return;
      }

      setOnDuty(newState === "OnDuty");
    } catch (err) {
      console.log("Duty toggle error:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= WAIT FOR INITIAL LOAD ================= */

  if (initialLoading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <ActivityIndicator
          style={{ flex: 1, alignSelf: "center" }}
          size="large"
        />
      </>
    );
  }

  return (
    <DutyContext.Provider value={{ onDuty, toggleDuty }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTitleStyle: {
            color: "#000",
            fontWeight: "600",
          },
          headerTintColor: "#000",

          /* ================= LEFT PROFILE ICON ================= */
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(mechanic)/menu")}
              style={{ marginLeft: 15 }}
            >
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#000"
              />
            </TouchableOpacity>
          ),

          /* ================= RIGHT DUTY BUTTON ================= */
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleDuty}
              disabled={loading}
              style={[
                styles.dutyBtn,
                { backgroundColor: onDuty ? "#2ecc71" : "#e74c3c" },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.dutyText}>
                  {onDuty ? "On Duty" : "Off Duty"}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="home/index"
          options={{ title: "Home" }}
        />

        <Stack.Screen
          name="menu/index"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
          }}
        />

        <Stack.Screen name="menu/earnings" />
        <Stack.Screen name="menu/incentives" />
        <Stack.Screen name="menu/nearbyRequests" />
        <Stack.Screen name="menu/refer" />
        <Stack.Screen name="menu/history" />
        <Stack.Screen name="menu/helpline" />
      </Stack>
    </DutyContext.Provider>
  );
}

const styles = StyleSheet.create({
  dutyBtn: {
    marginRight: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  dutyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
