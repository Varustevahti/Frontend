import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { useItemsData } from "../ItemContext";

export default function MyItemsScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const { items } = useItemsData();

    return (

        <View style={styles.container}>
            <View>
                <FlatList
                    data={items}
                    renderItem={({ item }) =>
                        <View style={styles.itembox}>
                            <Image source={{ uri: item.uri }} style={styles.cameraimage} />
                            <Text style={{fontSize: 20}}>{item.name} </Text>
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
        padding: 5,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',
    }
});
