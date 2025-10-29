import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Alert } from "react-native";
import { Button } from "react-native-paper";
import TakePhotoQuick from "./TakePhotoQuick";
import { useSQLiteContext } from "expo-sqlite";
import DropDownPicker from "react-native-dropdown-picker";
import Constants from "expo-constants";

// --- p kecilä apu: baseURL ja timeout ---
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

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 15000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(resource, { ...rest, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

export default function AddItemScreen() {
  const db = useSQLiteContext();
  const baseURL = useMemo(() => resolveBaseURL(), []);
  console.log("🌐 AddItemScreen baseURL:", baseURL ?? "(none)");

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [uri, setUri] = useState(null);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [owner] = useState("Timo");
  const [group_id] = useState(1);

  // Kategoriat (DropDownPicker)
  const [categories, setCategories] = useState([]); // {label, value, key} + helper raw array
  const [categoriesRaw, setCategoriesRaw] = useState([]); // [{id,name}]
  const [openCat, setOpenCat] = useState(false);
  const [catValue, setCatValue] = useState(null);   // string id

  // Lokaatiot (käyttäjä valitsee manuaalisesti—voi olla null)
  const [locations, setLocations] = useState([]);
  const [openLoc, setOpenLoc] = useState(false);
  const [locValue, setLocValue] = useState(null);   // string id tai null

  // Jos kategoria ID tulee ennen kuin kategoriat on ladattu,
  // talletetaan se refiin ja asetetaan kun lista on saatu
  const pendingInitialCategory = useRef(null);

  // Päivitä kategorian id stringiksi, kun catValue muuttuu
  // (tämän voi lukea tallennuksessa Number(catValue))
  useEffect(() => {
    // no-op; pidetään catValue lähteenä tallennukselle
  }, [catValue]);

  // Lataa kategoriat
  useEffect(() => {
    (async () => {
      if (!baseURL) return;
      try {
        const res = await fetchWithTimeout(`${baseURL}/categories/`);
        const data = await res.json(); // [{id,name}]
        setCategoriesRaw(data);
        setCategories(
          data.map((it) => ({ label: it.name, value: String(it.id), key: `cat-${it.id}` }))
        );

        // jos odotettiin autoa, aseta
        if (pendingInitialCategory.current != null) {
          const asString = String(pendingInitialCategory.current);
          const exists = data.some((c) => String(c.id) === asString);
          if (exists) {
            setCatValue(asString);
            pendingInitialCategory.current = null;
          }
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
        Alert.alert("Network", "Failed to load categories.");
      }
    })();
  }, [baseURL]);

  // Lataa lokaatiot (manuaaliseen valintaan)
  useEffect(() => {
    (async () => {
      if (!baseURL) return;
      try {
        const res = await fetchWithTimeout(`${baseURL}/locations/`);
        const data = await res.json(); // [{id,name,...}]
        setLocations(
          data.map((l) => ({ label: l.name, value: String(l.id), key: `loc-${l.id}` }))
        );
      } catch (e) {
        console.error("Failed to load locations:", e);
        // ei pakollinen, käyttäjä voi jättää valitsematta
      }
    })();
  }, [baseURL]);

  // Kun kuva tunnistetaan backendissä, aseta nimi ja kategoria pickerissä
  const setAutoCategoryFromId = (detectedCategoryId) => {
    if (detectedCategoryId == null) {
      setCatValue(null);
      return;
    }
    const asString = String(detectedCategoryId);
    if (categoriesRaw.length === 0) {
      // lista ei vielä ladattu: odota
      pendingInitialCategory.current = asString;
    } else {
      const exists = categoriesRaw.some((c) => String(c.id) === asString);
      setCatValue(exists ? asString : null);
      pendingInitialCategory.current = exists ? null : asString;
    }
  };

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

  // Tallennetaan paikkaiseen SQLiteen (kotinäkymä käyttää tätä listaa)
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
          owner || "",
          locValue || null,                 // käyttäjän valitsema location id (string)
          selectedSize || "",
          Number(catValue) || 0,            // valittu kategoria
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
        <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={emptyItem}>CLEAR</Button>
        <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={saveItem}>SAVE</Button>
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
                onDone={({ newUri, nameofitem, hascategory }) => {
                  setUri(newUri);
                  setItemName(nameofitem);
                  setAutoCategoryFromId(hascategory); // ⬅️ valitsee pickeriin tunnistetun kategorian
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

      {/* Category dropdown */}
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

      {/* Location dropdown (manuaalinen valinta, voi jättää tyhjäksi) */}
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
  cameraimage: { width: "100%", height: "100%", resizeMode: "contain" },
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
    backgroundColor: '#EAF2EC',
    borderColor: '#52946B',
    borderWidth: 0,
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownContainer: { backgroundColor: "#F8FBFA", borderColor: "#52946B", borderWidth: 1 },
  dropdownText: { fontSize: 16, color: "#52946B" },
});