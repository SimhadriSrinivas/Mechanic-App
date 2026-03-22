import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";

type Props = {
  vehicleType?: string;
  onCancel?: (reason: string) => void;
};

export default function LoadingBars({ vehicleType, onCancel }: Props) {
  const bars = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const barDurations = [60000, 120000, 180000, 240000];

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");

  /* ================= ANIMATION ================= */

  useEffect(() => {
    const animations = bars.map((bar, index) =>
      Animated.timing(bar, {
        toValue: 1,
        duration: barDurations[index],
        useNativeDriver: false,
      }),
    );

    Animated.sequence(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
      bars.forEach((bar) => bar.setValue(0));
    };
  }, []);

  /* ================= COLORS ================= */

  const getColor = (anim: Animated.Value, start: string, end: string) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [start, end],
    });

  const barStyles = [
    { color: getColor(bars[0], "#16a34a", "#4ade80") },
    { color: getColor(bars[1], "#4ade80", "#a3e635") },
    { color: getColor(bars[2], "#a3e635", "#facc15") },
    { color: getColor(bars[3], "#f59e0b", "#ef4444") },
  ];

  const vehicleLabel = vehicleType
    ? `${vehicleType.toUpperCase()} Mechanic`
    : "General Mechanic";

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* 🔥 BARS */}
      <View style={styles.row}>
        {bars.map((bar, index) => (
          <View key={index} style={styles.bar}>
            <Animated.View
              style={[
                styles.fill,
                {
                  width: bar.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: barStyles[index].color,
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* 📄 INFO */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Request In Progress</Text>
        <Text style={styles.infoLine}>Booked: {vehicleLabel}</Text>
        <Text style={styles.infoLine}>
          Status: Matching nearby active mechanics
        </Text>
        <Text style={styles.infoLine}>
          Progress: Priority search is running
        </Text>
      </View>

      {/* ❌ CANCEL BUTTON */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.cancelText}>Cancel Request</Text>
      </TouchableOpacity>

      {/* 🚨 MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cancel Request</Text>
            <Text style={styles.modalSub}>
              Please tell us why you're cancelling
            </Text>

            {[
              "Found another mechanic",
              "Taking too long",
              "Wrong request",
              "Other",
            ].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.radioRow}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.radioOuter}>
                  {selectedReason === reason && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioText}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.confirmCancel}
              onPress={() => {
                const reason = selectedReason || "Other";
                setShowModal(false);
                onCancel?.(reason);
              }}
            >
              <Text style={styles.confirmText}>Confirm Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  bar: {
    flex: 1,
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 10,
  },

  infoCard: {
    width: "100%",
    marginTop: 18,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },

  infoLine: {
    fontSize: 13,
    color: "#334155",
    marginTop: 3,
  },

  info: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  subInfo: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
  },

  cancelBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.2)",
    borderWidth: 1,
    borderColor: "rgba(127,29,29,0.4)",
  },

  cancelText: {
    color: "#7f1d1d",
    fontWeight: "700",
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalSub: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 15,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#334155",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#334155",
  },

  radioText: {
    fontSize: 14,
  },

  confirmCancel: {
    marginTop: 18,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});
