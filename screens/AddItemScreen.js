import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Pressable, Alert } from "react-native";
import { Menu, Button } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import TakePhotoQuick from "./TakePhotoQuick";
import { useItemsActions } from "../ItemContext";

export default function AddItemScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const { addItem } = useItemsActions();
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);
    const [size, setSize] = useState('M');
    const [visible, setVisible] = useState(false);
    const [selectedSize, setSelectedSize] = useState('Medium');

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelect = (size) => {
        setSelectedSize(size);
        closeMenu();
    }

    const buttonPressed = () => {
        Alert.alert("Camera activated")
    };

    const handleTakePhoto = async () => {
        console.log("PRESSED");
        const newUri = await TakePhotoQuick();
        if (newUri) { setUri(newUri); };
    };

    const emptyItem = () => {
        setItemName("");
        setUri(null);
        setDescription("");
        setSelectedSize("Medium");
        setLocation("");
    }

    const saveItem = () => {
        addItem({
            id: Date.now().toString(),
            name: itemName,
            description: description,
            uri: uri,
            size: selectedSize,
            category: category,
            location: location,
        });
        Alert.alert("Saved item");
    }

    return (
        <ScrollView style={{ backgroundColor: '#F8FBFA' }}
            automaticallyAdjustKeyboardInsets={true} contentContainerStyle={styles.scrollContainer}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
            }}>
            <View style={{ flexDirection: 'row' }}>
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={emptyItem}>CLEAR</Button>
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={saveItem}>SAVE</Button>
            </View>

            <View style={[styles.cameraview, { flexDirection: 'column' }]}>

                {uri && <Image source={{ uri: uri }} style={styles.cameraimage} />}

                {!uri && (
                    <>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', }}>Add Image</Text>
                        <Text>Take a photo or select from gallery</Text>
                        <View style={{ justifyContent: 'flex-end' }}>
                            <TakePhotoQuick onDone={(newUri) => setUri(newUri)} />
                        </View>
                    </>
                )}
            </View>
            {uri && (
                <> 
                <View style={{ marginTop: 5}}>
                    <TakePhotoQuick label="Change photo" border={0} padding={0} margin={0} onDone={(newUri) => setUri(newUri)} />
                        </View>
                </>
            )}

            <TextInput
                style={[styles.input, { marginTop: 10, }]}
                placeholder='Item Name'
                placeholderTextColor="#52946B"
                onChangeText={itemName => setItemName(itemName)}
                value={itemName}
            />
            <TextInput
                style={[styles.inputdescription]}
                placeholder='Description'
                placeholderTextColor="#52946B"
                multiline={true}
                numberOfLines={3}
                onChangeText={description => setDescription(description)}
                value={description}
            />


            <View style={[styles.container2, { flexDirection: 'row', padding: 15, justifyContent: 'center' }]}>
                <Text style={styles.result}>Size: </Text>
                <Menu visible={visible} onDismiss={closeMenu}
                    anchor={<Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={openMenu}>{selectedSize}</Button>}
                >

                    <Menu.Item onPress={() => handleSelect("Small")} title="Small" />
                    <Menu.Item onPress={() => handleSelect("Medium")} title="Medium" />
                    <Menu.Item onPress={() => handleSelect("Large")} title="Large" />
                </Menu>

            </View>

            <TextInput
                style={styles.input}
                placeholder='Category'
                placeholderTextColor="#52946B"
                onChangeText={category => setCategory(category)}
                value={category}
            />
            <TextInput
                placeholder='Location'
                placeholderTextColor="#52946B"
                style={styles.input}
                onChangeText={location => setLocation(location)}
                value={location}
            />

        </ScrollView>


    );
}
const styles = StyleSheet.create({
    scrollContainer: {
        fontSize: 20,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        fontSize: 20,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container2: {
        fontSize: 20,
        backgroundColor: '#52946B',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ''
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    cameraview: {
        backgroundColor: '#F8FBFA',
        borderWidth: 1,
        borderStyle: 'dashed',
        width: '50%',
        height: '35%',
        color: '#0D1A12',
        borderColor: '#52946B',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cameraimage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 5,
        zIndex: 0,
    },
    camerabutton: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
        padding: 5,
        marginTop: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,

    },
    camerabuttontext: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
        padding: 5,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
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
    inputdescription: {
        height: 120,
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
        textAlignVertical: 'top',
    },
    bigview: {
        backgroundColor: '#F8FBFA',
        width: '90%',
        height: '80%',
        color: '#0D1A12',
        borderColor: '#52946B',
    },
    someview: { height: '100%', width: '100%', aspectRatio: 1, resizeMode: 'contain', },
    result: {
        textAlign: 'left',
        fontSize: 16,
        color: "#52946B",
        width: '70%',
    },

});
