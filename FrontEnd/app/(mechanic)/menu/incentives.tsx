import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

/* Hide header if using Expo Router */
export const options = {
  headerShown: false,
};

/* ================= TEMP MOCK DATA ================= */
const mockIncentives = [
  {
    id: "1",
    title: "Complete 10 Services",
    reward: "₹ 1000 Bonus",
    progress: "7 / 10 Completed",
  },
  {
    id: "2",
    title: "EV Specialist Bonus",
    reward: "₹ 500 Extra",
    progress: "3 / 5 EV Services",
  },
  {
    id: "3",
    title: "5 Star Rating Reward",
    reward: "₹ 750 Bonus",
    progress: "Rating: 4.6 / 5",
  },
];

export default function Incentives() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Incentives & Bonuses</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {mockIncentives.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.incentiveTitle}>{item.title}</Text>
              <Text style={styles.reward}>{item.reward}</Text>
              <Text style={styles.progress}>{item.progress}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },

  incentiveTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  reward: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
    marginTop: 6,
  },

  progress: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },
});
