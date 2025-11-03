import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import { useUser } from "@clerk/clerk-expo";
import DropDownPicker from 'react-native-dropdown-picker';
import { useItemsActions, useItemsData } from "../ItemContext";
import CategoryPicker from "../components/CategoryPicker";
import SaveItemFrontend from "../components/SaveItemFrontend";
import { baseURL } from '../config';


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
    const [visible, setVisible] = useState(false);
    const [selectedSize, setSelectedSize] = useState('Medium');
    const [group_id, setGroup_id] = useState(1);
    const [categoriesFront, setCategoriesFront] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [loading, setLoading] = useState(false);
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
    console.log(itemName, 'frontend id', frontend_id, 'backend id', backend_id);
    //   console.log('deleted',deleted);


    const [isEditing, setIsEditing] = useState(false);

    const navigation = useNavigation();

    const db = useSQLiteContext();

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
            const list = await db.getAllAsync('SELECT * from myitems WHERE id = ?', [frontend_id]);
            const itemFromDb = list?.[0];
            setItemName(itemFromDb.name);
            setBackend_id(itemFromDb.backend_id);
            setSelectedCategory_id(itemFromDb.category_id);
            setLocation(itemFromDb.location);
            setDescription(itemFromDb.description);
            setSize(itemFromDb.size);
            setUri(itemFromDb.image);
            setOn_market_place(itemFromDb.on_market_place);
            setPrice(itemFromDb.price);
            setTimestamp(itemFromDb.timestamp);
            setDeleted(itemFromDb.deleted);
        } catch (error) {
            console.error('Could not get items', error);
        }

    }

    const deleteItem = async (id) => {
        try {
            // update locacally deleted = 1, meaning it is locally deleted, but not from backend, 
            // after deletion from backend deleted=2 and it can be deleted fully
            await db.runAsync('UPDATE myitems SET deleted = ? WHERE id=?', [1, id]);
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
        // get item info from backend - we need to check there is not a newer item in backend before we give timestamp new value

        /* this is on hold, until we get GET items/{item_id} endpoint
        try {
            const rows = await db.getAllAsync('SELECT * from myitems WHERE id==?', [backend_id]);
            const itemFromDb = rows?.[0];
            setItemFromBackend(itemFromDb);
            if (itemFromBackend === undefined) {
                console.log('Item not yet in backend')
            } else {
                console.log('got item from backend', itemFromDb);
            }
        } catch (error) {
            console.error('Could not get items', error);
        }

        // check if item our timestamp is newer than the one in backend

        console.log('timestamps', aikaleima, itemFromBackend)
        if (itemFromBackend.timestamp === undefined) {
            // item not found in backend -> save item into backend
            console.log('item not found in backend -> saving item to backend')


        }
            */

        //     if (aikaleima >= itemFromBackend.timestamp || itemFromBackend === undefined) {
        setTimestamp(aikaleima);
        // save on backend
        try {
            console.log("Updating existing item to backend with id:", backend_id ? backend_id : "new item");
            let integeritemid = parseInt(backend_id, 10);
            console.log("Parsed item id:", integeritemid);
            console.log("Item details:", { itemName, location, description, owner_id, category_id, group_id, size, on_market_place, price });
            const payload = {
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
            const res = await fetch(`${baseURL}/items/${integeritemid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Upload failed ${res.status}: ${txt}`);
            } else {
                const data = await res.json();
                console.log("Item updated on backend");
   //             setTimestamp(aikaleima);
            }

        } catch (error) {
            console.log('backend update error', error);
        }
        //save on frontend server
        console.log("Saving item to frontend ");
        console.log('timestamp', timestamp);

        try {
            await db.runAsync(
                `REPLACE INTO myitems 
                            (id, backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    frontend_id,
                    backend_id,
                    itemName,
                    location,
                    description,
                    owner_id,
                    selectedCategory_id,
                    Number(group_id) || 0,
                    uri,
                    size,
                    aikaleima,
                    on_market_place,
                    price,
                    deleted,
                ]
            );
            await updateItemInfo();
            Alert.alert("Saved item");
        } catch (error) {
            console.error('Could not add item', error);
        }



        //     }

    }

    const confirmDelete = (itemid) => {
        Alert.alert(
            'Delete item',
            '',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Canceled'),
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => { console.log('Delete id', itemid); deleteItem(itemid); },
                    style: 'destructive'
                }
            ],
            { cancelable: true }
        );
    };

    useFocusEffect(
        React.useCallback(() => { updateItemInfo() }, [])
    );

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
