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
const styles = StyleSheet.create({
    button: {
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: '',
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
    text2: {
        color: "#52946B",
        fontSize: 25,
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
