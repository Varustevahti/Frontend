import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useNavigation, NavigationContainer } from '@react-navigation/native';

export default function ShowItem() {
    const { params } = useRoute();
    const thisitem = params?.item;
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [items, setItems] = useState([]);
    const navigation = useNavigation();

    const db = useSQLiteContext();

    const updateList = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems');
            setItems(list);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const deleteItem = async (id) => {
        console.log('yritän delaa');
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=?', id);
            await updateList();
            navigation.goBack();
        }
        catch (error) {
            console.error('Could not delete item', error);
        }
    }

    const confirmDelete = (itemid) => {
        Alert.alert(
            'Delete item permanently',
            '',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Canceled'),
                    style: 'cancel'
                },
                {
                    text: 'Yes',
                    onPress: () => { deleteItem(itemid); console.log('Deleted'); },
                    style: 'destructive'
                }
            ],
            { cancelable: true }
        );
    };

    useFocusEffect(
        React.useCallback(() => { updateList() }, [])
    );


    return (
        <View style={styles.container}>
            <View style={styles.itembox}>
                {thisitem?.image ? (
                    <>
                        <Image source={{ uri: thisitem.image }} style={styles.cameraimage} />
                    </>
                ) : null}
                <Text style={{ fontSize: 20 }}>{thisitem.name} </Text>
                <Text style={{ fontSize: 20 }}>Category: {thisitem.category_id} </Text>
                <Text style={{ color: '#ff0000', paddingTop: 10, fontSize: 20 }} onPress={() => confirmDelete(thisitem.id)}>Delete</Text>
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
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    cameraimage: {
        width: '300',
        height: '300',
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    itembox: {
        alignItems: 'center',
    },
});
