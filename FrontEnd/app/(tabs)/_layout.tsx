import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}