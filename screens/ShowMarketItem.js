import React from "react";
import { useState, useEffect } from "react";
import { View, Text, Image, Alert, ScrollView, Pressable } from "react-native";
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
import { showMarketItemStyles as styles } from "../styles/showMarketItemStyle";


export default function ShowMarketItem() {
    const { params } = useRoute();
    const thisitem = params?.item;
    const [backend_id, setBackend_id] = useState(null);
    const [itemName, setItemName] = useState("");
    const [selectedCategory_id, setSelectedCategory_id] = useState(0);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);
    const [size, setSize] = useState("");
    const [price, setPrice] = useState(0.0);
    const db = useSQLiteContext();
    const { user } = useUser();
    const owner_id = user.id;
    const [timestamp, setTimestamp] = useState(null);
    const { categories } = useItemsData();
    const frontend_id = thisitem.id;
    const tools = dbTools(db, user);
    const { getLocalItem } = tools;
    useEffect(() => {
        if (thisitem) {
            setItemName(thisitem.name);
            setBackend_id(thisitem.backend_id);
            setSelectedCategory_id(thisitem.category_id);
            setLocation(thisitem.location);
            setDescription(thisitem.desc);
            setSize(thisitem.size);
            setPrice(thisitem.price);
            if (thisitem.image.includes("uploads/")) setUri(null);
            else setUri(thisitem.image);
        }
    }, [thisitem]);

    const sendMessage = (itemid) => {
        Alert.alert(
            'Feature in development',
        );
    };

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
                {uri ? (
                    <>
                        <View style={styles.itembox}>
                            <Image source={{ uri: uri }} style={styles.cameraimage} />
                        </View>
                    </>
                ) : null}
                <Text style={styles.text2}>Name: {itemName}</Text>
                <Text style={styles.text2}>Description: {description || "none"}</Text>
                <Text style={styles.text2}>Category: {categories.find(
                    (cat) => cat.value == String(selectedCategory_id)
                )?.label || ""}</Text>
                <Text style={styles.text2}>Location: {location}</Text>
                <Text style={styles.text2}>Size: {size}</Text>
                <Text style={styles.text2}>Price: {price}</Text>
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
                                width: '60%',
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
                            sendMessage(thisitem.id);
                        }}>
                        <Text style={{ color: '#0D1A12', fontSize: 16, fontWeight: 'bold' }} >Send message to owner</Text>
                    </Pressable>
                </View>
            </View>

        </ScrollView>
    );
}
