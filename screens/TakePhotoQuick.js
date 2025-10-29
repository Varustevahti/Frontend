import React, { useMemo, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

/** 15s timeoutilla varustettu fetch */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 15000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/** Yhtenäinen baseURL-laskenta */
function resolveBaseURL() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || Constants?.expoConfig?.extra?.apiUrl;
  if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl.replace(/\/$/, "");

  const { manifest2, manifest } = Constants ?? {};
  const hostCandidate =
    manifest2?.debuggerHost ||
    manifest?.debuggerHost ||
    manifest2?.hostUri ||
    manifest?.hostUri ||
    "";
  const host = hostCandidate.replace(/^exp:\/\//, "")
    .replace(/^https?:\/\//, "")
    .split(":")[0];
  return host ? `http://${host}:8000` : null;
}

/**
 * Props:
 *  - mode: "takephoto" | "addimage"
 *  - hasname: string
 *  - selectedLocationId?: number
 *  - onDone: ({ newUri, nameofitem, hascategory, serverItemId, serverImagePath }) => void
 */
export default function TakePhotoQuick({
  onDone,
  label = "Take Photo",
  border = 8,
  padding = 6,
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
      ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });

    if (result.canceled) return;

    const newUri = result.assets?.[0]?.uri;
    if (!newUri) return;

    let nameofitem = hasname;
    let hascategory = null;
    let serverItemId = null;
    let serverImagePath = null;

    try {
      if (!baseURL) {
        Alert.alert("No API", "API baseURL could not be resolved. Start Expo in LAN or set EXPO_PUBLIC_API_URL.");
        return;
      }
      setUploading(true);

      if (!nameofitem) {
        const data = await uploadAutoItem({
          baseURL,
          fileUri: newUri,
          owner: "",
          location_id: typeof selectedLocationId === "number" ? selectedLocationId : undefined,
        });

        nameofitem = data?.desc ?? "unknown item";
        hascategory = data?.category_id ?? null;
        serverItemId = data?.id ?? null;
        serverImagePath = data?.image ?? null;
        console.log("OK /items/auto:", data);
      }

      onDone?.({ newUri, nameofitem, hascategory, serverItemId, serverImagePath });
    } catch (err) {
      console.error("Error during image recognition:", err);
      Alert.alert("Upload failed", String(err?.message || err));
      onDone?.({
        newUri,
        nameofitem: nameofitem || "Unknown item",
        hascategory: null,
        serverItemId: null,
        serverImagePath: null,
      });
    } finally {
      setUploading(false);
    }
  };

  async function uploadAutoItem({ baseURL, fileUri, owner = "", location_id }) {
    const name = fileUri.split("/").pop() || "upload.jpg";
    const ext = String(name.split(".").pop() || "").toLowerCase();
    const type =
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      "image/jpeg";

    const form = new FormData();
    form.append("file", { uri: fileUri, name, type });
    form.append("owner", owner);
    if (typeof location_id === "number") form.append("location_id", String(location_id));

    const res = await fetchWithTimeout(`${baseURL}/items/auto`, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Upload failed ${res.status}: ${txt}`);
    }
    return res.json();
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
  camerabutton: {
    backgroundColor: '#EAF2EC',
  },
  camerabuttontext: {
    color: '#0D1A12',
    fontWeight: 'bold',
    padding: 10,
  },
});