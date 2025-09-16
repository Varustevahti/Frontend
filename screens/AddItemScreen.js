import React from "react";
import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Platform, Button, TextInput, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import TakePhotoQuick from "./TakePhotoQuick";

export default function AddItemScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);

    const buttonPressed = () => {
        Alert.alert("Camera activated")
    };

    const handleTakePhoto = async () => {
        console.log("PRESSED");
        const newUri = await TakePhotoQuick();
        if (newUri) { setUri(newUri); };
    };

    return (
        <View style={styles.container}>
            <View style={styles.cameraview}>
                 {uri && <Image source={{ uri }} style={styles.cameraimage} />}
                {!uri && (
                    <>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', }}>Add Image</Text>
                        <Text>Take a photo or select from gallery</Text>
                    </>
                )}

                <TakePhotoQuick onDone={(newUri) => setUri(newUri)} />
               
            </View>
            <TextInput
                style={[styles.input, { marginTop: 20, }]}
                placeholder='Item Name'
                placeholderTextColor="#52946B"
                onChangeText={itemName => setItemName(itemName)}
                value={itemName}
            />
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
            <TextInput
                style={[styles.inputdescription]}
                placeholder='Description'
                placeholderTextColor="#52946B"
                multiline={true}
                numberOfLines={3}
                onChangeText={description => setDescription(description)}
                value={description}
            />
            <View style={[styles.cameraview, { height: '15%', }]}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', }}>Add Receipt</Text>
                <Text>You can add photo of receipt if you want</Text>
                <Pressable style={styles.camerabutton} onPress={buttonPressed}>
                    <Text style={styles.camerabuttontext}>Add Receipt</Text>
                </Pressable>
            </View>
        </View>


    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontSize: 20,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    cameraview: {
        backgroundColor: '#F8FBFA',
        borderWidth: 1,
        borderStyle: 'dashed',
        width: '90%',
        height: '35%',
        color: '#0D1A12',
        borderColor: '#52946B',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
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

});
