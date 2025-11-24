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