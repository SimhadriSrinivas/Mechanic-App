import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getLoggedInPhone,
  clearAuthStorage,
} from "../../../utils/storage";
import { getMechanicProfile } from "../../../services/api";

export default function MechanicMenu({ closeMenu }: any) {
  const router = useRouter();

  const [mechanicName, setMechanicName] = useState("");
  const [mechanicPhone, setMechanicPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const phone = await getLoggedInPhone();

        if (!phone) {
          setMechanicName("My Profile");
          setMechanicPhone("");
          return;
        }

        const response = await getMechanicProfile(phone);

        if (response.success && response.data) {
          setMechanicName(response.data.name || "My Profile");
          setMechanicPhone(
            response.data.phone?.replace(/^\+?91/, "") || ""
          );
        } else {
          setMechanicName("My Profile");
          setMechanicPhone("");
        }
      } catch (error) {
        console.log("Failed to load mechanic profile:", error);
        setMechanicName("My Profile");
        setMechanicPhone("");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const MenuItem = ({ icon, title, subtitle, route }: any) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        closeMenu?.();
        router.push(route);
      }}
    >
      <View style={styles.iconContainer}>{icon}</View>

      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await clearAuthStorage();
    closeMenu?.();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <Ionicons name="person-circle" size={70} color="#d1d5db" />
              <View style={{ marginLeft: 15 }}>
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Text style={styles.profileTitle}>{mechanicName}</Text>
                    <Text style={styles.phoneText}>{mechanicPhone}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <MenuItem
              icon={<MaterialIcons name="account-balance-wallet" size={22} color="#000" />}
              title="Earnings"
              subtitle="Transfer Money to Bank, History"
              route="/(mechanic)/menu/earnings"
            />

            <MenuItem
              icon={<FontAwesome5 name="gift" size={20} color="#000" />}
              title="Incentives"
              subtitle="Know how you get paid"
              route="/(mechanic)/menu/incentives"
            />

            <MenuItem
              icon={<Ionicons name="location-outline" size={22} color="#000" />}
              title="Nearby Requests"
              subtitle="Available service requests"
              route="/(mechanic)/menu/nearbyRequests"
            />

            <MenuItem
              icon={<Ionicons name="share-social-outline" size={22} color="#000" />}
              title="Refer & Earn"
              subtitle="Invite mechanics and earn rewards"
              route="/(mechanic)/menu/refer"
            />

            <MenuItem
              icon={<Ionicons name="time-outline" size={22} color="#000" />}
              title="History"
              subtitle="Previous completed services"
              route="/(mechanic)/menu/history"
            />

            <MenuItem
              icon={<Ionicons name="headset-outline" size={22} color="#000" />}
              title="Helpline"
              subtitle="Get support & assistance"
              route="/(mechanic)/menu/helpline"
            />
          </ScrollView>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  drawer: {
    width: "82%",
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  phoneText: {
    fontSize: 15,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  iconContainer: {
    width: 30,
    marginRight: 15,
    alignItems: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#777",
  },
  logoutBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
});
