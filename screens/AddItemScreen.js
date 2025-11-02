import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Alert } from "react-native";
import { Menu, Button } from "react-native-paper";
import TakePhotoQuick from "./TakePhotoQuick";
import { useSQLiteContext } from "expo-sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import Constants from "expo-constants";
import { useUser } from "@clerk/clerk-expo";

/** Yhtenäinen baseURL-resoluutio (LAN-tila suositeltu) */
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
  const host = hostCandidate
    .replace("exp://", "")
    .replace("http://", "")
    .replace("https://", "")
    .split(":")[0];

  return host ? `http://${host}:8000` : null;
}

export default function AddItemScreen() {
  // Clerk-käyttäjä → ownerId talteen
  const { user } = useUser();
  const ownerId = (user?.id ?? globalThis.__clerkUserId ?? "") || "";

  // UI state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [uri, setUri] = useState(null);
  const [selectedSize, setSelectedSize] = useState("Medium");

  // Kategoriat
  const [categories, setCategories] = useState([]); // [{label, value, key}]
  const [openCat, setOpenCat] = useState(false);
  const [catValue, setCatValue] = useState(null);   // string (id) tai null

  // Lokaatiot
  const [locations, setLocations] = useState([]);   // [{label, value, key}]
  const [openLoc, setOpenLoc] = useState(false);
  const [locValue, setLocValue] = useState(null);   // string (id) tai null

  // Muut
  const [group_id] = useState(1); // toistaiseksi vakio
  const db = useSQLiteContext();
  const baseURL = useMemo(() => resolveBaseURL(), []);
  const pendingInitialCategory = useRef(null);

  // --- Kategorian automaattinen täyttö kuvasta
  const setAutoCategory = (maybeId) => {
    if (maybeId == null) {
      setCatValue(null);
      pendingInitialCategory.current = null;
      return;
    }
    const asString = String(maybeId);

    if (categories.length === 0) {
      // tallennetaan odottamaan siihen asti kunnes kategoriat on ladattu
      pendingInitialCategory.current = asString;
      return;
    }
    const exists = categories.some((c) => c.value === asString);
    setCatValue(exists ? asString : null);
    pendingInitialCategory.current = exists ? null : asString;
  };

  // --- Jos kategoriat latautuvat myöhässä, täydennä valinta jälkikäteen
  useEffect(() => {
    if (categories.length > 0 && pendingInitialCategory.current != null) {
      const asString = String(pendingInitialCategory.current);
      const exists = categories.some((c) => c.value === asString);
      if (exists) {
        setCatValue(asString);
        pendingInitialCategory.current = null;
      }
    }
  }, [categories]);

  // --- Lataa kategoriat
  useEffect(() => {
    if (!baseURL) return;
    (async () => {
      try {
        const res = await fetch(`${baseURL}/categories/`, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`GET /categories/ ${res.status}`);
        const data = await res.json();
        setCategories(
          data.map((it) => ({ label: it.name, value: String(it.id), key: `cat-${it.id}` }))
        );
      } catch (e) {
        console.error("Failed to load categories:", e);
        Alert.alert("Error", "Failed to load categories.");
      }
    })();
  }, [baseURL]);

  // --- Lataa lokaatiot
  useEffect(() => {
    if (!baseURL) return;
    (async () => {
      try {
        const res = await fetch(`${baseURL}/locations/`, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`GET /locations/ ${res.status}`);
        const data = await res.json();
        setLocations(
          data.map((l) => ({ label: l.name, value: String(l.id), key: `loc-${l.id}` }))
        );
      } catch (e) {
        console.error("Failed to load locations:", e);
        Alert.alert("Error", "Failed to load locations.");
      }
    })();
  }, [baseURL]);

  const emptyItem = () => {
    setItemName("");
    setUri(null);
    setDescription("");
    setSelectedSize("Medium");
    setCatValue(null);
    setLocValue(null);
  };

  const updateList = async () => {
    try {
      const list = await db.getAllAsync("SELECT * FROM myitems ORDER BY id DESC");
      console.log("Items in database:", list);
    } catch (error) {
      console.error("Could not get items", error);
    }
  };

  // Tallennus paikalliseen SQLiteen (kotinäkymä lukee tästä)
  const saveItem = async () => {
    try {
      await db.runAsync(
        `INSERT INTO myitems 
         (name, image, description, owner, location, size, category_id, group_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemName || null,
          uri || null,
          description || "",
          ownerId || "",                  // Clerk user id
          locValue || null,               // käyttäjän valitsema location id (string)
          selectedSize || "",
          Number(catValue) || 0,          // valittu kategoria
          Number(group_id) || 0,
        ]
      );
      await updateList();
      Alert.alert("Saved", "Item stored locally.");
      emptyItem();
    } catch (error) {
      console.error("Could not add item", error);
      Alert.alert("Error", "Failed to save item locally.");
    }
  };

  return (
    <ScrollView style={{ backgroundColor: "#F8FBFA" }} contentContainerStyle={styles.scrollContainer}>
      <View style={{ flexDirection: "row", marginBottom: 5, gap: 10, paddingTop: 15 }}>
        <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={emptyItem}>
          CLEAR
        </Button>
        <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={saveItem}>
          SAVE
        </Button>
      </View>

      {/* Kuva */}
      <View style={[styles.cameraview, { flexDirection: "column", width: "60%" }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.cameraimage} />
        ) : (
          <>
            <View style={{ alignItems: "center", padding: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add Image</Text>
              <Text style={{ width: "100%", textAlign: "center" }}>Take a photo or select from gallery</Text>
            </View>
            <View style={{ gap: 10 }}>
              <TakePhotoQuick
                label="Add Image"
                mode="addimage"
                border={0}
                hasname={itemName}
                selectedLocationId={locValue ? Number(locValue) : undefined} // liitetään backendille (valinnainen)
                onDone={({ newUri, nameofitem, hascategory }) => {
                  setUri(newUri);
                  if (nameofitem) setItemName(nameofitem);
                  setAutoCategory(hascategory); // ⬅️ täyttää pickeriin, jos löytyy
                }}
              />
            </View>
          </>
        )}
      </View>

      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Item Name"
        placeholderTextColor="#52946B"
        onChangeText={setItemName}
        value={itemName}
      />

      <TextInput
        style={[styles.inputdescription]}
        placeholder="Description"
        placeholderTextColor="#52946B"
        multiline
        onChangeText={setDescription}
        value={description}
      />

      {/* Kategoria */}
      <View style={{ zIndex: 1000, width: "90%", marginVertical: 10 }}>
        <DropDownPicker
          open={openCat}
          value={catValue}
          items={categories}
          setOpen={setOpenCat}
          setValue={setCatValue}
          setItems={setCategories}
          placeholder="Select category"
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
        />
      </View>

      {/* Lokaatio (manuaalinen, valinnainen) */}
      <View style={{ zIndex: 500, width: "90%", marginVertical: 10 }}>
        <DropDownPicker
          open={openLoc}
          value={locValue}
          items={locations}
          setOpen={setOpenLoc}
          setValue={setLocValue}
          setItems={setLocations}
          placeholder="Select location (optional)"
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { alignItems: "center", backgroundColor: "#F8FBFA" },
  cameraview: {
    backgroundColor: "#F8FBFA",
    borderWidth: 1,
    borderStyle: "dashed",
    width: "60%",
    height: "35%",
    borderColor: "#52946B",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraimage: { width: "100%", height: "100%", resizeMode: "contain", borderRadius: 5 },
  input: {
    height: 40,
    backgroundColor: "#EAF2EC",
    borderWidth: 0,
    paddingHorizontal: 10,
    color: "#52946B",
    width: "90%",
    margin: 10,
    borderRadius: 5,
  },
  inputdescription: {
    height: 120,
    backgroundColor: "#EAF2EC",
    paddingHorizontal: 10,
    color: "#52946B",
    width: "90%",
    margin: 10,
    borderRadius: 5,
    textAlignVertical: "top",
  },
  dropdown: {
    backgroundColor: "#EAF2EC",
    borderColor: "#52946B",
    borderWidth: 0,
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownContainer: { backgroundColor: "#F8FBFA", borderColor: "#52946B", borderWidth: 1 },
  dropdownText: { fontSize: 16, color: "#52946B" },
});