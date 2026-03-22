import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REPAIR_DATA_KEY = "@repair_temp_data";
const BACKEND_URL = "https://mechanic-app-backend-t33m.onrender.com";

export default function CashPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  /* ================= PARAMS ================= */
  const amount = params.amount || "0";
  const issue = params.issue || "";
  const requestId = params.requestId || null;
  const payment_type = params.payment_type || "cash";

  /* 🔥 DEBUG */
  useEffect(() => {
    console.log("CASH SCREEN PARAMS:", params);
  }, []);

  /* ================= CONFIRM CASH ================= */
  const handleCashReceived = async () => {
    try {
      /* ❗ VALIDATION */
      if (!requestId || requestId === "undefined") {
        Alert.alert(
          "Error",
          "Request ID missing.\nGo back and try again."
        );
        return;
      }

      /* 🔥 API CALL */
      const res = await fetch(
        `${BACKEND_URL}/api/service/complete-service`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            amount: Number(amount),
            issue_description: issue,
            payment_type,
          }),
        }
      );

      const data = await res.json();
      console.log("API RESPONSE:", data);

      if (!data.success) {
        Alert.alert("Error", data.message || "Something went wrong");
        return;
      }

      /* ✅ SUCCESS */
      Alert.alert("Success", "Cash payment saved");

      /* CLEAR STORAGE */
      await AsyncStorage.removeItem(REPAIR_DATA_KEY);

      /* 🔥 MAIN FIX (PREVENT WHITE SCREEN) */
      router.replace({
        pathname: "home",
        params: { refresh: Date.now() }, // force reload
      });

    } catch (error) {
      console.log("Payment error:", error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Collect Cash</Text>

        <Text style={styles.subtitle}>
          Please collect the amount from the customer
        </Text>

        {/* AMOUNT */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amount}>₹ {amount}</Text>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Instructions</Text>

          <Text style={styles.infoItem}>
            • Confirm issue is resolved before collecting payment
          </Text>

          <Text style={styles.infoItem}>
            • Collect exact cash amount
          </Text>

          <Text style={styles.infoItem}>
            • Tap button only after collecting payment
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleCashReceived}>
          <Text style={styles.buttonText}>Cash Received</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 30,
  },

  amountCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },

  amountLabel: {
    color: "#64748b",
  },

  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#16a34a",
  },

  infoCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 30,
  },

  infoTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  infoItem: {
    fontSize: 14,
    marginBottom: 6,
  },

  button: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});