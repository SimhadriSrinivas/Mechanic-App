import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { sendOtp } from "../../services/api";
import { saveUserRole } from "../../utils/storage";

const { height } = Dimensions.get("window");
type Role = "user" | "mechanic";

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneRef = useRef<TextInput | null>(null);
  const bottomAnim = useRef(new Animated.Value(0)).current;

  /* ================= ROLE SELECT ================= */

  const selectRole = async (r: Role) => {
    setRole(r);
    setAgreed(false);
    await saveUserRole(r);
  };

  /* ================= KEYBOARD ================= */

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(bottomAnim, {
        toValue: e.endCoordinates.height,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* ================= SEND OTP ================= */

  const onSendOtp = async () => {
    if (!agreed) return;

    if (phone.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    const normalized = "+91" + phone;
    setLoading(true);
    setError(null);

    try {
      await saveUserRole(role);
      await sendOtp(normalized);

      router.push({
        pathname: "/otp",
        params: { phone: normalized, role },
      });
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const termsText =
    role === "mechanic"
      ? "I agree that I am a verified mechanic, will provide genuine services, and accept mechanic platform rules."
      : "I agree to the Terms & Privacy Policy and allow this app to contact me for service updates.";

  const isButtonDisabled = !agreed || loading;

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={["#02112b", "#0a3b86", "#3b8ad0"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Role Selector */}
            <View style={styles.roleWrap}>
              <TouchableOpacity
                style={[styles.roleBtn, role === "user" && styles.roleActive]}
                onPress={() => selectRole("user")}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === "user" && styles.roleTextActive,
                  ]}
                >
                  User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === "mechanic" && styles.roleActive,
                ]}
                onPress={() => selectRole("mechanic")}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === "mechanic" && styles.roleTextActive,
                  ]}
                >
                  Mechanic
                </Text>
              </TouchableOpacity>
            </View>

            {/* Image */}
            <ImageBackground
              source={require("../../assets/images/login-image.webp")}
              style={styles.imageTop}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.imageOverlay}>
                <Text style={styles.title}>
                  {role === "mechanic" ? "Mechanic Login" : "Welcome"}
                </Text>
                <Text style={styles.subtitle}>
                  {role === "mechanic"
                    ? "Receive service requests instantly"
                    : "Mechanic on-demand. Fast & Reliable"}
                </Text>
              </View>
            </ImageBackground>

            {/* Form */}
            <View style={styles.formCard}>
              <View style={styles.row}>
                <View style={styles.codeBox}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.codeText}>+91</Text>
                </View>

                <TextInput
                  ref={phoneRef}
                  value={phone}
                  onChangeText={(t) =>
                    setPhone(t.replace(/[^0-9]/g, "").slice(0, 10))
                  }
                  keyboardType={
                    Platform.OS === "android" ? "numeric" : "number-pad"
                  }
                  placeholder="Enter phone number"
                  style={styles.phoneInput}
                  maxLength={10}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.checkbox, agreed && styles.checkboxChecked]}
                >
                  {agreed && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>{termsText}</Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={[styles.bottomWrap, { marginBottom: bottomAnim }]}
            >
              <TouchableOpacity
                onPress={onSendOtp}
                disabled={isButtonDisabled}
                style={[styles.button, isButtonDisabled && { opacity: 0.5 }]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Sending..." : "Send OTP"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  roleWrap: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    padding: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  roleActive: { backgroundColor: "#fff" },
  roleText: { color: "#fff", fontWeight: "700" },
  roleTextActive: { color: "#02112b" },

  imageTop: {
    height: height * 0.32,
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  imageOverlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#eef6ff", fontSize: 14 },

  formCard: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  codeBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#000",
  },
  flag: { fontSize: 20, marginRight: 8 },
  codeText: { fontWeight: "700", color: "#000" },

  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#000",
    color: "#000",
  },

  errorText: {
    color: "#ffd1d1",
    textAlign: "center",
    marginTop: 8,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    backgroundColor: "#fff",
  },

  checkMark: {
    color: "#02112b",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 18,
  },

  termsText: {
    color: "#e6f0ff",
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },

  bottomWrap: {
    padding: 20,
  },
  button: {
    height: 56,
    backgroundColor: "#02112b",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
