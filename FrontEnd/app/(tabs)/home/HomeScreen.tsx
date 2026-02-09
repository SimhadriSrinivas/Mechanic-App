// app/(tabs)/home/HomeScreen.tsx
import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "./components/Header";
import AdBanner from "./components/AdBanner";
import ServiceGrid from "./components/ServiceGrid";
import ReferAndEarn from "./components/ReferAndEarn";

import { styles } from "../../../styles/homeStyles";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Status bar matches home theme */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f1f1f9" // same as home bg
      />

      {/* ✅ HEADER = TOP NAV BAR (fixed) */}
      <Header />

      {/* ✅ Scroll only page content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.adWrap}>
          <AdBanner />
        </View>

        <View style={styles.servicesWrap}>
          <ServiceGrid />
        </View>

        <View style={styles.referWrap}>
          <ReferAndEarn />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
