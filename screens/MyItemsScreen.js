import React, { use } from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Presasble } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { Button, Pressable } from "react-native-paper";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useItemsData } from "../ItemContext";
import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

export default function MyItemsScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [items, setItems] = useState([]);

        const navigation = useNavigation();

    const db = useSQLiteContext();

    const Stack = createNativeStackNavigator();

    const updateList = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems');
            setItems(list);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const deleteItem = async (id) => {
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=?', id);
            await updateList();
        }
        catch (error) {
            console.error('Could not delete item', error);
        }
    }

    useFocusEffect(
        React.useCallback(() => { updateList() }, [])
    );



    return (

        <View style={styles.container}>
            <View>

                    <FlatList
                        keyExtractor={item => item.id.toString()}
                        data={items}
                        renderItem={({ item }) =>
                            <View style={styles.itembox}>
                                <Button
                                    onPress={() => {
                                        navigation.navigate('ShowItem', {item});
                                    }}
                                >
                                    <Image source={{ uri: item.image }} style={styles.cameraimage} />
                                    <Text style={{ fontSize: 20 }}>{item.name} </Text>
                                    <Text style={{ color: '#ff0000' }} onPress={() => deleteItem(item.id)}>Delete</Text>
                                </Button>
                            </View>
                        }
                    />
 
            </View>

        </View>



    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    cameraimage: {
        width: '80',
        height: '80',
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    line: {
        height: 1,
        width: '100%',
        backgroundColor: 'grey',
        paddingTop: 2,
    },
    itembox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        padding: 3,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',
    }
});
