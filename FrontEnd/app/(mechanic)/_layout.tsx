import { Stack } from "expo-router";
import React, { createContext, useState, useEffect } from "react";
import { ActivityIndicator, View, Alert, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import { getLoggedInPhone } from "@/utils/storage";
import { updateDutyStatus } from "@/services/mechanicApi";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ================= DUTY CONTEXT ================= */

export const DutyContext = createContext<{
  onDuty: boolean;
  toggleDuty: () => void;
}>({
  onDuty: false,
  toggleDuty: () => {},
});

/* ================= REPAIR CONTEXT ================= */

export const RepairContext = createContext<{
  amount: string;
  issue: string;
  setRepairData: (amount: string, issue: string) => void;
  clearRepairData: () => void;
}>({
  amount: "",
  issue: "",
  setRepairData: () => {},
  clearRepairData: () => {},
});

export default function MechanicLayout() {
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [issue, setIssue] = useState("");

  const setRepairData = (amt: string, iss: string) => {
    setAmount(amt);
    setIssue(iss);
  };

  const clearRepairData = () => {
    setAmount("");
    setIssue("");
  };

  /* ================= LOAD DUTY STATE ================= */

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
          },
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

  /* ================= LOADING ================= */

  if (initialLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= LAYOUT ================= */

  return (
    <DutyContext.Provider value={{ onDuty, toggleDuty }}>
      <RepairContext.Provider
        value={{
          amount,
          issue,
          setRepairData,
          clearRepairData,
        }}
      >
        <StatusBar style="dark" backgroundColor="#ffffff" />

        {/* ✅ FIXED STACK */}
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        >
          {/* 🔥 IMPORTANT: REMOVE home/index restriction */}

          {/* Allow all routes automatically */}

          {/* Optional: explicitly include repair screen */}
          {/* <Stack.Screen name="(mechanic)/home/repair" /> */}

          {/* Menu screens */}
          <Stack.Screen
            name="menu/index"
            options={{
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
      </RepairContext.Provider>
    </DutyContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
