import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { verifyOtp, sendOtp } from "../../services/api";
import {
  saveLoggedInPhone,
  saveUserRole,
  saveMechanicProfileCompleted,
  getMechanicRegStep,
  saveMechanicRegStep,
} from "../../utils/storage";

export const options = { headerShown: false };

const { width } = Dimensions.get("window");

const OTP_LENGTH = 6;
const RESEND_TIME = 150;
const MAX_RESENDS = 3;

export default function OtpScreen() {
  const router = useRouter();
  const { phone, role } = useLocalSearchParams<{
    phone?: string;
    role?: "user" | "mechanic";
  }>();

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIME);
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hiddenInputRef = useRef<TextInput>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current;

  const boxSize = Math.min(60, Math.floor((width - 80) / OTP_LENGTH));

  /* TIMER */
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  /* KEYBOARD */
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(bottomAnim, {
        toValue: e.endCoordinates.height,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* SAFETY */
  if (!phone || !role) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>Invalid request</Text>
      </SafeAreaView>
    );
  }

  const openKeyboard = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 50);
  };

  const onChangeOtp = (text: string) => {
    const clean = text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    setOtp(clean);
    setError(null);

    if (clean.length === OTP_LENGTH) {
      verifyCode(clean);
    }
  };

  /* VERIFY OTP (FIXED) */
  const verifyCode = async (code: string) => {
    try {
      setLoading(true);

      const res = await verifyOtp(phone, code, role);

      if (!res.ok) {
        setError(res.message || res.reason || "Wrong OTP");
        setOtp("");
        openKeyboard();
        return;
      }

      // SAVE AUTH
      await saveLoggedInPhone(phone);
      await saveUserRole(role);

      if (role === "user") {
        router.replace("/(tabs)");
        return;
      }

      // mechanic flow
      const isProfileCompleted = !!res.profile?.completed;
      await saveMechanicProfileCompleted(isProfileCompleted);

      if (isProfileCompleted) {
        await saveMechanicRegStep("done");
        router.replace("/(mechanic)/home");
        return;
      }

      const step = await getMechanicRegStep();

      if (step === "image") {
        router.replace("/(auth)/mechanic-image");
      } else {
        await saveMechanicRegStep("form");
        router.replace("/(auth)/mechanic-register");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* RESEND */
  const onResend = async () => {
    if (secondsLeft > 0 || resendCount >= MAX_RESENDS) return;
    await sendOtp(phone);
    setResendCount((c) => c + 1);
    setSecondsLeft(RESEND_TIME);
  };

  const formatTime = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const digits = Array.from({ length: OTP_LENGTH }).map(
    (_, i) => otp[i] || ""
  );

  return (
    <LinearGradient colors={["#02112b", "#0a3b86", "#3b8ad0"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>{phone}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={1}
            style={styles.otpWrap}
            onPress={openKeyboard}
          >
            <TextInput
              ref={hiddenInputRef}
              value={otp}
              onChangeText={onChangeOtp}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenInput}
            />

            <View style={styles.row}>
              {digits.map((d, i) => (
                <View
                  key={i}
                  style={[styles.box, { width: boxSize, height: boxSize }]}
                >
                  <Text style={styles.boxText}>{d}</Text>
                </View>
              ))}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity onPress={onResend}>
              <Text style={styles.resend}>
                {resendCount >= MAX_RESENDS
                  ? "Resend limit reached"
                  : secondsLeft > 0
                  ? `Resend in ${formatTime()}`
                  : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <Animated.View style={{ marginBottom: bottomAnim }}>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => verifyCode(otp)}
              disabled={loading || otp.length !== OTP_LENGTH}
            >
              <Text style={styles.verifyText}>
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginTop: 40 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#dfefff", marginTop: 6 },

  otpWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  hiddenInput: { position: "absolute", opacity: 0 },

  row: { flexDirection: "row", marginBottom: 12 },
  box: {
    marginHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: { fontSize: 22, fontWeight: "700", color: "#02112b" },

  resend: { color: "#dfefff", marginTop: 10 },
  error: { color: "#ffbaba", marginTop: 8 },

  verifyBtn: {
    height: 52,
    backgroundColor: "#02112b",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  verifyText: { color: "#fff", fontWeight: "800" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
