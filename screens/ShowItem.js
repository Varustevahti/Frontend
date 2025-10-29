import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Constants from "expo-constants";

// baseURL + timeout
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

function getCategoryNameById(id, categoriesRaw) {
  if (id == null) return "";
  const match = categoriesRaw.find((c) => c.id === Number(id));
  return match ? match.name : "";
}

export default function ShowItem() {
  const { params } = useRoute();
  const thisitem = params?.item;
  const [items, setItems] = useState([]);
  const [categoriesRaw, setCategoriesRaw] = useState([]);
  const navigation = useNavigation();

  const db = useSQLiteContext();
  const baseURL = resolveBaseURL();

  // Lataa kategoriat nimen näyttöä varten
  React.useEffect(() => {
    (async () => {
      if (!baseURL) return;
      try {
        const res = await fetchWithTimeout(`${baseURL}/categories/`);
        const data = await res.json(); // [{id,name}]
        setCategoriesRaw(data);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    })();
  }, [baseURL]);

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from myitems ORDER BY id DESC');
      setItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await db.runAsync('DELETE FROM myitems WHERE id=?', id);
      await updateList();
      navigation.goBack();
    } catch (error) {
      console.error('Could not delete item', error);
      Alert.alert("Error", "Could not delete item.");
    }
  };

  const confirmDelete = (itemid) => {
    Alert.alert(
      'Delete item permanently',
      '',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => deleteItem(itemid), style: 'destructive' }
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(React.useCallback(() => { updateList(); }, []));

  const categoryName = getCategoryNameById(thisitem?.category_id, categoriesRaw);
  const displayName = thisitem?.name ?? "(no name)";

  return (
    <View style={styles.container}>
      <View style={styles.itembox}>
        {thisitem?.image ? (
          <Image source={{ uri: thisitem.image }} style={styles.cameraimage} />
        ) : null}
        <Text style={[styles.text, { fontSize: 24 }]}>{displayName}</Text>

        {thisitem?.description ? (
          <Text style={[styles.text, { fontSize: 18 }]}>{thisitem.description}</Text>
        ) : (
          <Text style={{ fontSize: 15, padding: 10 }}>no description</Text>
        )}

        {!!categoryName && (
          <Text style={styles.text}>Category: {categoryName}</Text>
        )}

        <Text
          style={{ color: '#ff0000', paddingTop: 10, fontSize: 20 }}
          onPress={() => confirmDelete(thisitem.id)}
        >
          Delete
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: "#52946B",
    fontSize: 20,
    padding: 5,
  },
  cameraimage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 5,
    marginRight: 10,
  },
  itembox: {
    alignItems: 'center',
  },
});