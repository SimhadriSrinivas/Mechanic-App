// app/(auth)/login.tsx
import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { sendOtp } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("+91");
  const [loading, setLoading] = useState(false);

  const onSendOtp = async () => {
    if (!phone.startsWith("+")) {
      Alert.alert("Error", "Phone must be in +91... format");
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(phone);
      if (res.ok) {
        Alert.alert("Success", "OTP sent to your phone");
        router.push({ pathname: "/otp", params: { phone } }); // (auth)/otp
      } else {
        Alert.alert("Error", res.message || "Failed to send OTP");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
        Login with Phone
      </Text>

      <Text>Phone (+91...)</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        placeholder="+919000258071"
      />

      <Button
        title={loading ? "Sending..." : "Send OTP"}
        onPress={onSendOtp}
        disabled={loading}
      />
    </View>
  );
}
