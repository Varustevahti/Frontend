import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image,  Pressable } from "react-native";
import { useSQLiteContext } from 'expo-sqlite';
import {  useNavigation } from '@react-navigation/native';
import { useUser } from "@clerk/clerk-expo";

export default function ShowMyItemScreen() {
    const { user } = useUser();
    const [items, setItems] = useState([]);
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