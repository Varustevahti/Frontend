import React from "react";
import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Button } from 'react-native-paper';
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

