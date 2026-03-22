import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function PaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const amount = params.amount || "0";
  const issue = params.issue || "Not specified";
  const requestId = params.requestId || ""; // ✅ IMPORTANT

  /* ================= CASH ================= */
  const handleCash = () => {
    router.push({
      pathname: "home/PaymentScreens/CashPaymentScreen",
      params: {
        amount,
        issue,
        requestId,
        payment_type: "cash", // ✅
      },
    });
  };

  /* ================= UPI ================= */
  const handleUPI = () => {
    router.push({
      pathname: "home/PaymentScreens/UpiPaymentScreen",
      params: {
        amount,
        issue,
        requestId,
        payment_type: "upi", // ✅
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      {/* ================= DETAILS ================= */}
      <View style={styles.card}>
        <Text style={styles.label}>Issue</Text>
        <Text style={styles.value}>{issue}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amount}>₹ {amount}</Text>
      </View>

      {/* ================= CASH ================= */}
      <TouchableOpacity style={styles.cashBox} onPress={handleCash}>
        <Text style={styles.boxTitle}>Cash</Text>
        <Text style={styles.boxDesc}>Collect cash directly from customer</Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Continue with Cash</Text>
        </View>
      </TouchableOpacity>

      {/* ================= UPI ================= */}
      <TouchableOpacity style={styles.upiBox} onPress={handleUPI}>
        <Text style={styles.boxTitle}>UPI</Text>
        <Text style={styles.boxDesc}>
          Pay using Google Pay / PhonePe / Paytm
        </Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>Continue with UPI</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    color: "#64748b",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  amount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },

  cashBox: {
    borderWidth: 1,
    borderColor: "#16a34a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  upiBox: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 12,
    padding: 15,
  },

  boxTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  boxDesc: {
    fontSize: 13,
    marginVertical: 8,
    color: "#555",
  },

  button: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});