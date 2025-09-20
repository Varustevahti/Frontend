import React, { useState } from "react";
import { Button, Image, View, Alert, Text, Pressable, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TakePhotoQuick({ onDone, label= "Take Photo", border = 5 , padding = 5, margin = 10 }) {
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
    <View style={{ padding: padding }}>
      <Pressable style={[styles.camerabutton, {borderRadius: border, margin: margin}]} onPress={takePhoto}>
        <Text style={styles.camerabuttontext}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  camerabutton: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
  },
  camerabuttontext: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
    padding: 10,
    margin: 0,

  },


});