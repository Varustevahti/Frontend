import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Pressable, TextInput } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button } from "react-native-paper";
import { useSQLiteContext } from 'expo-sqlite';
import Constants from "expo-constants";
import * as SQLite from 'expo-sqlite';
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";

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

export default function MyItemsScreen() {
  const [items, setItems] = useState([]);
  const [lookingfor, setLookingfor] = useState('');
  const [searchItems, setSearchItems] = useState([]);

  const [categoriesRaw, setCategoriesRaw] = useState([]); // [{id, name}]
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const baseURL = resolveBaseURL();
  const userId = (globalThis).__clerkUserId || "";

  // Lataa kategoriat taulukoksi nimen hakua varten
  useEffect(() => {
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

    const {user} = useUser();
    const name = user.username || user.emailAddresses;

    useEffect(() => {
        Toast.show ({ type: 'success', text1: `Welcome to Varustevahti, ${name}`});
    });



  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from myitems ORDER BY id DESC');
      setItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  const updateSearchList = async (termRaw) => {
    try {
      const term = `%${(termRaw ?? '').trim()}%`;
      const query = `
        SELECT * FROM myitems
        WHERE LOWER(name)        LIKE LOWER(?)
           OR LOWER(description) LIKE LOWER(?)
           OR LOWER(owner)       LIKE LOWER(?)
           OR LOWER(location)    LIKE LOWER(?)
           OR LOWER(size)        LIKE LOWER(?)
        ORDER BY id DESC
      `;
      const params = [userId, term, term, term, term];
      const list = await db.getAllAsync(query, params);
      setSearchItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => { updateList(); }, [])
  );

  const renderRow = ({ item }) => {
    const categoryName = getCategoryNameById(item.category_id, categoriesRaw);
    const displayName = item.name ?? "(no name)";
    return (
      <View style={styles.itembox}>
        <Pressable onPress={() => navigation.navigate('ShowItem', { item })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!item.image && <Image source={{ uri: item.image }} style={styles.cameraimage} />}
            <View>
              <Text style={{ fontSize: 20, color: '#52946B' }}>{displayName}</Text>
              {categoryName ? (
                <Text style={{ fontSize: 14, color: '#0D1A12' }}>Category: {categoryName}</Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E5EAEA' }}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='search'
          placeholderTextColor="#52946B"
          onChangeText={setLookingfor}
          value={lookingfor}
        />
        <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={() => updateSearchList(lookingfor)}>SEARCH</Button>
        <View>
          {!lookingfor ? (
            <FlatList
              keyExtractor={item => item.id.toString()}
              data={items}
              bounces={false}
              overScrollMode="never"
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={renderRow}
            />
          ) : (
            <FlatList
              keyExtractor={item => item.id.toString()}
              data={searchItems}
              bounces={false}
              overScrollMode="never"
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={renderRow}
            />
          )}
        </View>
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
    paddingTop: 15,
  },
  cameraimage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 7,
    marginRight: 10,
  },
  itembox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    padding: 3,
    borderWidth: 0,
  },
  input: {
    height: 40,
    backgroundColor: '#EAF2EC',
    borderWidth: 0,
    paddingHorizontal: 10,
    color: '#52946B',
    width: '75%',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 10,
    marginTop: 80,
    borderRadius: 5,
  },
});