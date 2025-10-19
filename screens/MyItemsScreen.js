import React from "react";
import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, Pressable, TextInput } from "react-native";
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import { Button } from "react-native-paper";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useItemsData } from "../ItemContext";
import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

export default function MyItemsScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [lookingfor, setLookingfor] = useState('');
    const [searchItems, setSearchItems] = useState([]);

    const navigation = useNavigation();
    const Stack = createNativeStackNavigator();
    const db = useSQLiteContext();



    const updateList = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems');
            setItems(list);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const updateSearchList = async (lookingfor) => {
        try {
            const term = `%${(lookingfor ?? '').trim()}%`;

            // Etsi useista sarakkeista: name, description, owner, location, size
            const query = `
      SELECT * FROM myitems
      WHERE LOWER(name)        LIKE LOWER(?)
         OR LOWER(description) LIKE LOWER(?)
         OR LOWER(owner)       LIKE LOWER(?)
         OR LOWER(location)    LIKE LOWER(?)
         OR LOWER(size)        LIKE LOWER(?)
      ORDER BY id DESC
    `;

            const params = [term, term, term, term, term];

            const list = await db.getAllAsync(query, params);
            setSearchItems(list);
            console.log('found:', searchItems);
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
        <View style={{ flex: 1, backgroundColor: '#E5EAEA' }}>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder='search'
                    placeholderTextColor="#52946B"
                    onChangeText={lookingfor => setLookingfor(lookingfor)}
                    value={lookingfor}
                />
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={() => updateSearchList(lookingfor)}>SEARCH</Button>
                <View>
                    {!searchItems ? (
                        <FlatList
                            keyExtractor={item => item.id.toString()}
                            data={items}
                            renderItem={({ item }) =>
                                <View style={styles.itembox}>
                                    <Pressable
                                        onPress={() => {
                                            navigation.navigate('ShowItem', { item });
                                        }}
                                    ><View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={{ uri: item.image }} style={styles.cameraimage} />
                                            <Text style={{ fontSize: 20, color: '#52946B' }}>{item.name} </Text>
                                        </View>
                                    </Pressable>
                                </View>
                            }
                        />
                    ) : (
                    <FlatList
                        keyExtractor={item => item.id.toString()}
                        data={searchItems}
                        renderItem={({ item }) =>
                            <View style={styles.itembox}>
                                <Pressable
                                    onPress={() => {
                                        navigation.navigate('ShowItem', { item });
                                    }}
                                ><View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={{ uri: item.image }} style={styles.cameraimage} />
                                        <Text style={{ fontSize: 20, color: '#52946B' }}>{String(item.name ?? '')} </Text>
                                    </View>
                                </Pressable>
                            </View>
                        }
                    />
                    )}
                </View>

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
        paddingTop: 15,
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    cameraimage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
        borderRadius: 7,
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
    },
    input: {
        height: 40,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '75%',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 10,
        marginTop: 80,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
});
