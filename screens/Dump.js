// kaikkee mitä voi ehkä käyttää uudestaan

// valinta menu (size)
/*

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




                         <DropDownPicker
                        open={open}
                        value={category_id.toString()}
                        items={categories}
                        setOpen={setOpen}
                        setValue={setValue}
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




                        
                        useEffect(() => {
                            (async () => {
                                console.log("loading categories")
                                const res = await fetch(`${baseURL}/categories/`, {
                                    method: 'GET',
                                    headers: { accept: 'application/json', },
                                });
                                if (!res.ok) {
                                    const txt = await res.text().catch(() => '');
                                    throw new Error(`Load failed ${res.status}: ${txt}`);
                                }
                                const data = await res.json();
                                const catdata = data.map(cat => ({
                                    label: cat.name,
                                    value: String(cat.id),
                                    key: `cat-${cat.id}`,
                                }))
                                setCategories(catdata);
                            })();
                        }, []);





                        /// tää on sit se updateList

                            // look for items owned by this user from frontend sqlite
                                try {
                                    const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner==?', [user.id]);
                                    setItems(list);
                                } catch (error) {
                                    console.error('Could not get items', error);
                                }
                        
                                // check if deleted items are on fronend sqlite and delete them fully from backend and frontend
                        
                                const getrows = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner==?', [user.id]);
                                console.log('deltable list !!!!!', getrows);
                                setDeletableList(getrows);
                                //       console.log('deletable items:', deletableList);
                                // start deleting process if there are deletable items
                                if (getrows.length > 0) {
                                    console.log('found ', deletableList.length, 'deletable items, trying to delete them fully');
                                    // fetch backend items to compare timestamps
                                    let checkdeleteitem = null;
                                    try {
                                        console.log("GET");
                                        const res1 = await fetch(`${baseURL}/items/`, {
                                            method: 'GET',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(res1),
                                        });
                                        console.log('response for check delete item:', res1);
                                        if (!res1.ok) {
                                            const txt = await res1.text().catch(() => '');
                                            throw new Error(`Fetch failed ${res1.status}: ${txt}`);
                                        }
                                        checkdeleteitem = await res1.json();
                                        console.log('check delete items:', checkdeleteitem.items);
                                    } catch (error) {
                                        console.error('Could not fetch item for deletion check', error);
                                    }
                                    // loop through deletable items and compare timestamps
                                    for (const itemdel of deletableList) {
                                        console.log('checking deletable item:', itemdel, itemdel.backend_id);
                                        deleteItemBackendFrontend(itemdel.id, itemdel.backend_id);
                                        try {
                                            const datebackend = new Date(checkdeleteitem.timestamp);
                                            console.log('date in backend -- ANTAAKO MITÄÄÄN- -', datebackend);
                                            const datefrontend = new Date(itemdel.timestamp);
                        
                                            // if frontend timestamp is newer than backend, delete fully from backend and frontend else ask user if this is ok
                                            if (datefrontend < datebackend) {
                                                Alert.alert(
                                                    'Backend has newer item! ',
                                                    'Are you sure you want to delete this item?',
                                                    [
                                                        {
                                                            text: 'No',
                                                            onPress: () => console.log('Canceled'),
                                                            style: 'cancel'
                                                        },
                                                        {
                                                            text: 'Yes',
                                                            onPress: () => { deleteItemBackendFrontend(itemdel.id, itemdel.backend_id); console.log('Deleted'); },
                                                            style: 'destructive'
                                                        }
                                                    ],
                                                    { cancelable: true }
                                                );
                        
                                            } else {
                                                console.log('!! MENNÄÄN DELETOIMAAN ');
                                                deleteItemBackendFrontend(itemdel.id, itemdel.backend_id);
                                            }
                        
                                        } catch (error) {
                                            console.error('Could not delete item fully', error);
                                        }
                                        setDeletableList([]);
                                    }
                                }
  */




