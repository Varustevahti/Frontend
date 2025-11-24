import React, { useState } from "react";
import { Image, View, Alert, Text, Pressable, Platform } from "react-native";
import { Button } from "react-native-paper"
import * as ImagePicker from "expo-image-picker";
import {baseURL} from '../config';
import { takePhotoQuickStyles as styles } from "../styles/takePhotoQuickStyle";

export default function TakePhotoQuick({ 
  onDone, 
  label = "Take Photo", 
  mode = "takephoto", 
  border = 5, padding = 5, 
  margin = 10, 
  hasname = "", hasdescription = "", 
  haslocation = "", hassize = "", 
  hasowner_id = "", 
  hasitemid = null }) {

  const [uri, setUri] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);



  // function to launch the camera
  const takePhoto = async () => {
    setLoading(true);
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
      let hascategory;
      try {
        setUploading(true);
        console.log("hasname:", hasname);
        if (hasname === "" && newUri) {
          //          Alert.alert("Send to image recognition - has no name");
          console.log("Sending image to recognition:", newUri);

          // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
          const hidata = await uploadAutoItem({
            fileUri: newUri,
            name: '???',
            location: '',
            owner: hasowner_id,
            baseURL,
          });
          console.log('OK:', hidata, ' description:', hidata?.desc);
          nameofitem = hidata?.desc ?? "unknown item";
          console.log('ITEMNAME: ', nameofitem);
          hascategory = hidata?.category_id ?? "nono";
          console.log('Category-id: ', hidata?.category_id, nameofitem);
          hasitemid = hidata.id;

        } else {
          Alert.alert("Image selected - has name", hasname);
          console.log("hasname as Item name:", hasname);
          nameofitem = hasname;
        }
        setUri(newUri);
        onDone?.({ newUri, nameofitem, hascategory, haslocation, hasitemid });
      } catch (error) {
        console.error("Error during image recognition:", error);
        onDone?.({ newUri, name: "Unknown item" });
      } finally {
        setUploading(false);
      }
      // Clear any previous errors
      setError(null);
    }

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
        let hascategory;
        try {
          setUploading(true);
          console.log("hasname:", hasname);
          if (hasname === "" && newUri) {
            //          Alert.alert("Send to image recognition - has no name");
            console.log("Sending image to recognition:", newUri);

            // TÄSSÄ LÄHETETÄÄN TUNNISTUKSEEN JA HAETAAN nameofitem
            const hidata = await uploadAutoItem({
              fileUri: newUri,
              name: '???',
              location: '',
              owner: hasowner_id,
              baseURL,
            });

            console.log("Image from recognition:", newUri);
            console.log('OK:', hidata, ' description:', hidata?.desc, ' category_id:', hidata?.category_id);
            nameofitem = hidata?.desc ?? "unknown item";
            //            console.log('ITEMNAME: ',nameofitem);
            hascategory = hidata?.category_id ?? "nono";
            //            console.log('Category-id: ', hascategory);
            const name = hidata?.desc ?? "unknown item";
            hasitemid = hidata?.id ?? null;
            //            console.log('Item id set to: ', hasitemid);

          } else {
            Alert.alert("Image selected - has name", hasname);
            //            console.log("hasname as Item name:", hasname);
            nameofitem = hasname;
          }
          setUri(newUri);
          onDone?.({ newUri, nameofitem, hascategory, haslocation, hasitemid });
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


  async function uploadAutoItem({ fileUri, location = '', owner = { hasowner_id }, baseURL }) {
    // iOS: joskus uri alkaa "file://"
    const uri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;

    // Arvaa nimi ja MIME, jos puuttuu
    const name = fileUri.split('/').pop() || 'upload.jpg';
    const ext = name.split('.').pop()?.toLowerCase();
    const type = ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' :
        'image/jpeg';

    const form = new FormData();
    form.append('file', { uri: fileUri, name, type });
    form.append('name', name);
    form.append('location', location);
    form.append('owner', owner);

    const res = await fetch(`${baseURL}/items/auto`, {
      method: 'POST',
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
        <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={takePhoto}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Button>
      ) : (
        <Button loading={uploading} mode="contained" style={[styles.camerabutton, { borderRadius: border, margin: margin }]} onPress={pickImage}>
          <Text style={styles.camerabuttontext}>{label}</Text>
        </Button>
      )
      }
    </View>
  );
}