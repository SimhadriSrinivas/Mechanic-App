import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopNavBar from "./components/TopNavBar";
import DutyMap from "./components/DutyMap";
import StatusCard from "./components/StatusCard";
import ReferEarnCard from "./components/ReferEarnCard";

export default function MechanicHome() {
  const [onDuty, setOnDuty] = useState(false);

  const toggleDuty = () => setOnDuty((prev) => !prev);

  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar onDuty={onDuty} toggleDuty={toggleDuty} />

      <ScrollView contentContainerStyle={styles.content}>
        {onDuty && <DutyMap />}

        <StatusCard />
        <ReferEarnCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fa" },
  content: { padding: 16 },
});
