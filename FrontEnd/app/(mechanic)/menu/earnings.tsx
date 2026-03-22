import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getLoggedInPhone } from "../../../utils/storage";

const BACKEND_URL =
  "https://mechanic-app-backend-t33m.onrender.com";

export default function Earnings() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= NORMALIZE PHONE ================= */
  const normalizePhone = (phone: string) => {
    if (!phone) return "";

    let cleaned = phone.toString().replace(/\D/g, "");

    // remove country code
    if (cleaned.startsWith("91") && cleaned.length > 10) {
      cleaned = cleaned.slice(2);
    }

    return cleaned;
  };

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        let phone = await getLoggedInPhone();

        if (!phone) return;

        phone = normalizePhone(phone);

        console.log("📞 NORMALIZED PHONE:", phone);

        const res = await fetch(
          `${BACKEND_URL}/api/service/mechanic-history?phone=${phone}`
        );

        const data = await res.json();

        console.log("📦 API RESPONSE:", data);

        if (data?.success) {
          /* 🔥 FILTER ONLY COMPLETED + VALID AMOUNT */
          const filtered = (data.data || []).filter(
            (item: any) =>
              item.status === "completed" &&
              item.amount !== null &&
              item.amount !== undefined
          );

          setEarnings(filtered);
        }
      } catch (err) {
        console.log("❌ Earnings fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  /* ================= TOTAL ================= */

  const totalEarnings = useMemo(() => {
    return earnings.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
  }, [earnings]);

  /* ================= FORMAT DATE ================= */

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";

    const date = new Date(dateStr);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Earnings</Text>

      {/* TOTAL CARD */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={styles.totalAmount}>₹ {totalEarnings}</Text>
      </View>

      {/* EMPTY STATE */}
      {earnings.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: "#777" }}>No earnings yet</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {earnings.map((item, index) => (
            <View key={item.$id || index} style={styles.card}>
              <View>
                <Text style={styles.service}>
                  {item.issue_description || "Service"}
                </Text>

                <Text style={styles.date}>
                  {formatDate(item.call_completed_at)}
                </Text>
              </View>

              <Text style={styles.amount}>
                ₹ {item.amount || 0}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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