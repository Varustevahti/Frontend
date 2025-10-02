import React, { useEffect } from "react";
import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, Pressable, Alert } from "react-native";
import { Menu, Button } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import TakePhotoQuick from "./TakePhotoQuick";
import { useItemsActions } from "../ItemContext";
import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
import DropDownPicker from 'react-native-dropdown-picker';


export default function AddItemScreen() {
    const [activeLocation, setActiveLocation] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [uri, setUri] = useState(null);
    const [size, setSize] = useState('M');
    const [visible, setVisible] = useState(false);
    const [selectedSize, setSelectedSize] = useState('Medium');
    const [owner, setOwner] = useState('Timo');
    const [group_id, setGroup_id] = useState(1);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const baseURL = "http://127.0.0.1:8000";   // backend URL

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const db = useSQLiteContext();

    useEffect(() => {
        (async () => {
            console.log("loading categories")
            const res = await fetch(`${baseURL}/categories/`, {
                method: 'GET',
                headers: { accept: 'application/json', },
                // ÄLÄ aseta Content-Typeä itse; RN lisää boundaryn automaattisesti
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Upload failed ${res.status}: ${txt}`);
            }
            const data = await res.json();
            const catdata = data.map(item => ({
                label: item.name,
                value: String(item.id),
                key: `cat-${item.id}`,
            }))



//           console.log("Categories:", data);
            setCategories(catdata);
            console.log('categories for picker:', categories);
            console.log('Value: ',value);
        })();
    }, []);

    const handleSelect = (size) => {
        setSelectedSize(size);
        closeMenu();
    }

    const buttonPressed = () => {
        Alert.alert("Camera activated")
    };

    const emptyItem = () => {
        setItemName("");
        setUri(null);
        setDescription("");
        setSelectedSize("Medium");
        setLocation("");
    }

    /*
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
    */

    const updateList = async () => {
        try {
            const list = await db.getAllAsync('SELECT * FROM myitems ORDER BY id ASC');
            console.log("Items in database:", list);
            setItems(list);
        } catch (error) {
            console.error('Could not get items', error);
        }
    }

    const saveItem = async () => {
        try {
            await db.runAsync(
                `INSERT INTO myitems 
        (name, image, description, owner, location, size, category_id, group_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemName,
                    uri,
                    description,
                    owner,
                    location,
                    size,
                    Number(category) || 0,  // HUOM: numero
                    Number(group_id) || 0
                ]
            );
            //     vanha       'INSERT INTO myitems VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', itemName, uri, description, owner, location, size, category, group_id);
            await updateList();
            Alert.alert("Saved item");
            emptyItem();
        } catch (error) {
            console.error('Could not add item', error);
        }
    };



    return (
        <ScrollView style={{ backgroundColor: '#F8FBFA' }}
            automaticallyAdjustKeyboardInsets={true} contentContainerStyle={styles.scrollContainer}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
            }}>
            <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={emptyItem}>CLEAR</Button>
                <Button mode="text" buttonColor="#EAF2EC" textColor="#52946B" onPress={saveItem}>SAVE</Button>
            </View>

            <View style={[styles.cameraview, { flexDirection: 'column', }]}>

                {uri ?
                    (<Image source={{ uri: uri }} style={styles.cameraimage} />
                    ) : (
                        <>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', }}>Add Image</Text>
                            <Text style={{ width: '100%', textAlign: 'center ' }}>Take a photo or select from gallery</Text>
                            <View style={{ justifyContent: 'flex-end', flexDirection: 'row', gap: 10 }}>
                                {itemName === "" ?
                                    (
                                        <>
                                            <TakePhotoQuick label="Add Image" mode="addimage" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString());}} />
                                            <TakePhotoQuick border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString()); }} />
                                        </>
                                    ) : (
                                        <>
                                            <TakePhotoQuick label="Add Image" mode="addimage" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString());}} />
                                            <TakePhotoQuick border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString()); }} />
                                        </>)
                                }
                            </View>
                        </>
                    )}
            </View>
            {uri &&


                <View style={{ marginTop: 5, flexDirection: 'row', gap: 10 }}>
                    {itemName === "" ?
                        (
                            <>
                                <Text>Ei nimeä</Text>
                                <TakePhotoQuick label="Change Image" mode="addimage" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory);}} />
                                <TakePhotoQuick label="Take new photo" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString());}} />
                            </>
                        ) : (
                            <>
                                <TakePhotoQuick label="Change Image" mode="addimage" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString());}} />
                                <TakePhotoQuick label="Take new photo" border={0} padding={0} margin={0} hasname={itemName} onDone={({ newUri, nameofitem, hascategory }) => { setUri(newUri); setItemName(nameofitem); setValue(hascategory.toString());}} />
                            </>)

                    }
                </View>

            }

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

            <View style={{ zIndex: 1000, width: '90%', marginVertical: 10 }}>
                <DropDownPicker
                    open={open}
                    value={value}
                    items={categories}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setCategories}
                    placeholder="Valitse kategoria"
                    listMode="SCROLLVIEW"

                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    textStyle={styles.dropdownText}
                    placeholderStyle={styles.dropdownPlaceholder}
                    listItemContainerStyle={styles.dropdownItemContainer}
                    listItemLabelStyle={styles.dropdownItemLabel}
                    selectedItemLabelStyle={styles.dropdownSelectedItemLabel}
                    arrowIconStyle={styles.dropdownArrow}
                    tickIconStyle={styles.dropdownTick}
                />
            </View>

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
     dropdown: {
    backgroundColor: '#EAF2EC',
    borderColor: '#52946B',
    borderWidth: 0,
    borderRadius: 8,
    minHeight: 45,
  },
  dropdownContainer: {
    backgroundColor: '#F8FBFA',
    borderColor: '#52946B',
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#52946B',
  },
  dropdownPlaceholder: {
    color: '#777',
    fontStyle: 'italic',
  },
  dropdownItemContainer: {
    paddingVertical: 10,
  },
  dropdownItemLabel: {
    color: '#333',
    fontSize: 16,
  },
  dropdownSelectedItemLabel: {
    fontWeight: 'bold',
    color: '#52946B',
  },
  dropdownArrow: {
    tintColor: '#52946B',
  },
  dropdownTick: {
    tintColor: '#52946B',
  },

});
