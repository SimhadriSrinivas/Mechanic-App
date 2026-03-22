import React, { useState, useContext, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { RepairContext } from "../../_layout";

export default function RepairScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ GET requestId

  const requestId = params.requestId || ""; // 🔥 IMPORTANT

  /* 🔥 GLOBAL CONTEXT */
  const {
    amount: savedAmount,
    issue: savedIssue,
    setRepairData,
  } = useContext(RepairContext);

  const [amount, setAmount] = useState("");
  const [issue, setIssue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  /* ================= QUICK OPTIONS ================= */
  const quickIssues = [
    { label: "Tyre Puncture", price: "120", desc: "Fix flat tyre" },
    { label: "Chain Issue", price: "150", desc: "Chain adjustment" },
    { label: "Battery Issue", price: "300", desc: "Battery jump/start" },
    { label: "Engine Problem", price: "500", desc: "Basic engine repair" },
    { label: "Brake Issue", price: "200", desc: "Brake adjustment" },
    { label: "Oil Change", price: "250", desc: "Engine oil refill" },
    { label: "Clutch Issue", price: "350", desc: "Clutch repair" },
    { label: "Spark Plug", price: "180", desc: "Plug cleaning/replacement" },
  ];

  /* ================= LOAD SAVED DATA ================= */
  useEffect(() => {
    if (savedAmount) setAmount(savedAmount);
    if (savedIssue) setIssue(savedIssue);

    const index = quickIssues.findIndex((item) => item.label === savedIssue);
    if (index !== -1) setSelectedIndex(index);
  }, []);

  const handleQuickSelect = (item: any, index: number) => {
    setIssue(item.label);
    setAmount(item.price);
    setSelectedIndex(index);
  };

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    if (!amount || !issue) {
      alert("Please enter issue and amount");
      return;
    }

    setRepairData(amount, issue);

    router.push({
      pathname: "home/PaymentScreens/PaymentMethodScreen",
      params: {
        amount,
        issue,
        requestId, // 🔥 PASS THIS
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Repair Details</Text>
        <Text style={styles.subtitle}>
          Enter issue and cost before proceeding
        </Text>

        {/* AMOUNT */}
        <View style={styles.card}>
          <Text style={styles.label}>Enter Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount (₹)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* ISSUE */}
        <View style={styles.card}>
          <Text style={styles.label}>Issue Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe issue"
            value={issue}
            onChangeText={setIssue}
          />
        </View>

        {/* QUICK SELECT */}
        <Text style={styles.sectionTitle}>Quick Select</Text>

        <View style={styles.issueListContainer}>
          <ScrollView nestedScrollEnabled={true}>
            {quickIssues.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickItem,
                  selectedIndex === index && styles.selectedItem,
                ]}
                onPress={() => handleQuickSelect(item, index)}
              >
                <View>
                  <Text style={styles.quickText}>{item.label}</Text>
                  <Text style={styles.quickDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.quickPrice}>₹ {item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#64748b",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#0f172a",
  },
  issueListContainer: {
    maxHeight: 350,
    marginBottom: 20,
  },
  quickItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedItem: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  quickText: {
    fontSize: 15,
    fontWeight: "600",
  },
  quickDesc: {
    fontSize: 12,
    color: "#64748b",
  },
  quickPrice: {
    fontWeight: "700",
    color: "#2563eb",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});