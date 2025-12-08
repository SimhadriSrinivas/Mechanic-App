// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useRouter } from "expo-router";
import { getLoggedInPhone, clearLoggedInPhone } from "../../utils/storage";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getLoggedInPhone();
      if (!saved) {
        router.replace("/login");
      } else {
        setPhone(saved);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!phone) return null;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Welcome, {phone}</Text>

      <Button
        title="Logout"
        onPress={async () => {
          await clearLoggedInPhone();
          router.replace("/login");
        }}
      />
    </View>
  );
}
