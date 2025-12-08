// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      {/* Auth screens */}
      <Stack.Screen
        name="(auth)/login"
        options={{ title: "Login", headerShown: true }}
      />
      <Stack.Screen
        name="(auth)/otp"
        options={{ title: "Verify OTP", headerShown: true }}
      />

      {/* Main app (tabs) */}
      <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
    </Stack>
  );
}
