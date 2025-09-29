import React, { useState } from "react";
import { Button, Image, View, Alert, Text, Pressable, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TakePhotoQuick({ onDone, label = "Take Photo", border = 5, padding = 5, margin = 10, mode = "takephoto", hasname = "" }) {
  const [uri, setUri] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

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
      if (hasname === "") {
        Alert.alert("Send to image recognition - has no name");
        // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
        const nameofitem = " !! IDENTIFIED PHOTO !!";
        onDone?.({ newUri, nameofitem });
      } else {
        Alert.alert("Image taken - has name", hasname);
        console.log("hasname:", hasname);
        const nameofitem = hasname;
        onDone?.({ newUri, nameofitem });
      }
    }
  };

  // Function to pick an image from 
  //the device's media library
  // https://www.geeksforgeeks.org/react-native/how-to-upload-and-preview-an-image-in-react-native/
  const pickImage = async () => {
    const { status } = await ImagePicker.
      requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {

      // If permission is denied, show an alert
      Alert.alert(
        "Permission Denied",
        `Sorry, we need camera 
                 roll permission to upload images.`
      );
    } else {

      // Launch the image library and get
      // the selected image
      const result =
        await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        // If an image is selected (not cancelled), 
        // update the file state variable
        const newUri = result.assets[0].uri;
        setUri(newUri);
        console.log("hasname:", hasname);
        if (hasname === "") {
          Alert.alert("Send to image recognition - has no name");
          // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
          const nameofitem = " Identified IMAGE !!";
          onDone?.({ newUri, nameofitem });
        } else {
          Alert.alert("Image selected - has name", hasname);
          console.log("hasname:", hasname);
          const nameofitem = hasname;
          onDone?.({ newUri, nameofitem });
        }
        // Clear any previous errors
        setError(null);
      }
    }
  };

  return (
    <View style={{ padding: padding }}>
      {mode === "takephoto" ? (
        <Pressable style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={takePhoto}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={pickImage}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Pressable>
      )
      }
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