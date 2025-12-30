import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { getLoggedInPhone, getUserRole } from "../../utils/storage";

export default function TabsLayout() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const phone = await getLoggedInPhone();
      const role = await getUserRole();

      // ❌ Not logged in → go to login
      if (!phone) {
        router.replace("/(auth)/login");
        return;
      }

      // ❌ Mechanic trying to access user app
      if (role !== "user") {
        router.replace("/(mechanic)/home");
        return;
      }
    })();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
