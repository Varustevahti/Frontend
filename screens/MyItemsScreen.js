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

export default function MyItemsScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const { categories } = useItemsData();
    const [deletableList, setDeletableList] = useState([]);
    //   const [categories, setCategories] = useState([]);
    const { user } = useUser();
    const name = user.username || user.emailAddresses;
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const db = useSQLiteContext();


    const updateList = async () => {
        // look for items owned by this user from frontend sqlite
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner==?', [user.id]);
            setItems(list);
            console.log('loaded items from frontend SQLite');
        } catch (error) {
            console.error('Could not get items', error);
        }

        // check if deleted items are on fronend sqlite and delete them fully from backend and frontend

        const getrows = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner==?', [user.id]);
        console.log('deltable items !!!!!', getrows.lenght);
        //       console.log('deletable items:', getrows.length);
        // start deleting process if there are deletable items
        if (getrows.length > 0) {
            console.log('found ', getrows.length, 'deletable items');
            // fetch backend items to compare timestamps
            let checkdeleteitem = null;

            // loop through deletable items and compare timestamps
            for (const itemdel of getrows) {
                if (!itemdel.backend_id) {
                    console.warn('Skip items without backend_id:', itemdel.id);
                    continue;
                }
                console.log('checking deletable item front id:', itemdel.id, 'back id', itemdel.backend_id);
                deleteItemBackendFrontend(itemdel.id, itemdel.backend_id);
            }
        }
    }


    const deleteItemBackendFrontend = async (itemdel_id, itemdelbackend_id) => {
        //       console.log('Deleting item fully from backend sqlite with id:', itemdelid, ' using backend id:', itemdelbackend_id);
        console.log(' !!!!! dlelete started !!!!!!');
        try {
            const res = await fetch(`${baseURL}/items/${itemdelbackend_id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await db.runAsync('DELETE FROM myitems WHERE id=? AND owner=?', [itemdel_id, user.id]);
                console.log('deleted both backend and frontend', itemdel_id);
            } else {
                const txt = await res.text().catch(() => '');
                console.warn('Backend delete failed, not touching local', res.status, txt);
            }
        } catch (error) {
            console.log('error deletin item', error);
        }
    }

    const updateSearchList = async (lookingfor) => {
        try {
            const term = `%${(lookingfor ?? '').trim()}%`;

            // Etsi useista sarakkeista: name, description, owner, location, size
            const query = `
      SELECT * FROM myitems
      WHERE LOWER(name)        LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
         OR LOWER(owner)       LIKE LOWER(?)
         OR LOWER(location)    LIKE LOWER(?)
         OR LOWER(size)        LIKE LOWER(?)
      ORDER BY id DESC
    `;
            const params = [term, term, term, term, term];

            const list = await db.getAllAsync(query, params);
            setSearchItems(list);
            console.log('found on search:', searchItems);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const deleteItem = async (id) => {
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=?', id);
            await updateList();
        }
        catch (error) {
            console.error('Could not delete item', error);
        }
    }

    useFocusEffect(
        React.useCallback(() => { updateList() }, [])
    );



    return (
        <ScrollView
            style={{ backgroundColor: '#F8FBFA' }}
            bounces={false}
            overScrollMode="never"
            llyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.scrollContainer}
            maintainVisibleContentPosition={{ minIndexForVisible: 10, }}
        >

            <View style={[styles.container, { paddingTop: insets.top }]}>
                <TextInput
                    style={styles.input}
                    placeholder='search'
                    placeholderTextColor="#52946B"
                    onChangeText={lookingfor => setLookingfor(lookingfor)}
                    value={lookingfor}
                />
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={() => updateSearchList(lookingfor)}>SEARCH</Button>
                <View style={{ height: 200 }}>
                    {!lookingfor ? (
                        <>
                            <View style={styles.rowofitems} >
                                <Text style={{ fontSize: 22, fontWeight: "bold", color: '#0D1A12', marginTop: 10, marginBottom: 10 }}>My items</Text>
                                <FlatList
                                    keyExtractor={item => item.id.toString()}
                                    data={items}
                                    bounces={false}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    overScrollMode="never"
                                    contentInsetAdjustmentBehavior="never"
                                    contentContainerStyle={{ paddingBottom: 80 }}
                                    renderItem={({ item }) =>
                                        <View style={styles.itemboxrow}>
                                            <Pressable
                                                onPress={() => {
                                                    navigation.navigate('ShowItem', { item });
                                                }}
                                            >
                                                <View style={{ alignItems: 'Left' }}>
                                                    <Image source={{ uri: item.image }} style={styles.showimage} />
                                                    <Text style={{ fontSize: 13, fontWeight: "bold", color: '#0D1A12' }}>{item.name} </Text>
                                                    {categories?.length > 0 && (<Text style={{ fontSize: 13, color: '#52946B' }}>
                                                        {categories.find(cat => cat.value == String(item.category_id))?.label || ''}

                                                    </Text>)}
                                                </View>
                                            </Pressable>
                                        </View>
                                    }
                                />
                            </View>
                            <Text style={{ fontSize: 22, fontWeight: "bold", color: '#0D1A12', marginTop: 20, marginBottom: 10 }}>My Locations</Text>
                            {/* My categories */}
                            <View style={{ height: 200, marginLeft: 20 }}>
                                <Text style={{ fontSize: 22, fontWeight: "bold", color: '#0D1A12', marginTop: 20, marginBottom: 10 }}>My Categories</Text>
                                <FlatList
                                    keyExtractor={item => item.value?.toString() || item.key}
                                    data={categories}
                                    bounces={false}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    overScrollMode="never"
                                    contentInsetAdjustmentBehavior="never"
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                    renderItem={({ item }) =>
                                        <View style={styles.itemboxrow}>
                                            <Button
                                                mode="text" buttonColor="#EAF2EC" textColor="#52946B"
                                                contentStyle={{
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    maxHeight: "40"
                                                }}
                                                onPress={() => navigation.navigate('ShowCategory', { category: item })}>
                                                {item.label}</Button>

                                        </View>
                                    }
                                />
                            </View>

                            {/* Recent Items */}
                            <View style={{ height: 200, marginLeft: 20 }}>
                                <Text style={{ fontSize: 22, fontWeight: "bold", color: '#0D1A12', marginTop: 20, marginBottom: 10 }}>Recent items</Text>
                                <FlatList
                                    keyExtractor={item => item.value?.toString() || item.key}
                                    data={categories}
                                    bounces={false}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    overScrollMode="never"
                                    contentInsetAdjustmentBehavior="never"
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                    renderItem={({ item }) =>
                                        <View style={styles.itemboxrow}>
                                            <Button
                                                mode="text" buttonColor="#EAF2EC" textColor="#52946B"
                                                contentStyle={{
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    maxHeight: "40"
                                                }}
                                                onPress={() => navigation.navigate('ShowCategory', { category: item })}>
                                                {item.label}</Button>

                                        </View>
                                    }
                                />
                            </View>
                        </>
                    ) : (
                        <FlatList
                            keyExtractor={item => item.id.toString()}
                            data={searchItems}
                            bounces={false}
                            horizontal={false}
                            overScrollMode="never"
                            contentInsetAdjustmentBehavior="never"
                            contentContainerStyle={{ paddingBottom: 80 }}
                            renderItem={({ item }) =>
                                <View style={styles.itembox}>
                                    <Pressable
                                        onPress={() => {
                                            navigation.navigate('ShowItem', { item });
                                        }}
                                    ><View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={{ uri: item.image }} style={styles.cameraimage} />
                                            <Text style={{ fontSize: 13, color: '#52946B' }}>{String(item.name ?? '')} </Text>
                                        </View>
                                    </Pressable>
                                </View>
                            }
                        />
                    )}
                </View>






            </View>


        </ScrollView>
    );
}
const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingBottom: 220,

    },
    container: {
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 0,
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    rowofitems: {
        justifyContent: 'flex-start',
        paddingLeft: 20,
    },
    cameraimage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
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
    line: {
        height: 1,
        width: '100%',
        backgroundColor: 'grey',
        paddingTop: 2,
    },
    itembox: {
        alignItems: 'center',
        padding: 3,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',
    },
    itemboxrow: {
        flexDirection: 'row',
        padding: 3,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',
    },
    input: {
        height: 40,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 10,
        marginTop: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
});
