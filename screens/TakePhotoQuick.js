import React, { useState } from "react";
import { Button, Image, View, Alert, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function TakePhotoQuick({ onDone, label = "Take Photo", border = 5, padding = 5, margin = 10, mode = "takephoto", hasname = "" }) {
  const [uri, setUri] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const baseURL = "http://127.0.0.1:8000";   // backend URL

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
        // If an image is selected (not cancelled), 
        // update the file state variable
        const newUri = result.assets[0].uri;
       let nameofitem = hasname;
        try {
          setUploading(true);
          console.log("hasname:", hasname);
          if (hasname === "" && newUri) {
  //          Alert.alert("Send to image recognition - has no name");
            console.log("Sending image to recognition:", newUri);

            // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
            const hidata = await uploadAutoItem({
              fileUri: newUri,
              location: '',
              owner: '',
              baseURL,
            });
            console.log('OK:', hidata, ' description:', hidata.desc);
             nameofitem = hidata?.desc ?? "unknown item";
            const name = hidata.desc;

          } else {
            Alert.alert("Image selected - has name", hasname);
            console.log("hasname as Item name:", hasname);
             nameofitem = hasname;
          }
          setUri(newUri);
          onDone?.({ newUri, nameofitem });
        } catch (error) {
          console.error("Error during image recognition:", error);
          onDone?.({ newUri, name: "Unknown item" });
        } finally {
          setUploading(false);
        }
        // Clear any previous errors
        setError(null);
      }

    /*
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
      */
  };

  // Function to pick an image from 
  //the device's media library
  // https://www.geeksforgeeks.org/react-native/how-to-upload-and-preview-an-image-in-react-native/
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        // If an image is selected (not cancelled), 
        // update the file state variable
        const newUri = result.assets[0].uri;
       let nameofitem = hasname;
        try {
          setUploading(true);
          console.log("hasname:", hasname);
          if (hasname === "" && newUri) {
  //          Alert.alert("Send to image recognition - has no name");
            console.log("Sending image to recognition:", newUri);

            // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
            const hidata = await uploadAutoItem({
              fileUri: newUri,
              location: '',
              owner: '',
              baseURL,
            });
            console.log('OK:', hidata, ' description:', hidata.desc);
             nameofitem = hidata?.desc ?? "unknown item";
            const name = hidata.desc;

          } else {
            Alert.alert("Image selected - has name", hasname);
            console.log("hasname as Item name:", hasname);
             nameofitem = hasname;
          }
          setUri(newUri);
          onDone?.({ newUri, nameofitem });
        } catch (error) {
          console.error("Error during image recognition:", error);
          onDone?.({ newUri, name: "Unknown item" });
        } finally {
          setUploading(false);
        }
        // Clear any previous errors
        setError(null);
      }
    }
  };


  async function uploadAutoItem({ fileUri, location = '', owner = '', baseURL }) {
    // iOS: joskus uri alkaa "file://"
    const uri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;

    // Arvaa nimi ja MIME, jos puuttuu
    const name = fileUri.split('/').pop() || 'upload.jpg';
    const ext = name.split('.').pop()?.toLowerCase();
    const type = ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' :
        'image/jpeg';

    const form = new FormData();
    form.append('file', { uri: fileUri, name, type }); // NIMI "file" vastaa FastAPI:n parametriä
    form.append('location', location);
    form.append('owner', owner);

    const res = await fetch(`${baseURL}/items/auto`, {
      method: 'POST',
      // ÄLÄ aseta Content-Typeä itse; RN lisää boundaryn automaattisesti
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Upload failed ${res.status}: ${txt}`);
    }
    return await res.json();
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