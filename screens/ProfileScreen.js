import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert } from "react-native";
import { Button } from "react-native-paper";
import { FileSystem } from 'expo-file-system';
import { useFocusEffect } from "@react-navigation/native";
import { baseURL } from '../config';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from "@clerk/clerk-expo";
import { useItemsData } from "../ItemContext";
import syncItems from "../components/SyncItems";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const [delItems, setDelItems] = useState([]);
  const { categories } = useItemsData();
  const { user } = useUser();
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const updateDeleteItems = useCallback(async () => {
    try {
      const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner=?', [user.id]);
      setDelItems(list);
      console.log('at start/push loaded items from frontend SQLite. Local items to be deleted ', list.length);
    } catch (error) {
      console.error('Could not get items', error);
    }
  }, [db, user.id]);

  const hasLoadedRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;
      updateDeleteItems()
    }, [updateDeleteItems])
  );

  const clearLocalDatabaseFromDeleted = async () => {
    console.log("Yritetään poistaa tietokannasta deleted...");
    let count = 0;
    try {
      const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner=?', [user.id]);
      const rows = await db.getAllAsync('SELECT COUNT(*) AS count FROM myitems WHERE deleted=1 AND owner=?', [user.id]);
      setDelItems(list);
      const maara = rows[0].count;
      console.log('loaded items from frontend SQLite. Items to be deleted', maara);
    } catch (error) {
      delItems
      console.error('Could not get items', error);
    }
    try {
      const list = await db.runAsync('DELETE FROM myitems WHERE deleted=1 AND owner=?', [user.id]);
      setDelItems(list);
      let newcount = count - (list.lenght);
      console.log('loaded items from frontend SQLite. Items to be deleted', newcount);
    } catch (error) {
      console.error('Could not get items', error);
    }
    updateDeleteItems();
  };

  const updateDatabases = async () => {
    console.log('updating dbs..');
    const handleSync = async () => {
      const res = await syncItems(db, user);
      if (!res.ok) {
        Alert.alert('Sync failed', res.errors.join('\n'));
        return;
      } else Alert.alert('Sync complete', 'All good.');
      if (res.errors.length) {
        Alert.alert('Sync partial', res.errors.join('\n'));
      } else {
        Alert.alert('Sync complete', 'All good.');
      }
    };
    handleSync();
  }


  return (
    <View style={styles.container}>
      <Button onPress={updateDatabases} mode="contained" style={styles.camerabutton}>
        <Text style={styles.camerabuttontext}>update databases</Text>
      </Button>
      <Button onPress={(() => navigation.navigate("MyMarketItemsScreen"))} mode="contained" style={styles.camerabutton}>
        <Text style={[styles.camerabuttontext,{marginBottom: 80}]}>My Items on market</Text></Button>
      <Text style={[styles.text, { margin: 10, marginTop: 30 }]} onPress={updateDeleteItems}>Local Trash</Text>
      <Button onPress={clearLocalDatabaseFromDeleted} mode="contained" style={styles.camerabutton} >
        <Text style={styles.camerabuttontext}>Delete item on local trach</Text>
      </Button>
      {!delItems ? (
        <FlatList
          keyExtractor={item => item.id.toString()}
          data={delItems}
          bounces={false}
          renderItem={({ item }) =>
            <View style={styles.itemboxrow}>
              <Image source={{ uri: item.image }} style={styles.showimage} />
              <Text style={{ fontSize: 13, fontWeight: "bold", color: '#0D1A12' }}>{item.name} </Text>
              {categories?.length > 0 && (<Text style={{ fontSize: 13, color: '#52946B' }}>
                {categories.find(cat => cat.value == String(item.category_id))?.label || ''}
                -  {item.deleted}
              </Text>)}
            </View>
          }
        />
      ) : (
        <>
          <View>
            <Text style={styles.text}>No local deleted items</Text>
          </View>
        </>


      )}


    </View>


  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  showimage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 7,
    zIndex: 0,
  },
  text: {
    color: "#52946B",
    fontSize: 18,
  },
  buttonProfile: {
    backgroundColor: '#52946B',
    marginBottom: 10,
  },
  camerabutton: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
    padding: 5,
    marginTop: 0,
    marginBottom: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,

  },
  camerabuttontext: {
    backgroundColor: '#EAF2EC',
    color: '#52946B',
    fontWeight: 'bold',
    padding: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
