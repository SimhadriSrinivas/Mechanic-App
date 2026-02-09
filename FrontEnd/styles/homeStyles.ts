// styles/homeStyles.ts
import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

/* ================= COLORS ================= */
/* PhonePe / Paytm–style calm palette */

export const colors = {
  navyStart: "#07133a",
  navyEnd: "#0f86ff",

  bg: "#faf7f3",          // soft cream (good)
  cardBg: "#ffffff",

  textPrimary: "#111111",
  textSecondary: "#666666",
  muted: "#9aa3ad",

  iconBg: "#ffffff",
  iconBorderInner: "#dff0ff",
};

/* ================= SIZES ================= */

const CARD_SIZE = Math.round((width - 66 * 2 - 16) / 4);
const OUTER_SIZE = CARD_SIZE;
const BORDER_WIDTH = 4.2;
const INNER_SIZE = OUTER_SIZE - BORDER_WIDTH * 2;

/* ================= STYLES ================= */

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 20, // slightly more breathing room
  },

  adWrap: {
    marginTop: 12,
    alignItems: "center",
  },

  servicesWrap: {
    marginTop: 8,
    alignItems: "center",
  },

  referWrap: {
    marginTop: 20,
    alignItems: "center",
  },

  gridContainer: {
    width: "100%",
    paddingVertical: 8,
  },

  /* ================= SERVICE CARD ================= */

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
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  /* ⬇️ IMPORTANT: Premium label style */
  serviceLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400",           // ✅ NOT bold (PhonePe style)
    textAlign: "center",
    width: OUTER_SIZE + 6,
    color: colors.textPrimary,
  },

  /* ================= REFER CARD ================= */

  referCard: {
    width: "100%",
    borderRadius: 14,
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

/* ================= UI CONSTANTS ================= */

export const UI = {
  CARD_SIZE,
  OUTER_SIZE,
  INNER_SIZE,
  BORDER_WIDTH,
};
