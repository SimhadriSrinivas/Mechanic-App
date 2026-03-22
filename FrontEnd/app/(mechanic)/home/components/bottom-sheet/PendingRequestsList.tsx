import React from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import StatusCard from "../StatusCard";

type Props = {
  requests: any[];
  onAccepted: () => void;
};

const PendingRequestsList = ({ requests, onAccepted }: Props) => {

  /* ================= NO REQUESTS ================= */

  if (!requests || requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Waiting for service requests...
        </Text>
      </View>
    );
  }

  /* ================= CHECK IF ANY REQUEST IS ACCEPTED ================= */

  const activeRequest = requests.find(
    (r: any) => r.status === "accepted"
  );

  if (activeRequest) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          You already have an active job
        </Text>
      </View>
    );
  }

  /* ================= GET ALL PENDING REQUESTS ================= */

  const pendingRequests = requests.filter(
    (r: any) => r.status === "pending"
  );

  if (pendingRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Waiting for service requests...
        </Text>
      </View>
    );
  }

  /* ================= SHOW ALL PENDING REQUESTS ================= */

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {pendingRequests.map((req: any) => (
        <StatusCard
          key={req.$id}
          requestId={req.$id}
          userPhone={req.user_phone}
          status={req.status}
          userLat={Number(req.user_lat)}
          userLng={Number(req.user_lng)}
          vehicleType={req.vehicle_type}
          onAccepted={onAccepted}
        />
      ))}
    </ScrollView>
  );
};

export default PendingRequestsList;

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
});