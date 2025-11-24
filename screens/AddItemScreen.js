import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Image, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Button } from 'react-native-paper';
import TakePhotoQuick from "./TakePhotoQuick";
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from "@clerk/clerk-expo";
import { baseURL } from '../config';
import CategoryPicker from "../components/CategoryPicker";
import LocationPicker from "../components/LocationPicker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { addItemStyles as styles } from "../styles/addItemStyle";

export default function AddItemScreen() {
    const [backend_id, setBackend_id] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category_id, setCategory_id] = useState(0);
    const [location, setLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);
    const [size, setSize] = useState("");
    const [group_id, setGroup_id] = useState(1);
    const [items, setItems] = useState([]);
    const [price, setPrice] = useState(0.0);
    const [on_market_place, setOn_market_place] = useState(0);
    const [deleted, setDeleted] = useState(0);
    const { user } = useUser();
    const owner_id = user.id;
    const [timestamp, setTimestamp] = useState(null)
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();

    const emptyItem = async () => {
        setItemName("");
        setUri(null);
        setDescription("");
        setSize("");
        setLocation("");
        setBackend_id(null);
        setTimestamp("");
        updateLocations();
    }

    const updateLocations = async () => {
        try {
            const locations = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
            const uniquelocations = [...new Set((locations.map(item => item.location)))];
            const formattedlocations = uniquelocations.map((loc) => ({
                label: loc, value: loc,
            }));
            console.log(formattedlocations);
            setLocations(formattedlocations);
        } catch (error) {
            console.error('Could not get locations', error);
        }
    }

    useEffect(() => {
            const getLocations = async () => {
        await updateLocations();
    }
        getLocations();
    }, []);

    const deleteIncompleteItem = async () => {
        // if item has been identified ithas backend_id and we need to delete it from backend
        if (backend_id) {
            try {
                console.log("Deleting incomplete item from backend with id:", backend_id, itemName);
                let integeritemid = parseInt(backend_id, 10);
                const res = await fetch(`${baseURL}/items/${integeritemid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) {
                    const txt = await res.text().catch(() => '');
                    throw new Error(`Delete failed ${res.status}: ${txt}`);
                } else {
                    console.log("Incomplete item deleted from backend");
                }
            } catch (error) {
                console.error('Could not delete incomplete item', error);
            }
        }
        emptyItem();
    }

    const updateList = async () => {
        try {
            const list = await db.getAllAsync('SELECT * FROM myitems ORDER BY id ASC');
            //            console.log("Items in database:", list);
            setItems(list);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const saveItem = async () => {
        //save on backend server
        console.log("Saving item to backend server");
        let aikaleima = "";
        try {
            console.log("Updating existing item to backend with id:", backend_id ? backend_id : "new item");
            let integeritemid = parseInt(backend_id, 10);
            console.log("Parsed item id:", integeritemid);
            console.log("Item details:", { itemName, location, description, owner_id, category_id, group_id, size });
            const payload = {
                name: itemName,
                location: location,
                desc: description,
                owner: owner_id,
                category_id: Number(category_id) || 0,
                group_id: Number(group_id) || 0,
                size: size,
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
                aikaleima = data.timestamp;
                setTimestamp(aikaleima);
            }
        } catch (error) {
            console.error('Could not save item to backend', error);
        }

        // save item into frontend
        try {
            await db.runAsync(
                `INSERT INTO myitems 
        (backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    backend_id,
                    itemName,
                    location,
                    description,
                    owner_id,
                    category_id,
                    Number(group_id) || 0,
                    uri,
                    size,
                    timestamp,
                    on_market_place,
                    price,
                    deleted,
                ]
            );
            await updateList();
            Alert.alert("Saved item");
            emptyItem();
        } catch (error) {
            console.error('Could not add item into frontend', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10, paddingTop: 0, marginTop: -10, paddingBottom: 5, }}>
                <Button mode="contained" style={[styles.camerabutton, { borderRadius: 10, margin: 5 }]} buttonColor="#EAF2EC" textColor="#52946B" onPress={deleteIncompleteItem}>
                    <Text style={styles.camerabuttontext}>CLEAR</Text></Button>
                <Button mode="contained" style={[styles.camerabutton, { borderRadius: 10, margin: 5 }]} buttonColor="#EAF2EC" textColor="#52946B" onPress={saveItem}>
                    <Text style={styles.camerabuttontext}>SAVE</Text></Button>
            </View>


            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
            >
                <ScrollView
                    style={{ flex: 1, backgroundColor: '#F8FBFA', margin: 0, padding: 0, }}
                    bounces={false}
                    overScrollMode="never"
                    contentContainerStyle={styles.scrollContaineradditem}
                >
                    <View style={styles.innerContainer}>

                        <View style={[styles.cameraview, { flexDirection: 'column', width: '60%', }]}>

                            {uri ? (
                                <Image source={{ uri }} style={styles.cameraimage} />
                            ) : (
                                <>
                                    <View style={{ alignItems: "center", padding: 8 }}>
                                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add Image</Text>
                                        <Text style={{ textAlign: "center" }}>
                                            Take a photo or select from gallery
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                        <View style={{ marginTop: 0, flexDirection: "row", gap: 10, marginBottom: 0, }}>
                            {/* first button - change or add image */}
                            <TakePhotoQuick
                                label={uri ? "Change Image" : "Add Image"}
                                mode="addimage"
                                onDone={({ newUri, nameofitem, hascategory, hasdescription, haslocation, hassize, hasowner_id, hastimestamp, hasitemid }) => {
                                    setUri(newUri);
                                    setItemName(nameofitem);
                                    setCategory_id(hascategory);
                                    setDescription(hasdescription);
                                    setLocation(haslocation);
                                    setSize(hassize);
                                    setTimestamp(hastimestamp);
                                    setBackend_id(hasitemid);
                                }}
                            />

                            {/* Another button - take photo or take new photo */}
                            <TakePhotoQuick
                                label={uri ? "Take new photo" : "Take Photo"}
                                mode="takephoto"
                                onDone={({ newUri, nameofitem, hascategory, hasdescription, haslocation, hassize, hasowner_id, hastimestamp, hasitemid }) => {
                                    setUri(newUri);
                                    setItemName(nameofitem);
                                    setCategory_id(hascategory);
                                    setDescription(hasdescription);
                                    setLocation(haslocation);
                                    setSize(hassize);
                                    setTimestamp(hastimestamp);
                                    setBackend_id(hasitemid);
                                }}
                            />

                        </View>

                        <TextInput
                            style={[styles.input, { marginTop: 5, }]}
                            placeholder='Item Name'
                            placeholderTextColor="#52946B"
                            onChangeText={itemName => setItemName(itemName)}
                            value={itemName}
                        />
                        <TextInput
                            style={[styles.inputdescription]}
                            placeholder='Description'
                            placeholderTextColor="#52946B"
                            multiline={true}
                            numberOfLines={3}
                            onChangeText={description => setDescription(description)}
                            value={description}
                        />

                        <TextInput
                            style={[styles.input, { marginTop: 5, }]}
                            placeholder='Size'
                            placeholderTextColor="#52946B"
                            onChangeText={size => setSize(size)}
                            value={size}
                        />

                        <View style={{ zIndex: 1000, width: '90%', marginVertical: 3, position: 'relative', zIndex: 10, }}>
                            <CategoryPicker
                                category_id={category_id}
                                setCategory_id={setCategory_id}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '90%' }}>
                            <TextInput
                                placeholder='Location'
                                placeholderTextColor="#52946B"
                                style={styles.inputLocation}
                                onChangeText={location => setLocation(location)}
                                value={location}
                            />
                            <LocationPicker locations={locations} location={location} setLocation={setLocation} minheight='35'/>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

        </View >
    );
}
