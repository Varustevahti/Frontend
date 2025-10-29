import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Button, Card } from "react-native-paper";
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
  const host = hostCandidate
    .replace(/^exp:\/\//, "")
    .replace(/^https?:\/\//, "")
    .split(":")[0];

  return host ? `http://${host}:8000` : null;
}

/** Muodosta täysi kuva-URL backendin palauttamasta polusta */
function toImageUrl(baseURL, imagePath) {
  if (!imagePath) return null;
  if (/^https?:\/\//.test(imagePath)) return imagePath;
  if (!baseURL) return null;
  return `${baseURL}/${String(imagePath).replace(/^\/+/, "")}`;
}

export default function LocationScreen() {
  const baseURL = useMemo(() => resolveBaseURL(), []);

  const [locations, setLocations] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [itemsByLoc, setItemsByLoc] = useState({}); // { [locId]: { loading, items, error } }
  const [creating, setCreating] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      if (!baseURL) return;
      const res = await fetchWithTimeout(`${baseURL}/locations/`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`GET /locations failed ${res.status}: ${txt}`);
      }
      const data = await res.json();
      setLocations(data || []);
    } catch (e) {
      console.error("Failed to load locations:", e);
      Alert.alert("Error", "Failed to load locations");
    }
  }, [baseURL]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const createLocation = async () => {
    try {
      if (!baseURL) {
        Alert.alert("No API", "API baseURL could not be resolved.");
        return;
      }
      if (!name.trim()) {
        Alert.alert("Name required", "Please enter a location name.");
        return;
      }
      setCreating(true);
      const res = await fetchWithTimeout(`${baseURL}/locations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc || null, owner: null }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Create failed ${res.status}: ${txt}`);
      }
      setName("");
      setDesc("");
      await loadLocations();
      Alert.alert("Created", "Location created successfully.");
    } catch (e) {
      console.error("Could not create location", e);
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setCreating(false);
    }
  };

  const ensureItemsLoaded = async (locId) => {
    if (!baseURL || !locId) return;
    const bucket = itemsByLoc[locId];
    if (bucket?.loading || bucket?.items) return;

    setItemsByLoc((prev) => ({ ...prev, [locId]: { loading: true, items: null, error: null } }));
    try {
      const res = await fetchWithTimeout(`${baseURL}/items/by_location/${locId}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`GET /items/by_location/${locId} failed ${res.status}: ${txt}`);
      }
      const data = await res.json();
      setItemsByLoc((prev) => ({ ...prev, [locId]: { loading: false, items: data || [], error: null } }));
    } catch (e) {
      console.error("Failed to load items by location:", e);
      setItemsByLoc((prev) => ({ ...prev, [locId]: { loading: false, items: [], error: String(e) } }));
    }
  };

  const onToggleExpand = async (locId) => {
    if (expandedId === locId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(locId);
    await ensureItemsLoaded(locId);
  };

  const renderItemRow = ({ item }) => {
    const imgUri = toImageUrl(baseURL, item.image);
    const title = item.desc || "Unnamed item";
    return (
      <View style={styles.itemRow}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.itemThumb} />
        ) : (
          <View style={[styles.itemThumb, styles.thumbPlaceholder]}>
            <Text style={{ color: "#52946B" }}>No image</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{title}</Text>
          {typeof item.category_id === "number" && (
            <Text style={styles.itemMeta}>Category ID: {item.category_id}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderLocationCard = ({ item }) => {
    const isOpen = expandedId === item.id;
    const bucket = itemsByLoc[item.id];

    return (
      <Card style={styles.card}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => onToggleExpand(item.id)}>
          <Card.Title
            title={item.name}
            subtitle={item.description || ""}
            right={() => (
              <Text style={styles.chev}>{isOpen ? "▲" : "▼"}</Text>
            )}
          />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.accordionBody}>
            {bucket?.loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#52946B" />
                <Text style={{ marginLeft: 8, color: "#52946B" }}>Loading items…</Text>
              </View>
            ) : bucket?.error ? (
              <Text style={styles.errorText}>Failed to load items: {bucket.error}</Text>
            ) : (bucket?.items?.length ?? 0) === 0 ? (
              <Text style={styles.emptyText}>No items in this location.</Text>
            ) : (
              <FlatList
                data={bucket.items}
                keyExtractor={(it) => String(it.id)}
                renderItem={renderItemRow}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Locations</Text>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Location name"
          placeholderTextColor="#52946B"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { height: 44 }]}
          placeholder="Description (optional)"
          placeholderTextColor="#52946B"
          value={desc}
          onChangeText={setDesc}
        />
        <Button mode="contained" onPress={createLocation} style={styles.btn} loading={creating}>
          Create
        </Button>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderLocationCard}
        ListEmptyComponent={<Text style={{ color: "#777", padding: 12 }}>No locations yet.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFA", padding: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#52946B", marginBottom: 8 },
  formRow: { marginBottom: 16 },
  input: {
    height: 44,
    backgroundColor: "#EAF2EC",
    borderWidth: 0,
    paddingHorizontal: 10,
    color: "#52946B",
    borderRadius: 8,
    marginBottom: 8,
  },
  btn: { backgroundColor: "#52946B" },
  card: { backgroundColor: "#EAF2EC", marginBottom: 12, borderRadius: 12 },
  chev: { color: "#52946B", fontSize: 16, marginRight: 12 },
  accordionBody: { paddingHorizontal: 12, paddingBottom: 12 },
  loadingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  emptyText: { color: "#777", fontStyle: "italic", paddingVertical: 8 },
  errorText: { color: "#b00020", paddingVertical: 8 },
  sep: { height: 8 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFA",
    borderRadius: 10,
    padding: 8,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D6E8DC",
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#0D1A12" },
  itemMeta: { fontSize: 12, color: "#52946B", marginTop: 2 },
});