// app/(tabs)/home/components/ServiceGrid.tsx
import React, { useCallback } from "react";
import { View, FlatList } from "react-native";
import ServiceCard from "./ServiceCard";
import { SERVICES, ServiceItem } from "../../../../constants/servicesList";
import { styles } from "../../../../styles/homeStyles";
import { useRouter } from "expo-router";

export default function ServiceGrid() {
  const router = useRouter();

  const onPress = useCallback(
    (item: ServiceItem) => {
      switch (item.title) {
        case "Service":
          router.push({
            pathname: "/service/vehicles",
            params: { service: item.title },
          });
          break;

        case "Garage":
          router.push("/garage");
          break;

        case "Service Center":
          router.push("/centers");
          break;

        case "EV Help":
          // 🔥 DIRECTLY OPEN VEHICLE SELECTION (NO INDEX FILE)
          router.push("/evhelp/vehicles");
          break;

        default:
          // no action for other cards
          break;
      }
    },
    [router]
  );

  return (
    <View style={styles.gridContainer}>
      <FlatList
        data={SERVICES}
        keyExtractor={(i) => i.id}
        numColumns={4}
        columnWrapperStyle={styles.rowSpacing}
        renderItem={({ item }) => (
          <ServiceCard item={item} onPress={() => onPress(item)} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}
