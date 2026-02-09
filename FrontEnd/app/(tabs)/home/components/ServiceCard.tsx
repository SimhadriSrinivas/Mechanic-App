// app/(tabs)/home/components/ServiceCard.tsx
import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles, colors, UI } from "../../../../styles/homeStyles";
import type { ServiceItem } from "../../../../constants/servicesList";

type Props = {
  item: ServiceItem;
  onPress?: (item: ServiceItem) => void;
};

function ServiceCardInner({ item, onPress }: Props) {
  const ICON_COLOR = colors.navyStart; // 🎯 premium dark navy

  const IconComponent = (() => {
    switch (item.iconLib) {
      case "FontAwesome5":
        return (
          <FontAwesome5
            name={item.iconName as any}
            size={26}
            color={ICON_COLOR}
          />
        );

      case "Ionicons":
        return (
          <Ionicons
            name={item.iconName as any}
            size={26}
            color={ICON_COLOR}
          />
        );

      case "Entypo":
        return (
          <Entypo
            name={item.iconName as any}
            size={26}
            color={ICON_COLOR}
          />
        );

      default:
        return (
          <MaterialCommunityIcons
            name={item.iconName as any}
            size={26}
            color={ICON_COLOR}
          />
        );
    }
  })();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{ alignItems: "center", width: UI.OUTER_SIZE }}
      onPress={() => onPress?.(item)}
    >
      {/* Icon container */}
      <LinearGradient
        colors={[colors.navyStart, colors.navyEnd]}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.serviceCardOuter, { padding: UI.BORDER_WIDTH }]}
      >
        <View style={styles.serviceCardInner}>{IconComponent}</View>
      </LinearGradient>

      {/* Label (Paytm / PhonePe style) */}
      <Text
        numberOfLines={1}
        style={[
          styles.serviceLabel,
          {
            fontWeight: "400",              // ✅ regular
            color: colors.textPrimary,      // ✅ softer than pure black
          },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(ServiceCardInner);
