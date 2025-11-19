import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from "react-native-paper";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useItemsActions, useItemsData } from "../ItemContext";
import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { useUser } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { baseURL } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import syncItems from "../components/SyncItems";
import dbTools from '../components/DbTools';

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
            await db.runAsync(`UPDATE myitems SET IMAGE = 'uploads/' WHERE image IS NULL`);
            const list = await getLocalItemsNotDeleted();
            setItems(list);
            console.log('loaded items from frontend SQLite');
            const recentlist = await getLocalRecentItemsNotDeleted();
            setRecentItems(recentlist);
            const uniquelocations = await getLocalLocations();
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
            console.log('found on search:', searchItems);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    useEffect(() => {
        updateSearchList(lookingfor);
    }, [lookingfor]);


    useEffect(() => {
        //   updateList();
        syncItems(db, user);
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
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItem", { item })}
                                        style={styles.itembox}
                                    >
                                        {!item.image.includes("uploads/") ? (
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

                        {/* 🗂️ My Categories */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>My Categories</Text>
                            <FlatList
                                keyExtractor={(item) => item.value?.toString() || item.key}
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
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


                        {/* 🕓 Recent Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Items</Text>
                            <FlatList
                                keyExtractor={(item) => item.id.toString()}
                                data={recentItems}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => navigation.navigate("ShowItem", { item })}
                                        style={styles.itembox}
                                    >
                                        {!item.image.includes("uploads/") ? (
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
                                onPress={() => navigation.navigate("LocationScreen", {})}
                            >
                                <Text style={styles.sectionTitle}>My Locations</Text>
                                <FlatList
                                    keyExtractor={(item) => item.value?.toString() || item.key}
                                    data={locations}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
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
                                                    navigation.navigate("LocationScreen", { item })
                                                }
                                            >
                                                {item}
                                            </Button>
                                        </View>
                                    )}
                                />
                            </Pressable>
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

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 120,
        backgroundColor: "#F8FBFA",
    },
    container: {
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 10,
        backgroundColor: "#F8FBFA",
    },
    section: {
        alignSelf: "stretch",
        marginLeft: 20,
        marginBottom: 10,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#0D1A12",
        marginBottom: 10,
    },
    input: {
        height: 40,
        backgroundColor: "#EAF2EC",
        borderWidth: 0,
        paddingHorizontal: 10,
        color: "#52946B",
        width: "90%",
        borderRadius: 5,
        margin: 10,
    },
    showimage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginRight: 10,
    },
    cameraimage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 10,
    },
    itemboxrow: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#0D1A12",
    },
    itemCategory: {
        fontSize: 13,
        color: "#52946B",
        marginLeft: 4,
    },
    categoryButton: {
        height: 40,
        borderRadius: 8,
        marginRight: 6,
    },
    categoryContent: {
        height: 40,
        paddingVertical: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryLabel: {
        fontSize: 14,
        lineHeight: 18,
    },
});