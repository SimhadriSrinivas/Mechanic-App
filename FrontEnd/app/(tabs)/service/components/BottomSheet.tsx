import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

type Props = {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
};

const BottomSheet = ({ children, visible, onClose }: Props) => {
  const translateY = useRef(new Animated.Value(MAX_HEIGHT)).current;

  /* ================= OPEN / CLOSE ================= */

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: MAX_HEIGHT,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  /* ================= DRAG ================= */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dy) > 5;
      },

      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          // 🔽 Close
          Animated.spring(translateY, {
            toValue: MAX_HEIGHT,
            useNativeDriver: true,
          }).start(() => onClose && onClose());
        } else {
          // 🔼 Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      {/* 🔥 Drag Indicator */}
      <View style={styles.dragHandle} />

      {/* CONTENT */}
      {children}
    </Animated.View>
  );
};

export default BottomSheet;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: -20,
    width: "100%",
    height: MAX_HEIGHT,
    backgroundColor: "#ffffff",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    padding: 16,

    // Shadow
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  dragHandle: {
    width: 60,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
});