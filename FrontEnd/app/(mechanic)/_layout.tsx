import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { createContext, useState } from "react";
import { useRouter } from "expo-router";

export const DutyContext = createContext<{
  onDuty: boolean;
  toggleDuty: () => void;
}>({
  onDuty: false,
  toggleDuty: () => {},
});

export default function MechanicLayout() {
  const [onDuty, setOnDuty] = useState(false);
  const router = useRouter();

  const toggleDuty = () => {
    setOnDuty((prev) => !prev);
  };

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

          // 🔥 Profile Icon (Left)
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

          // 🔥 Duty Button (Right)
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleDuty}
              style={[
                styles.dutyBtn,
                { backgroundColor: onDuty ? "#2ecc71" : "#e74c3c" },
              ]}
            >
              <Text style={styles.dutyText}>
                {onDuty ? "On Duty" : "Off Duty"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      >
        {/* HOME */}
        <Stack.Screen
          name="home/index"
          options={{ title: "Home" }}
        />

        {/* 🔥 MENU AS HALF SCREEN MODAL */}
        <Stack.Screen
          name="menu/index"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
          }}
        />

        {/* Other Menu Screens */}
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
  },
  dutyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
