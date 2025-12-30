// constants/servicesList.ts
export type ServiceItem = {
  id: string;
  title: string;
  iconLib: "MaterialCommunityIcons" | "FontAwesome5" | "Ionicons" | "Entypo";
  iconName: string;
};

export const SERVICES: ServiceItem[] = [
  {
    id: "service",
    title: "Service",
    iconLib: "MaterialCommunityIcons",
    iconName: "wrench",
  },
  { id: "garage", title: "Garage", iconLib: "FontAwesome5", iconName: "tools" },
  {
    id: "bike-parts",
    title: "Bike Parts",
    iconLib: "MaterialCommunityIcons",
    iconName: "bike",
  },
  {
    id: "car-parts",
    title: "Car Parts",
    iconLib: "MaterialCommunityIcons",
    iconName: "car",
  },
  {
    id: "ev-help",
    title: "EV Help",
    iconLib: "MaterialCommunityIcons",
    iconName: "battery-charging",
  },
  { id: "svc-center", title: "Service Center", iconLib: "Entypo", iconName: "shop" },
  { id: "bikes", title: "Bikes", iconLib: "FontAwesome5", iconName: "motorcycle" },
  { id: "cars", title: "Cars", iconLib: "Ionicons", iconName: "car-sport" },
];
