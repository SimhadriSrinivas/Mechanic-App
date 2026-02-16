import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

/* ================= TEMP MOCK DATA ================= */
const mockHistory = [
  {
    id: "1",
    service: "Bike Repair",
    customer: "Ravi Kumar",
    date: "12 Feb 2026",
    status: "Completed",
  },
  {
    id: "2",
    service: "Car Service",
    customer: "Suresh",
    date: "10 Feb 2026",
    status: "Completed",
  },
  {
    id: "3",
    service: "EV Battery Check",
    customer: "Anil",
    date: "08 Feb 2026",
    status: "Completed",
  },
];

export default function History() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service History</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockHistory.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.service}>{item.service}</Text>
            <Text style={styles.customer}>Customer: {item.customer}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.status}>{item.status}</Text>
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

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  service: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  customer: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  date: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  status: {
    fontSize: 13,
    color: "#16a34a",
    marginTop: 6,
    fontWeight: "600",
  },
});
