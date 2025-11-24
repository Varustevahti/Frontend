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
import { myLocationsStyles as styles } from "../styles/myLocationsStyle";


export default function MyLocationsScreen() {
    const [category_id, setCategory_id] = useState(0);
    const [locations, setLocations] = useState("");
    const { user } = useUser();
    const owner_id = user.id;;
    const { categories } = useItemsData();
    const [itemFromBackend, setItemFromBackend] = useState();
    

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
                numColumns={1}
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
                                style={styles.LocationButton}
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
