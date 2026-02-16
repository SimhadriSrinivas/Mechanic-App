import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

/* ================= MOCK DATA (TEMPORARY) ================= */
const mockEarnings = [
  { id: "1", date: "12 Feb 2026", service: "Bike Repair", amount: 450 },
  { id: "2", date: "11 Feb 2026", service: "Car Service", amount: 1200 },
  { id: "3", date: "10 Feb 2026", service: "EV Check", amount: 800 },
  { id: "4", date: "09 Feb 2026", service: "Truck Repair", amount: 2000 },
];

/* ================= COMPONENT ================= */

export default function Earnings() {
  const totalEarnings = useMemo(() => {
    return mockEarnings.reduce((sum, item) => sum + item.amount, 0);
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Earnings</Text>

      {/* TOTAL CARD */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={styles.totalAmount}>₹ {totalEarnings}</Text>
      </View>

      {/* HISTORY LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockEarnings.map((item) => (
          <View key={item.id} style={styles.card}>
            <View>
              <Text style={styles.service}>{item.service}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Text style={styles.amount}>₹ {item.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
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

  totalCard: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },

  totalLabel: {
    color: "#ccc",
    fontSize: 14,
  },

  totalAmount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  service: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  date: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },
});
