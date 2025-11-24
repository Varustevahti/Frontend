import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert, ScrollView, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { TextInput } from "react-native-paper";
import { useUser } from "@clerk/clerk-expo";
import { Button } from "react-native-paper";
import DropDownPicker from 'react-native-dropdown-picker';
import { useItemsActions, useItemsData } from "../ItemContext";
import CategoryPicker from "../components/CategoryPicker";
import Toast from "react-native-toast-message";
import { baseURL } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ShowMyItemScreen() {
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const [backend_id, setBackend_id] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category_id, setCategory_id] = useState(0);
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
    ;

    const [isEditing, setIsEditing] = useState(false);
    const navigation = useNavigation();
    const db = useSQLiteContext();

    useEffect(() => {
        const loadItems = async () => {
            try {
                const list = await db.getAllAsync(
                    'SELECT * FROM myitems WHERE deleted=0 AND owner=?',
                    [user.id]
                );
                setItems(list);
            } catch (error) {
                console.error('Error loading items', error);
            }
        }
        loadItems();
    }, [user.id])



    return (

        <View style={styles.container}>
            <Text style={styles.sectionTitle}>MY ITEMS</Text>
            {/* 🔍 Search 
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#52946B"
                    onChangeText={setLookingfor}
                    value={lookingfor}
                /> */}
            {/* Jos ei haeta → näytetään lohkot */}


            <FlatList
                keyExtractor={(item) => item.id.toString()}
                data={items}
                numColumns={3}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowItem", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{padding: 5}}>
                            <Image source={{ uri: item.image }} style={styles.cameraimage} />
                            <Text style={styles.itemTitle}>{item.name}</Text>
                        </View>
                    </Pressable>
                )}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
                ListEmptyComponent={<Text style={{ color: "#777" }}>No items yet.</Text>}
            />

        </View>




    );
}