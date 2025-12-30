import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  saveMechanicProfileCompleted,
  saveMechanicRegStep,
} from "../../utils/storage";

export default function MechanicImage() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(true);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission?.granted) await requestPermission();
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    setImageUri(photo.uri);
    setCameraActive(false);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setCameraActive(false);
    }
  };

  const finish = async () => {
    await saveMechanicProfileCompleted(true);
    await saveMechanicRegStep("done");
    router.replace("/(mechanic)/home");
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Camera permission required</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Profile Image</Text>

      <View style={styles.imageBox}>
        {cameraActive ? (
          <CameraView ref={cameraRef} style={styles.camera} facing="front" />
        ) : (
          imageUri && <Image source={{ uri: imageUri }} style={styles.image} />
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={cameraActive ? takePicture : () => setCameraActive(true)}>
          <Text style={styles.btnText}>{cameraActive ? "Capture" : "Camera"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={pickFromGallery}>
          <Text style={styles.btnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.next, !imageUri && { opacity: 0.5 }]}
        disabled={!imageUri}
        onPress={finish}
      >
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  skip: { alignSelf: "flex-end" },
  skipText: { fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "800", marginVertical: 20 },
  imageBox: {
    height: 220,
    width: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  camera: { flex: 1 },
  image: { flex: 1 },
  controls: { flexDirection: "row", gap: 12, marginTop: 20 },
  btn: { backgroundColor: "#02112b", padding: 12, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700" },
  next: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "#02112b",
    padding: 16,
    width: "90%",
    borderRadius: 14,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontWeight: "800" },
});
