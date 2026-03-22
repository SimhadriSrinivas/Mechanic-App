import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";

import PendingRequestsList from "./PendingRequestsList";
import AcceptedRequestView from "./AcceptedRequestView";

type Props = {
  acceptedRequest: any | null;
  pendingRequests: any[];
  onAccepted: () => void;
};

const RequestBottomSheet = ({
  acceptedRequest,
  pendingRequests,
  onAccepted,
}: Props) => {
  const sheetHeight = 300;
  const collapsed = sheetHeight - 70;

  const translateY = useRef(new Animated.Value(collapsed)).current;
  const lastOffset = useRef(collapsed);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 10,

      onPanResponderMove: (_, gesture) => {
        let newPos = lastOffset.current + gesture.dy;

        if (newPos < 0) newPos = 0;
        if (newPos > collapsed) newPos = collapsed;

        translateY.setValue(newPos);
      },

      onPanResponderRelease: (_, gesture) => {
        let finalPos = lastOffset.current + gesture.dy;

        if (finalPos < collapsed / 2) finalPos = 0;
        else finalPos = collapsed;

        lastOffset.current = finalPos;

        Animated.spring(translateY, {
          toValue: finalPos,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  /* ================= GOOGLE NAVIGATION ================= */

  const openNavigation = () => {
    if (!acceptedRequest) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${acceptedRequest.user_lat},${acceptedRequest.user_lng}&travelmode=driving`;

    Linking.openURL(url);
  };

  /* ================= MY LOCATION ================= */

  const goToMyLocation = () => {
    if ((globalThis as any).centerMechanicOnMap) {
      (globalThis as any).centerMechanicOnMap();
    }
  };

  return (
    <>
      {/* FLOATING BUTTONS */}
      {acceptedRequest && (
        <Animated.View
          style={[styles.mapButton, { transform: [{ translateY }] }]}
        >
          <View style={styles.buttonRow}>
            {/* MY LOCATION */}
            <TouchableOpacity onPress={goToMyLocation}>
              <View style={styles.mapButtonCircle}>
                <Image
                  source={require("../../../../../assets/images/my-location.png")}
                  style={styles.mapIcon}
                />
              </View>
            </TouchableOpacity>

            {/* GOOGLE MAPS */}
            <TouchableOpacity onPress={openNavigation}>
              <View style={styles.mapButtonCircle}>
                <Image
                  source={require("../../../../../assets/images/google-maps.png")}
                  style={styles.mapIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* BOTTOM SHEET */}
      <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY }] }]}
      >
        {/* DRAG HANDLE */}
        <View {...panResponder.panHandlers}>
          <View style={styles.dragBar} />
        </View>

        {/* ACCEPTED REQUEST FLOW */}
        {acceptedRequest && (
          <AcceptedRequestView request={acceptedRequest} />
        )}

        {/* PENDING REQUESTS */}
        {!acceptedRequest && pendingRequests.length > 0 && (
          <PendingRequestsList
            requests={pendingRequests}
            onAccepted={onAccepted}
          />
        )}

        {/* NO REQUESTS */}
        {!acceptedRequest && pendingRequests.length === 0 && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for service requests...
            </Text>
          </View>
        )}
      </Animated.View>
    </>
  );
};

export default RequestBottomSheet;

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    elevation: 25,
  },

  dragBar: {
    width: 50,
    height: 6,
    backgroundColor: "#d1d5db",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 14,
  },

  waitingContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  waitingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },

  mapButton: {
    position: "absolute",
    right: 20,
    bottom: 460,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  mapButtonCircle: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 30,
    elevation: 8,
  },

  mapIcon: {
    width: 34,
    height: 34,
  },
});