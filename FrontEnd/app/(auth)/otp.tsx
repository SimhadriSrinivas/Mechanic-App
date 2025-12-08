// app/(auth)/otp.tsx
import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifyOtp } from "../../services/api";
import { saveLoggedInPhone } from "../../utils/storage";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone as string | undefined;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!phone) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>No phone number provided. Go back to login.</Text>
        <Button
          title="Back to Login"
          onPress={() => router.replace("/login")}
        />
      </View>
    );
  }

  const onVerify = async () => {
    if (!otp) {
      Alert.alert("Error", "Enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(phone, otp);
      if (res.ok) {
        await saveLoggedInPhone(phone);
        Alert.alert("Success", "OTP verified!", [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      } else {
        Alert.alert("Error", res.message || res.reason || "Invalid OTP");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Verify OTP</Text>
      <Text>OTP sent to {phone}</Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        placeholder="Enter OTP"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          letterSpacing: 4,
        }}
      />

      <Button
        title={loading ? "Verifying..." : "Verify OTP"}
        onPress={onVerify}
        disabled={loading}
      />
    </View>
  );
}
