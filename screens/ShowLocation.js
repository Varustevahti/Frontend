import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image,  Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { useUser } from "@clerk/clerk-expo";
import { showLocationStyles as styles } from "../styles/showLocationStyle";


export default function ShowLocation() {
    const { params } = useRoute();
    const location = params?.location;
    console.log("Location received:", location);
    const { user } = useUser();
    const [items, setItems] = useState([]);
    const navigation = useNavigation();
    const db = useSQLiteContext();

    useEffect(() => {
        if (!location) return;
        const loadItems = async () => {
            try {
                const list = await db.getAllAsync(
                    'SELECT * FROM myitems WHERE deleted=0 AND location=? AND owner=?',
                    [location, user.id]
                );
                setItems(list);
            } catch (error) {
                console.error('Error loading items', error);
            }
        }
        loadItems();
    }, [location, user.id])


    return (

        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{location}</Text>
            {/* 🔍 Search 
                <TextInput
                    style={styles.input}
                    placeholder="Search"
                    placeholderTextColor="#52946B"
                    onChangeText={setLookingfor}
                    value={lookingfor}
                /> */}


            {/* Jos ei haeta → näytetään lohkot */}



{items.length === 0 ? (
                <Text style={{ color: "#777" }}>No items yet.</Text>
            ) :             <FlatList
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

}


        </View>




    );
}