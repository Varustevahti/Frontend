import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Platform, Button, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function AddItemScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Add Item  </Text>
            <View style={styles.input}>
                <TextInput
                    placeholder='Item Name'
                    onChangeText={itemName => setItemName(itemName)}
                    value={itemName}
                />
                <TextInput
                    placeholder='Category'
                    onChangeText={category => setCategory(category)}
                    value={category}
                />
                <TextInput
                    placeholder='Location'
                    onChangeText={location => setLocation(location)}
                    value={location}
                />
                <TextInput
                    placeholder='Description'
                    onChangeText={description => setDescription(description)}
                    value={description}
                />
            </View>
        </View>


    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontSize: 20,
        backgroundColor: '#E8F2ED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    input: {
        height: 40,
        backgroundColor: '#EAF2EC',
        borderWidth: 1,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '80%',
    },
});
