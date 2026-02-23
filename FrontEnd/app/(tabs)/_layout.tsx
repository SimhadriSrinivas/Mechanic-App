import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { getLoggedInPhone, getUserRole } from "../../utils/storage";
export default function TabsLayout() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const phone = await getLoggedInPhone();
      const role = await getUserRole();
      if (!phone) {
        router.replace("/(auth)/login");
        return;
      }
      if (role !== "user") {
        router.replace("/(mechanic)/home");
        return;
      }
    })();
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
