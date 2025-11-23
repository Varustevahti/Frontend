import React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Image } from "react-native";
import { Menu, Button } from 'react-native-paper';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';
import dbTools from '../components/DbTools';
import { useUser } from "@clerk/clerk-expo";


export default function MarketScreen() {
    const { user } = useUser();
    const [onMarketItems, setOnMarketItems] = useState(null);
    const [searchItems, setSearchItems] = useState([]);
    const db = useSQLiteContext();
    const owner_id = user.id;
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
             <Button onPress={updateSearchList} mode="contained" style={styles.buttonProfile}>update market</Button>
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
});
