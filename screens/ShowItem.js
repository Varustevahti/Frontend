import React from "react";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import { useUser } from "@clerk/clerk-expo";
import DropDownPicker from 'react-native-dropdown-picker';
import { useItemsActions, useItemsData } from "../ItemContext";
import CategoryPicker from "../components/CategoryPicker";
import { baseURL } from '../config';
import dbTools from '../components/DbTools';


export default function ShowItem() {
    const { params } = useRoute();
    const thisitem = params?.item;
    const [backend_id, setBackend_id] = useState(null);
    const [itemName, setItemName] = useState("");
    const [selectedCategory_id, setSelectedCategory_id] = useState(0);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);
    const [size, setSize] = useState("");
    const [group_id, setGroup_id] = useState(1);
    const [price, setPrice] = useState(0.0);
    const [on_market_place, setOn_market_place] = useState(0);
    const [deleted, setDeleted] = useState(0);
    const { user } = useUser();
    const owner_id = user.id;
    const [timestamp, setTimestamp] = useState(null);
    const [items, setItems] = useState([]);
    const { categories } = useItemsData();
    const [itemFromBackend, setItemFromBackend] = useState();
    const frontend_id = thisitem.id;
    console.log(itemName, 'frontend id', thisitem.id, 'backend id', thisitem.backend_id);
    const db = useSQLiteContext();
    const tools = dbTools(db, user);
    const {
        getLocalItems,
        getLocalItem,
        getBackendItems,
        insertLocalItem,
        replaceLocalItem,
        deleteLocalItem,
        postBackendItem,
        putBackendItem,
        deleteBackendItem,
    } = tools;
    //   console.log('deleted',deleted);

    const navigation = useNavigation();



    useEffect(() => {
        if (thisitem) {
            setItemName(thisitem.name);
            setBackend_id(thisitem.backend_id);
            setSelectedCategory_id(thisitem.category_id);
            setLocation(thisitem.location);
            setDescription(thisitem.description);
            setSize(thisitem.size);
            setUri(thisitem.image);
            setOn_market_place(thisitem.on_market_place);
            setPrice(thisitem.price);
            setTimestamp(thisitem.timestamp);
            setDeleted(thisitem.deleted);
        }
    }, [thisitem]);

    const updateItemInfo = async () => {
        try {
            const itemFromDb = await getLocalItem(thisitem.id);
            if (!itemFromDb) return;
            setItemName(itemFromDb.name || "");
            setBackend_id(itemFromDb.backend_id || null);
            setSelectedCategory_id(itemFromDb.category_id || 0);
            setLocation(itemFromDb.location || "");
            setDescription(itemFromDb.description || "");
            setSize(itemFromDb.size || "");
            setUri(itemFromDb.image || "");
            setOn_market_place(itemFromDb.on_market_place || 0);
            setPrice(itemFromDb.price || 0);
            setTimestamp(itemFromDb.timestamp);
            setDeleted(itemFromDb.deleted || 0);
        } catch (error) {
            console.error('Could not get items', error);
        }

    }

    const deleteItem = async (id, action) => {
        try {
            // update locacally deleted = 1, meaning it is locally deleted, but not from backend, 
            // after deletion from backend deleted=2 and it can be deleted fully
            await db.runAsync('UPDATE myitems SET deleted = ? WHERE id=?', [action, id]);
            await updateItemInfo();
            navigation.goBack();
        }
        catch (error) {
            console.error('Could not delete item', error);
        }
    }

    const getTimeStamp = async () => {
        let now = new Date();
        const newtimestamp = now.toISOString().split('.')[0];
        console.log('newtimestamp', newtimestamp);
        return newtimestamp;
    }

    const saveItem = async () => {
        console.log('trying to save item', itemName);
        const aikaleima = await getTimeStamp();
        setTimestamp(aikaleima);
        // save on backend
        try {
            const item = {
                id: backend_id,
                name: itemName || "",
                location: location || "",
                desc: description || "",
                owner: owner_id,
                category_id: Number(selectedCategory_id) || 0,
                group_id: Number(group_id) || 0,
                size: size || "",
                on_market_place: on_market_place,
                price: price
            }
            const res = await putBackendItem(item);

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Upload failed ${res.status}: ${txt}`);
            } else {
                const data = await res.json();
                console.log("Item updated on backend");
                console.log("new timestamp??",data.timestamp);
                setTimestamp(data.timestamp);
                //             setTimestamp(aikaleima);
            }

        } catch (error) {
            console.log('backend update error', error);
        }
        //save on frontend server
        console.log("Saving item to frontend ");
        console.log('timestamp', timestamp);

        try {
            const item = {
                id: frontend_id,
                backend_id: backend_id,
                name: itemName || "",
                location: location || "",
                desc: description || "",
                owner: owner_id,
                category_id: Number(selectedCategory_id) || 0,
                group_id: Number(group_id) || 0,
                image: uri,
                size: size || "",
                timestamp,
                on_market_place: on_market_place,
                price: price,
                deleted: deleted,
            } 

            await replaceLocalItem(item);

            // await db.runAsync(
            //     `REPLACE INTO myitems 
            //                 (id, backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
            //                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            //     [
            //         frontend_id,
            //         backend_id,
            //         itemName,
            //         location,
            //         description,
            //         owner_id,
            //         selectedCategory_id,
            //         Number(group_id) || 0,
            //         uri,
            //         size,
            //         aikaleima,
            //         on_market_place,
            //         price,
            //         deleted,
            //     ]
            // );
            await updateItemInfo();
            Alert.alert("Saved item");
        } catch (error) {
            console.error('Could not add item', error);
        }
    }

    const confirmDelete = (itemid) => {
        Alert.alert(
            'Delete item',
            '',
            [
                {
                    text: 'No',
                    onPress: () => { console.log('Canceled / restore deleted'); deleteItem(itemid, 0); },
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => { console.log('Mark item deleted id', itemid); deleteItem(itemid, 1); },
                    style: 'destructive'
                }
            ],
            { cancelable: true }
        );
    };

    // useFocusEffect(
    //     React.useCallback(() => { updateItemInfo() }, [])
    // );

    const toggleMarketPlace = () => {
        setOn_market_place(prev => (prev === 0 ? 1 : 0));
    }


    return (
        <ScrollView
            style={{ backgroundColor: '#F8FBFA' }}
            bounces={false}
            overScrollMode="never"
            llyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.scrollContainer}
            maintainVisibleContentPosition={{ minIndexForVisible: 10, }}

        >
            <View style={styles.container}>
                <View style={styles.itembox}>
                    {uri ? (
                        <>
                            <Image source={{ uri: uri }} style={styles.cameraimage} />
                        </>
                    ) : null}
                </View>
                <TextInput
                    mode="flat"
                    dense
                    style={[styles.input]}
                    contentStyle={{ height: 35, fontSize: 15 }}
                    value={itemName}
                    label="name"
                    onChangeText={setItemName}
                />
                <TextInput
                    mode="flat"
                    style={[styles.inputdescription]}
                    multiline
                    contentStyle={{ height: 40, fontSize: 16 }}
                    value={description}
                    label="description"
                    onChangeText={text => setDescription(text)}
                />

                <View style={{ zIndex: 1000, width: '90%', marginVertical: 5 }}>
                    <CategoryPicker
                        category_id={selectedCategory_id}
                        setCategory_id={setSelectedCategory_id}
                    />
                </View>
                <TextInput
                    mode="flat"
                    style={[styles.input]}
                    value={location}
                    label="location"
                    onChangeText={text => setLocation(text)}
                />
                <TextInput
                    mode="flat"
                    style={[styles.input]}
                    value={size}
                    label="size"
                    onChangeText={text => setSize(text)}
                />


                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }} >
                    <Text style={styles.text} onPress={toggleMarketPlace} >On Market Place: {on_market_place ? "Yes" : "No"} </Text>
                    <TextInput
                        mode="flat"
                        style={[styles.input, { width: '40%' }]}
                        keyboardType="numeric"
                        value={price}
                        placeholder="price"
                        onChangeText={text => setPrice(parseInt(text))}
                    />
                </View>


                <Text style={styles.text}>Timestamp: {timestamp}</Text>
                <Text style={styles.text}>Deleted: {deleted}</Text>
                <View style={{ flexDirection: 'row' }} >
                    <Pressable
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? 'green' : 'lightgreen',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginVertical: 10,
                                shadowColor: '#000',
                                width: '30%',
                                alignSelf: 'center',
                                zIndex: 10,
                                position: 'relative',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            },
                        ]}
                        onPress={() => {
                            saveItem();
                        }}>
                        <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? 'darkred' : 'red',
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginVertical: 10,
                                shadowColor: '#000',
                                width: '30%',
                                alignSelf: 'center',
                                zIndex: 10,
                                position: 'relative',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                                marginLeft: 10,
                            },
                        ]}
                        onPress={() => {
                            confirmDelete(thisitem.id);
                        }}>
                        <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }} >Delete</Text>
                    </Pressable>
                </View>
            </View>

        </ScrollView>
    );
}
const styles = StyleSheet.create({
    button: {
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingRight: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    text: {
        color: "#52946B",
        fontSize: 15,
        padding: 5,
    },
    cameraimage: {
        aspectRatio: 1.5,
        height: '200',
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    itembox: {
        alignItems: 'center',
    },
    textinput: {
        width: '90%',
        fontSize: 15,
        backgroundColor: '#EAF2EC', // kevyt vihertävä tausta esim.
        color: '#52946B',
        marginVertical: 6,
        alignSelf: 'center',
    },
    input: {
        height: 45,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        marginVertical: 4,
        borderRadius: 5,
    },
    inputdescription: {
        height: 70,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',

        justifyContent: 'space-around',
        margin: 4,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        textAlignVertical: 'top',
    },
    dropdown: {
        backgroundColor: '#EAF2EC',
        borderColor: '#52946B',
        borderWidth: 0,
        borderRadius: 8,
        minHeight: 45,
    },
    dropdownContainer: {
        backgroundColor: '#F8FBFA',
        borderColor: '#52946B',
        borderWidth: 1,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 16,
        color: '#52946B',
    },
    dropdownPlaceholder: {
        color: '#777',
        fontStyle: 'italic',
    },
    dropdownItemContainer: {
        paddingVertical: 10,
    },
    dropdownItemLabel: {
        color: '#333',
        fontSize: 16,
    },
    dropdownSelectedItemLabel: {
        fontWeight: 'bold',
        color: '#52946B',
    },
    dropdownArrow: {
        tintColor: '#52946B',
    },
    dropdownTick: {
        tintColor: '#52946B',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingBottom: 220,

    },
});
