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
import QRCode from "react-native-qrcode-svg";

const REPAIR_DATA_KEY = "@repair_temp_data";
const BACKEND_URL = "https://mechanic-app-backend-t33m.onrender.com";

export default function UpiPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  /* ================= PARAMS ================= */
  const amount = params.amount || "0";
  const issue = params.issue || "";
  const requestId = params.requestId || null;
  const payment_type = params.payment_type || "upi";

  /* 🔥 DEBUG */
  useEffect(() => {
    console.log("UPI SCREEN PARAMS:", params);
  }, []);

  const upiId = "9000258071@ibl";
  const name = "Mechanic Service";

  const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

  /* ================= CONFIRM PAYMENT ================= */
  const confirmPayment = async () => {
    try {
      /* ❗ VALIDATION */
      if (!requestId || requestId === "undefined") {
        Alert.alert("Error", "Request ID missing.\nGo back and try again.");
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

      if (!data.success) {
        Alert.alert("Error", data.message || "Something went wrong");
        return;
      }

      /* ✅ SUCCESS */
      Alert.alert("Success", "UPI Payment saved");

      /* CLEAR LOCAL DATA */
      await AsyncStorage.removeItem(REPAIR_DATA_KEY);

      /* 🔥 IMPORTANT FIX (FOR WHITE SCREEN ISSUE) */
      router.replace({
        pathname: "home",
        params: { refresh: Date.now() }, // forces reload
      });

    } catch (error) {
      console.log("UPI ERROR:", error);
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scan & Pay</Text>

      <Text style={styles.amount}>₹ {amount}</Text>

      {/* QR CODE */}
      <View style={styles.qrContainer}>
        <QRCode value={upiUrl} size={220} />
      </View>

      <Text style={styles.info}>
        Scan using Google Pay / PhonePe / Paytm
      </Text>

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={confirmPayment}>
        <Text style={styles.buttonText}>Payment Received</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
  },

  amount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: 20,
  },

  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },

  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});