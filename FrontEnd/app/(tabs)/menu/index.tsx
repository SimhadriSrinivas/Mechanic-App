import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { getUserProfile, UserProfile, getCurrentUser } from "../../../services/userApi";
import { clearAuthStorage } from "../../../utils/storage";

type MenuItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  route?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "helpline", title: "Help line", icon: <Ionicons name="call-outline" size={22} />, route: "/menu/helpline" },
  { id: "payments", title: "Payments", icon: <FontAwesome5 name="wallet" size={20} />, route: "/menu/payments" },
  { id: "refer", title: "Refer & Earn", icon: <MaterialIcons name="share" size={20} />, route: "/menu/refer" },
  { id: "notifications", title: "Notifications", icon: <Ionicons name="notifications-outline" size={22} />, route: "/menu/notifications" },
  { id: "settings", title: "Settings", icon: <Ionicons name="settings-outline" size={22} />, route: "/menu/settings" },
  { id: "about", title: "About us", icon: <Ionicons name="information-circle-outline" size={22} />, route: "/menu/about" },
];

export default function MenuScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // ⚡ background fetch (NON-BLOCKING)
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const user = await getCurrentUser();
          if (user?.phone) {
            const p = await getUserProfile(user.phone);
            if (active) setProfile(p);
          }
        } catch {
          // silent fail → UI stays usable
        }
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  /* ================= LOGOUT ================= */

  const onLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await clearAuthStorage();
            router.replace("/login");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* User card (ALWAYS RENDERED) */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => router.push("/menu/profile")}
        >
          <View style={styles.userLeft}>
            <View style={styles.avatar}>
              <FontAwesome5 name="user" size={20} color="#111" />
            </View>
            <View>
              <Text style={styles.userName}>
                {profile?.name ?? "User name"}
              </Text>
              <Text style={styles.userPhone}>
                {profile?.phone ?? "—"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>

        {/* Rating */}
        <TouchableOpacity
          style={styles.ratingRow}
          onPress={() => router.push("/menu/rating")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="star" size={20} color="#f1c40f" />
            <Text style={styles.listText}>Rating</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#999" />
        </TouchableOpacity>

        {/* Menu list */}
        <FlatList
          data={MENU_ITEMS}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.rowLeft}>{item.icon}</View>
              <Text style={styles.listText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          style={{ marginTop: 12 }}
        />

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 14 },
  userCard: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ece7e2",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  userLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontWeight: "700", fontSize: 16, color: "#111" },
  userPhone: { marginTop: 4, color: "#666" },
  ratingRow: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ece7e2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { width: 36, alignItems: "center" },
  listText: { flex: 1, paddingLeft: 6, fontSize: 16, color: "#111" },
  sep: { height: 1, backgroundColor: "#f0edea", marginVertical: 6 },
  logoutBtn: {
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: "#02112b",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
