import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function SearchScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Search </Text>
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
});
