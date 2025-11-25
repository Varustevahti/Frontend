import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Image } from "react-native";
import { Menu, Button } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import dbTools from '../components/DbTools';
import { useUser } from "@clerk/clerk-expo";
import { myMarketItemStyles as styles } from "../styles/myMarketItemStyle";


export default function MyMarketItemsScreen() {
    const { user } = useUser();
    const [onMarketItems, setOnMarketItems] = useState(null);
    const [searchItems, setSearchItems] = useState([]);
    const db = useSQLiteContext();
    const owner_id = user.id;
    const tools = dbTools(db, user);
    const {
        getBackendMarketItems,
        getYourBackendMarketItems
    } = tools;

    const navigation = useNavigation();

    const updateSearchList = async () => {
        try {
            const list = await getYourBackendMarketItems();
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
                                    navigation.navigate('ShowItem', { item });
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