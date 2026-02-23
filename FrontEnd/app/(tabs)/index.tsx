// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import HomeScreen from "./home/HomeScreen";
import { getLoggedInPhone } from "../../utils/storage";

export default function TabsIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getLoggedInPhone();
        if (!saved) {
          router.replace("/login");
          return;
        }
        setPhone(saved);
      } catch (err) {
        console.warn("Failed to read logged in phone:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!phone) {
    return null;
  }

  return <HomeScreen />;
}
