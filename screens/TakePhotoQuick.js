import React, { useState, useMemo } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { buildUserHeadersForMultipart } from "../utils/apiHeaders";

function resolveBaseURL() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || Constants?.expoConfig?.extra?.apiUrl;
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/$/, "");

  const { manifest2, manifest } = Constants ?? {};
  const hostCandidate =
    manifest2?.debuggerHost ||
    manifest?.debuggerHost ||
    manifest2?.hostUri ||
    manifest?.hostUri ||
    "";
  const host = hostCandidate.replace(/^exp:\/\//, "").replace(/^https?:\/\//, "").split(":")[0];
  return host ? `http://${host}:8000` : null;
}

/**
 * Props:
 * - mode: "takephoto" | "addimage"
 * - hasname: string (voi olla tyhjä)
 * - selectedLocationId?: number
 * - onDone: ({ newUri, nameofitem, hascategory, serverLocationId }) => void
 */
export default function TakePhotoQuick({
  onDone,
  label = "Take Photo",
  border = 5,
  padding = 5,
  margin = 10,
  mode = "takephoto",
  hasname = "",
  selectedLocationId,
}) {
  const [uploading, setUploading] = useState(false);
  const baseURL = useMemo(() => resolveBaseURL(), []);

  const launch = async () => {
    const perm = mode === "takephoto"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (perm.status !== "granted") {
      Alert.alert("Permission needed", "Camera/Library permission is required.");
      return;
    }

    const result = mode === "takephoto"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8, exif: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });

    if (result.canceled) return;

    const newUri = result.assets[0].uri;
    let nameofitem = hasname;
    let hascategory = null;
    let serverLocationId = null;

    try {
      setUploading(true);
      // /items/auto HOITAA NIMEN ITSE -> me emme lähetä "name":a
      const data = await uploadAutoItem({
        fileUri: newUri,
        location_id: typeof selectedLocationId === "number" ? selectedLocationId : undefined,
        baseURL,
      });

      // Backend palauttaa ItemModelin -> käytetään desc/name ja category_id
      nameofitem = data?.name || data?.desc || "unknown item";
      hascategory = data?.category_id ?? null;
      serverLocationId = data?.location_id ?? null;

      console.log("✅ OK /items/auto:", { nameofitem, hascategory, serverLocationId });
      onDone?.({ newUri, nameofitem, hascategory, serverLocationId });
    } catch (err) {
      console.error("❌ Error during image recognition:", err);
      Alert.alert("Upload failed", String(err?.message || err));
      onDone?.({ newUri, nameofitem: nameofitem || "Unknown item", hascategory: null, serverLocationId: null });
    } finally {
      setUploading(false);
    }
  };

  async function uploadAutoItem({ fileUri, location_id, baseURL }) {
    if (!baseURL) throw new Error("No API baseURL resolved");

    const name = fileUri.split("/").pop() || "upload.jpg";
    const ext = name.split(".").pop()?.toLowerCase();
    const type =
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      "image/jpeg";

    const form = new FormData();
    form.append("file", { uri: fileUri, name, type });
    if (typeof location_id === "number") form.append("location_id", String(location_id));

    const headers = buildUserHeadersForMultipart();
    // Lisätään **vain headerit** – ei query-parametreja
    console.log("TakePhotoQuick → POST", `${baseURL}/items/auto`, {
      formKeys: Array.from(form._parts || []).map(p => p[0]),
      headers,
    });

    const res = await fetch(`${baseURL}/items/auto`, {
      method: "POST",
      body: form,
      headers,
    });

    const text = await res.text().catch(() => "");
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      console.log("❌ /items/auto failed:", res.status, text || "(no body)");
      throw new Error(`Upload failed ${res.status}: ${text || "(no body)"}`);
    }
    return json;
  }

  return (
    <View style={{ padding }}>
      <Button
        loading={uploading}
        mode="contained"
        style={[styles.camerabutton, { borderRadius: border, margin }]}
        onPress={launch}
      >
        <Text style={styles.camerabuttontext}>{label}</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  camerabutton: { backgroundColor: '#EAF2EC' },
  camerabuttontext: { color: '#0D1A12', fontWeight: 'bold', padding: 10 },
});