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


export  default function SaveItemFrontend({item}) {
        const thisitem = item;
        const [itemName, setItemName] = useState(thisitem.name);
        const [backend_id, setBackend_id] = useState(thisitem.backend_id);
        const [category_id, setCategory_id] = useState(thisitem.category_id);
        const [location, setLocation] = useState(thisitem.location);
        const [description, setDescription] = useState(this.item.description);
        const [size, setSize] = useState(thisitem.size);
        const [uri, setUri] = useState(thisitem.image);
        const [on_market_place, setOn_market_place] = useState(thisitem.on_market_place);
        const [price, setPrice] = useState(thisitem.price);
        const [timestamp, setTimestamp] = useState (thisitem.timestamp);
        const [deleted, setDeleted] = useState(thisitem.deleted);
        const { user } = useUser();
        const [owner, setOwner] = useState(user.id);
        const frontend_id = thisitem.id;




  useEffect(() => {
    console.log('frontend_id', item.id);
    console.log('backendid', item.backend_id);
    console.log('timestamp', item.timestamp);
    console.log('user', owner);

    // lähetä tulos takaisin kutsujalle
    onResult(true);
  }, []);

        return;

/*

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
                                    aikaleima,
                                    on_market_place,
                                    price,
                                    deleted,
                                ]
                            );
                            await updateList();
                            Alert.alert("Saved item");
                            emptyItem();
                        } catch (error) {
                            console.error('Could not add item', error);
                        }

    */

      
}