import React from "react";
<<<<<<< HEAD
import { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Button } from 'react-native-paper';
=======
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TextInput, Pressable, Image } from "react-native";
import { Menu, Button } from 'react-native-paper';
>>>>>>> 18198f6576eadf2b18989c0c015bd5e4237b3c37
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dbTools from '../components/DbTools';
import { useUser } from "@clerk/clerk-expo";
import { marketStyles as styles } from "../styles/MarketStyle";

export default function MarketScreen() {
    const { user } = useUser();
    const [onMarketItems, setOnMarketItems] = useState(null);
    const [searchItems, setSearchItems] = useState([]);
    const db = useSQLiteContext();
    const tools = dbTools(db, user);
    const {
        getBackendMarketItems,
    } = tools;
    const navigation = useNavigation();

    const updateSearchList = async () => {
        try {
            const list = await getBackendMarketItems();
            //          console.log('Market items:', list.data);
            setOnMarketItems(list.data);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            updateSearchList();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Button onPress={(() => navigation.navigate("MyMarketItemsScreen"))} mode="contained" style={styles.camerabutton}>
                <Text style={styles.camerabuttontext}>My Items on Market</Text>
            </Button>
            {searchItems && (
                <FlatList
                    keyExtractor={item => item.id.toString()}
                    data={onMarketItems}
                    bounces={false}
                    overScrollMode="never"
                    contentInsetAdjustmentBehavior="never"
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={({ item }) =>
                        <View style={styles.itembox}>
                            <Pressable
                                onPress={() => {
                                    navigation.navigate('ShowMarketItem', { item });
                                }}
                            ><View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>

                                    <Text style={{ fontSize: 25, color: '#52946B' }}>{String(item.name ?? '')}, </Text>
                                    <Text style={{ fontSize: 25, color: '#52946B' }}>{String(item.price ?? '')} € </Text>
                                    <Text style={{ fontSize: 25, color: '#52946B' }}>{String(item.description ?? '')} </Text>
                                </View>
                            </Pressable>
                        </View>
                    }
                />
            )}
        </View>


    );
}
<<<<<<< HEAD
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
    input: {
        height: 40,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    cameraimage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    itembox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 3,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',

    },
    buttonProfile: {
        backgroundColor: '#52946B',
        marginBottom: 20,
    },
    camerabutton: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
        padding: 5,
        marginTop: 0,
        marginBottom: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
=======
>>>>>>> 18198f6576eadf2b18989c0c015bd5e4237b3c37

