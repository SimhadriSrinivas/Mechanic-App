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
  const IconComponent = (() => {
    switch (item.iconLib) {
      case "FontAwesome5":
        return (
          <FontAwesome5 name={item.iconName as any} size={28} color={"#000"} />
        );
      case "Ionicons":
        return (
          <Ionicons name={item.iconName as any} size={28} color={"#000"} />
        );
      case "Entypo":
        return <Entypo name={item.iconName as any} size={28} color={"#000"} />;
      default:
        return (
          <MaterialCommunityIcons
            name={item.iconName as any}
            size={28}
            color={"#000"}
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
      <LinearGradient
        colors={[colors.navyStart, colors.navyEnd]}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.serviceCardOuter, { padding: UI.BORDER_WIDTH }]}
      >
        <View style={styles.serviceCardInner}>{IconComponent}</View>
      </LinearGradient>

      <Text numberOfLines={1} style={styles.serviceLabel}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(ServiceCardInner);
