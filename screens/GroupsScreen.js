import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function GroupsScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>My Groups!  </Text>
        </View>


    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F2ED',
        alignItems: 'center',
        justifyContent: 'center',
    },
        text: {
        color: "#52946B",
        fontSize: 18,
    },
});
