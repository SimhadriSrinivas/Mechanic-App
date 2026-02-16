import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";

export const options = {
  headerShown: false,
};

const REFERRAL_CODE = "MEC12345"; // 🔥 Temporary demo code

export default function Refer() {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    Alert.alert("Copied", "Referral code copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join MEC App and earn with me! Use my referral code: ${REFERRAL_CODE}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Refer & Earn</Text>

        <View style={styles.card}>
          <Text style={styles.rewardTitle}>
            Earn ₹500 for every mechanic you refer!
          </Text>

          <Text style={styles.description}>
            Share your referral code with other mechanics. When they join
            and complete their first service, you get rewarded.
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.code}>{REFERRAL_CODE}</Text>
          </View>

          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyText}>Copy Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    padding: 20,
    borderRadius: 16,
  },

  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },

  codeBox: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  code: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
  },

  copyBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  copyText: {
    color: "#fff",
    fontWeight: "600",
  },

  shareBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  shareText: {
    color: "#fff",
    fontWeight: "600",
  },
});
