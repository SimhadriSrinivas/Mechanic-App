import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { getLoggedInPhone } from "../../../utils/storage";
import {
  getActiveServiceRequests,
  acceptServiceRequest,
} from "../../../services/api";

export const options = {
  headerShown: false,
};

export default function NearbyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mechanicPhone, setMechanicPhone] = useState<string>("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const phone = await getLoggedInPhone();
      if (!phone) return;

      setMechanicPhone(phone);

      const res = await getActiveServiceRequests(phone);

      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.log("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const res = await acceptServiceRequest({
        requestId,
        mechanic_phone: mechanicPhone,
      });

      if (res.success) {
        Alert.alert("Success", "Request accepted");
        loadRequests();
      }
    } catch (err) {
      console.log("Accept error:", err);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Nearby Requests</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {requests.length === 0 ? (
            <Text style={styles.emptyText}>
              No service requests available
            </Text>
          ) : (
            requests.map((item: any) => (
              <View key={item.$id} style={styles.card}>
                <Text style={styles.service}>
                  Service: {item.service || "General Service"}
                </Text>
                <Text style={styles.vehicle}>
                  Vehicle: {item.vehicle_type || "N/A"}
                </Text>
                <Text style={styles.phone}>
                  User: {item.user_phone}
                </Text>
                <Text style={styles.status}>
                  Status: {item.status}
                </Text>

                {item.status === "pending" && (
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item.$id)}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  service: {
    fontSize: 16,
    fontWeight: "600",
  },

  vehicle: {
    marginTop: 4,
    color: "#555",
  },

  phone: {
    marginTop: 4,
    color: "#555",
  },

  status: {
    marginTop: 6,
    fontWeight: "600",
  },

  acceptBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },
});
