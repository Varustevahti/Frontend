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


export default function MyLocationsScreen() {
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);
    const [backend_id, setBackend_id] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category_id, setCategory_id] = useState(0);
    const [locations, setLocations] = useState("");
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
        const loadLocations = async () => {
            try {
                const locations = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
                const ulocations = (locations.map(item => item.location));
                const uniquelocations = [...new Set((locations.map(item => item.location)))];
                console.log(uniquelocations);
                setLocations(uniquelocations);
            } catch (error) {
                console.error('Error loading locations', error);
            }
        }
        loadLocations();
    }, [user.id])



    return (

        <View style={styles.container}>
          {/*    <Text style={styles.sectionTitle}>MY LOCATIONS</Text>
           🔍 Search 
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#52946B"
                    onChangeText={setLookingfor}
                    value={lookingfor}
                /> */}
            {/* Jos ei haeta → näytetään lohkot */}


            <FlatList
                keyExtractor={(item, index) => (item?.key ?? index).toString()}
                data={locations}
                numColumns={3}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => navigation.navigate("ShowLocation", { item })}
                        style={styles.itemboxrow}
                    >
                        <View style={{ padding: 5 }}>
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
                    </Pressable>
                )}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
                ListEmptyComponent={<Text style={{ color: "#777" }}>No items yet.</Text>}
            />

        </View>




    );
}


const styles = StyleSheet.create({
    gridContainer: {
        padding: 10,
        justifyContent: 'center',
    },
    gridItem: {
        flex: 1,                   // jakaa tilan tasaisesti
        margin: 5,                 // väli itemien välille
        backgroundColor: '#EAF2EC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,               // korkeus jokaiselle solulle
    },
    gridText: {
        color: '#52946B',
        fontWeight: 'bold',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 120,
        backgroundColor: "#F8FBFA",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 10,
        backgroundColor: '#F8FBFA',
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