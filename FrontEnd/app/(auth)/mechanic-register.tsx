import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getLoggedInPhone,
  saveMechanicFormDraft,
  getMechanicFormDraft,
  saveMechanicRegStep,
  saveMechanicProfileCompleted,
  getMechanicRegStep, // ✅ IMPORTANT
} from "../../utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { registerMechanic } from "../../services/api";

/* ================= OPTIONS ================= */

const SERVICE_TYPES = [
  { label: "Mechanic", icon: "wrench" },
  { label: "Service Centers", icon: "garage" },
  { label: "Bike Parts", icon: "bike" },
  { label: "Car Parts", icon: "car" },
];

const ROLES = [
  { label: "Bike Mechanic", icon: "motorbike" },
  { label: "Car Mechanic", icon: "car" },
  { label: "Auto Mechanic", icon: "rickshaw" },
  { label: "Truck Mechanic", icon: "truck" },
];

const VEHICLE_TYPES = [
  { label: "Normal", icon: "engine" },
  { label: "EV Vehicles", icon: "car-electric" },
];

export default function MechanicRegister() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();

  const stripPlus91 = (p?: string) => (p ? p.replace(/^\+?91/, "") : "");
  const [phone, setPhone] = useState<string>(stripPlus91(params.phone));

  useEffect(() => {
    if (!params.phone) {
      (async () => {
        const p = await getLoggedInPhone();
        if (p) setPhone(stripPlus91(p));
      })();
    }
  }, [params.phone]);

  /* ================= FORM STATES ================= */

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);

  const [showService, setShowService] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const isMechanicSelected = serviceTypes.includes("Mechanic");

  /* ================= RESTORE DRAFT + STEP FIX ================= */

  useEffect(() => {
    (async () => {
      const draft = await getMechanicFormDraft<any>();
      if (draft) {
        setFirstName(draft.firstName || "");
        setLastName(draft.lastName || "");
        setAddress(draft.address || "");
        setAadhaar(draft.aadhaar || "");
        setServiceTypes(draft.serviceTypes || []);
        setRoles(draft.roles || []);
        setVehicleTypes(draft.vehicleTypes || []);
      }

      // 🔥 CRITICAL FIX
      const step = await getMechanicRegStep();
      if (!step) {
        await saveMechanicRegStep("form");
      }
    })();
  }, []);

  /* ================= AUTO SAVE DRAFT ================= */

  useEffect(() => {
    saveMechanicFormDraft({
      firstName,
      lastName,
      address,
      aadhaar,
      serviceTypes,
      roles,
      vehicleTypes,
    });
  }, [firstName, lastName, address, aadhaar, serviceTypes, roles, vehicleTypes]);

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors: any = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!address.trim()) newErrors.address = "Address is required";

    if (!aadhaar.trim()) newErrors.aadhaar = "Aadhaar number is required";
    else if (aadhaar.length !== 12)
      newErrors.aadhaar = "Aadhaar must be 12 digits";

    if (serviceTypes.length === 0)
      newErrors.serviceTypes = "Select at least one service";

    if (isMechanicSelected) {
      if (roles.length === 0)
        newErrors.roles = "Select at least one role";
      if (vehicleTypes.length === 0)
        newErrors.vehicleTypes = "Select vehicle type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */

  const onRegister = async () => {
    if (!validate() || loading) return;

    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission is required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});

      await registerMechanic({
        firstName,
        lastName,
        phone: `+91${phone}`,
        serviceTypes,
        roles: isMechanicSelected ? roles : [],
        vehicleTypes: isMechanicSelected ? vehicleTypes : [],
        address,
        aadhaar,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      await saveMechanicProfileCompleted(false);
      await saveMechanicRegStep("image");

      router.replace("/(auth)/mechanic-image");
    } catch (e: any) {
      alert(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (
    label: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArr(arr.includes(label) ? arr.filter(i => i !== label) : [...arr, label]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#020b2d", "#0b5ed7"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Registration</Text>

            {/* First Name */}
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#aaa"
              value={firstName}
              onChangeText={(t) => {
                setFirstName(t);
                setErrors({ ...errors, firstName: "" });
              }}
            />
            {!!errors.firstName && (
              <Text style={styles.error}>{errors.firstName}</Text>
            )}

            {/* Last Name */}
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#aaa"
              value={lastName}
              onChangeText={(t) => {
                setLastName(t);
                setErrors({ ...errors, lastName: "" });
              }}
            />
            {!!errors.lastName && (
              <Text style={styles.error}>{errors.lastName}</Text>
            )}

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              editable={false}
              style={[styles.input, styles.disabled]}
            />

            {/* Service Type */}
            <Text style={styles.label}>Type of Service</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowService(!showService)}
            >
              <Text style={styles.dropdownText}>
                {serviceTypes.length
                  ? serviceTypes.join(", ")
                  : "Select Service Type"}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} />
            </TouchableOpacity>
            {!!errors.serviceTypes && (
              <Text style={styles.error}>{errors.serviceTypes}</Text>
            )}

            {showService &&
              SERVICE_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.dropdownItem}
                  onPress={() =>
                    toggleSelect(item.label, serviceTypes, setServiceTypes)
                  }
                >
                  <MaterialCommunityIcons name={item.icon as any} size={20} />
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                  {serviceTypes.includes(item.label) && (
                    <MaterialCommunityIcons name="check" size={18} color="green" />
                  )}
                </TouchableOpacity>
              ))}

            {isMechanicSelected && (
              <>
                {/* Role */}
                <Text style={styles.label}>Role</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowRoles(!showRoles)}
                >
                  <Text style={styles.dropdownText}>
                    {roles.length ? roles.join(", ") : "Select Role"}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={22} />
                </TouchableOpacity>
                {!!errors.roles && (
                  <Text style={styles.error}>{errors.roles}</Text>
                )}

                {showRoles &&
                  ROLES.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.dropdownItem}
                      onPress={() => toggleSelect(item.label, roles, setRoles)}
                    >
                      <MaterialCommunityIcons name={item.icon as any} size={20} />
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {roles.includes(item.label) && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="green"
                        />
                      )}
                    </TouchableOpacity>
                  ))}

                {/* Vehicle Type */}
                <Text style={styles.label}>Type of Vehicle</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowVehicles(!showVehicles)}
                >
                  <Text style={styles.dropdownText}>
                    {vehicleTypes.length
                      ? vehicleTypes.join(", ")
                      : "Select Vehicle Type"}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={22} />
                </TouchableOpacity>
                {!!errors.vehicleTypes && (
                  <Text style={styles.error}>{errors.vehicleTypes}</Text>
                )}

                {showVehicles &&
                  VEHICLE_TYPES.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.dropdownItem}
                      onPress={() =>
                        toggleSelect(item.label, vehicleTypes, setVehicleTypes)
                      }
                    >
                      <MaterialCommunityIcons name={item.icon as any} size={20} />
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {vehicleTypes.includes(item.label) && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="green"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
              </>
            )}

            {/* Address */}
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Address"
              placeholderTextColor="#aaa"
              multiline
              value={address}
              onChangeText={(t) => {
                setAddress(t);
                setErrors({ ...errors, address: "" });
              }}
            />
            {!!errors.address && (
              <Text style={styles.error}>{errors.address}</Text>
            )}

            {/* Aadhaar */}
            <Text style={styles.label}>Aadhaar Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Eg: 123456789012"
              keyboardType="numeric"
              maxLength={12}
              placeholderTextColor="#aaa"
              value={aadhaar}
              onChangeText={(t) => {
                setAadhaar(t);
                setErrors({ ...errors, aadhaar: "" });
              }}
            />
            {!!errors.aadhaar && (
              <Text style={styles.error}>{errors.aadhaar}</Text>
            )}

              <TouchableOpacity style={styles.btn} onPress={onRegister}>
              <Text style={styles.btnText}>
                {loading ? "Submitting..." : "Next"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { color: "#fff", fontWeight: "700", marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
  },
  disabled: { backgroundColor: "#e0e0e0" },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { fontWeight: "600" },
  dropdownItem: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  dropdownItemText: { marginLeft: 10, flex: 1, fontWeight: "600" },
  btn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  error: {
    color: "#ffcccc",
    fontSize: 12,
    marginBottom: 6,
  },
});