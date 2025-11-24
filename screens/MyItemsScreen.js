import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from "react-native-paper";
import { useItemsActions, useItemsData } from "../ItemContext";
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from "@clerk/clerk-expo";
import { baseURL } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import syncItems from "../components/SyncItems";
import dbTools from '../components/DbTools';
import { myItemStyles as styles } from "../styles/myItemStyles";

export default function MyItemsScreen() {
    const [items, setItems] = useState([]);
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const { categories } = useItemsData();
    const [locations, setLocations] = useState([]);
    const noimagesource = require('../assets/no_image.png');
    //   const [categories, setCategories] = useState([]);
    const { user } = useUser();
    const name = user.username || user.emailAddresses;
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const db = useSQLiteContext();
    const [recentItems, setRecentItems] = useState([]);
    const owner_id = user.id;
    const tools = dbTools(db, user);
    const {
        getLocalItems,
        getBackendItems,
        getLocalItemsNotDeleted,
        getLocalDeletedItems,
        getLocalRecentItemsNotDeleted,
        insertLocalItem,
        deleteLocalItem,
        getLocalLocations,
        postBackendItem,
        putBackendItem,
        deleteBackendItem,
    } = tools;


    const updateList = async () => {
        // look for items owned by this user from frontend sqlite
        try {
            console.log("Updating MyItemsScreen lists...");
            //           await db.runAsync(`UPDATE myitems SET IMAGE = 'uploads/' WHERE image IS NULL`);
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=?', [user.id]);
            setItems(list);
            //           console.log('items', items);
            console.log('loaded items from frontend SQLite');
            const recentlist = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=? ORDER BY timestamp DESC LIMIT 10', [user.id]);
            setRecentItems(recentlist);
            const locations = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
            const ulocations = (locations.map(item => item.location));
            const uniquelocations = [...new Set((locations.map(item => item.location)))];
            console.log(uniquelocations);
            setLocations(uniquelocations);
            //          console.log('recent', recentlist);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    useFocusEffect(
        React.useCallback(() => { updateList() }, [])
    );

    const updateSearchList = async (lookingfor) => {
        try {
            const term = `%${(lookingfor ?? '').trim()}%`;
            // Etsi useista sarakkeista: name, description, owner, location, size
            const query = `
      SELECT * FROM myitems
      WHERE owner=? AND (
            LOWER(name)        LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
         OR LOWER(owner)       LIKE LOWER(?)
         OR LOWER(location)    LIKE LOWER(?)
         OR LOWER(size)        LIKE LOWER(?)
        )
      ORDER BY id DESC
    `;
            const params = [owner_id, term, term, term, term, term];
            const list = await db.getAllAsync(query, params);
            setSearchItems(list);
            //           console.log('found on search:', searchItems);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    useEffect(() => {
        updateSearchList(lookingfor);
    }, [lookingfor]);


    useEffect(() => {
        //   updateList();
        const handleSync = async () => {
            const res = await syncItems(db, user);
            if (!res.ok) {
                Alert.alert('Sync failed', res.errors.join('\n'));
                return;
            }
            if (res.errors.length) {
                Alert.alert('Sync partial', res.errors.join('\n'));
            } else {
                console.log('Sync complete', 'All good.');
            }
        };
        const updateItems = async () => {
            await updateList();
        }
        handleSync();
        updateItems();
    }, []);

    return (

        <View style={styles.container}>
            {/* 🔍 Search */}
            <TextInput
                style={styles.input}
                placeholder="Search"
                placeholderTextColor="#52946B"
                onChangeText={setLookingfor}
                value={lookingfor}
            />

            {/* Jos ei haeta → näytetään lohkot */}
            {!lookingfor ? (
                <>
                    <ScrollView
                        style={{ backgroundColor: "#F8FBFA" }}
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={styles.scrollContainer}
                    >

                        {/* 🕓 Recent Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Items</Text>
                            <FlatList
                                keyExtractor={(item) => item.id.toString()}
                                data={recentItems}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalListContent}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItem", { item })}
                                        style={styles.itembox}
                                    >
                                        {item.image !== "" ? (
                                            <>
                                                <Image source={{ uri: item.image }} style={styles.showimage} />
                                            </>
                                        ) : <Image source={noimagesource} style={styles.showimage} />}

                                        <Text style={styles.itemTitle}>{item.name.slice(0, 12)}</Text>
                                        {categories?.length > 0 && (
                                            <Text style={styles.itemCategory}>
                                                {categories.find(
                                                    (cat) => cat.value == String(item.category_id)
                                                )?.label || ""}
                                            </Text>

                                        )}
                                    </Pressable>
                                )}
                            />
                        </View>


                        {/* 📍 My Locations */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.navigate("MyLocationsScreen", {})}
                            >
                                <Text style={styles.sectionTitle}>My Locations</Text>
                                <FlatList
                                    keyExtractor={(item, index) => (item?.value ?? item.key ?? item ?? index).toString()}
                                    data={locations}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.horizontalListContent}
                                    renderItem={({ item }) => (
                                        <View style={styles.itemboxrow}>
                                            <Button
                                                mode="text"
                                                buttonColor="#EAF2EC"
                                                textColor="#52946B"
                                                style={styles.categoryButton}
                                                contentStyle={styles.categoryContent}
                                                labelStyle={styles.categoryLabel}
                                                onPress={() =>
                                                    navigation.navigate("ShowLocation", { location: item })
                                                }
                                            >
                                                {item}
                                            </Button>
                                        </View>
                                    )}
                                />
                            </Pressable>
                        </View>

                        {/* 🗂️ My Categories */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>My Categories</Text>
                            <FlatList
                                keyExtractor={(item, index) => (item?.value ?? item?.key ?? index).toString()}
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalListContent}
                                renderItem={({ item }) => (
                                    <View style={styles.itemboxrow}>
                                        <Button
                                            mode="text"
                                            buttonColor="#EAF2EC"
                                            textColor="#52946B"
                                            style={styles.categoryButton}
                                            contentStyle={styles.categoryContent}
                                            labelStyle={styles.categoryLabel}
                                            onPress={() =>
                                                navigation.navigate("ShowCategory", { category: item })
                                            }
                                        >
                                            {item.label}
                                        </Button>
                                    </View>
                                )}
                            />
                        </View>


                        {/* 🏠 My Items */}
                        <View style={styles.section}>
                            <Pressable
                                onPress={() => navigation.getParent()?.navigate("ShowMyItemsScreen")}
                            >
                                <Text style={styles.sectionTitle}>My Items</Text>

                            </Pressable>
                            <FlatList
                                keyExtractor={(item) => item.id.toString()}
                                data={items}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalListContent}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItem", { item })}
                                        style={styles.itembox}
                                    >
                                        {item.image !== "" ? (
                                            <>
                                                <Image source={{ uri: item.image }} style={styles.showimage} />
                                            </>
                                        ) : <Image source={noimagesource} style={styles.showimage} />}
                                        <Text style={styles.itemTitle}>{item.name.slice(0, 12)}</Text>
                                        {categories?.length > 0 && (
                                            <Text style={styles.itemCategory}>
                                                {categories.find(
                                                    (cat) => cat.value == String(item.category_id)
                                                )?.label || ""}
                                            </Text>

                                        )}
                                    </Pressable>
                                )}
                            />
                        </View>



                    </ScrollView>
                </>
            ) : (
                // 🔍 Hakutulos
                <FlatList
                    keyExtractor={(item) => item.id.toString()}
                    data={searchItems}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => navigation.navigate("ShowItem", { item })}
                            style={styles.itemboxrow}
                        >
                            <Image source={{ uri: item.image }} style={styles.cameraimage} />
                            <Text style={styles.itemTitle}>{item.name}</Text>
                        </Pressable>
                    )}
                />
            )}
        </View>

    );
}