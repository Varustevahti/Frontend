import React, { useState } from "react";
import { Button, Image, View, Alert, Text, Pressable, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TakePhotoQuick({ onDone }) {
  const [uri, setUri] = useState(null);

  const takePhoto = async () => {
    // Kysy kameran käyttöoikeus (iOS/Android)
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Kameran käyttöoikeus tarvitaan.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setUri(newUri);
      onDone?.(newUri);
    }
  };

  return (
    <View style={{ padding: 20 }}>

      <Pressable style={styles.camerabutton} onPress={takePhoto}>
        <Text style={styles.camerabuttontext}>Add image</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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


});