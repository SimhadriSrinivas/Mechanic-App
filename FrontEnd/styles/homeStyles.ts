// styles/homeStyles.ts
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export const colors = {
  navyStart: "#07133a",
  navyEnd: "#0f86ff",
  bg: "#faf7f3",
  cardBg: "#ffffff",
  muted: "#9aa3ad",
  iconBg: "#fff",
  iconBorderInner: "#dff0ff",
};

const CARD_SIZE = Math.round((width - 66 * 2 - 16) / 4);
const OUTER_SIZE = CARD_SIZE;
const BORDER_WIDTH = 4.2;
const INNER_SIZE = OUTER_SIZE - BORDER_WIDTH * 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 0,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 18,
  },
  adWrap: {
    marginTop: 12,
    alignItems: "center",
  },
  servicesWrap: {
    marginTop: 6,
    alignItems: "center",
  },
  referWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  gridContainer: {
    width: "100%",
    paddingVertical: 8,
  },
  serviceCardOuter: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE * 0.28,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceCardInner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE * 0.22,
    backgroundColor: colors.iconBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.iconBorderInner,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  serviceLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    width: OUTER_SIZE + 6,
    color: "#111",
  },
  referCard: {
    width: "100%",
    borderRadius: 12,
    height: "95%",
    backgroundColor: "#e9e9e9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowSpacing: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export const UI = {
  CARD_SIZE,
  OUTER_SIZE,
  INNER_SIZE,
  BORDER_WIDTH,
};
