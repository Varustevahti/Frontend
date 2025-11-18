
import { baseURL } from '../config';
import  dbTools from "dbTools";
import { Alert } from 'react-native';
// import { useState } from 'react';
//import { useUser } from "@clerk/clerk-expo";
// import { useSQLiteContext } from 'expo-sqlite';

export default async function syncItems(db, user) {
    const owner_id = user.id;
    

    // lataa tiedot paikallisesta sqlite:sta itemdatastate

    const getLocalSQLiteItems = async () => {
        console.log("Käyttäjä on",user.id);
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
            console.log('loaded items from frontend SQLite. Quantity:',list.length);
            return list;
        } catch (error) {
            console.error('Could not get local items', error);
        }
    }

    // lataa tiedot backendistä

    const getBackendItems = async () => {
        try {
            const res = await fetch(`${baseURL}/items/`, {
                method: 'GET',
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Items get from backend");
                // erottaa backendin tiedoista pelkästään käyttäjän itemit omaan "listaan"
                // eli filtteröi pois muiden ownereiden itemit
                const onlymyitems = data.filter(item => item.owner === owner_id)
                return onlymyitems;
            } else {
                console.log('getting items from backend aborted');
            }
        } catch (error) {
            console.error('Could not get items from backend', error);
        }
    }

    const getTimeStamp = () => {
        let now = new Date();
        return now.toISOString().split('.')[0];
    }

    const updateBackToFront = async () => {
        try {
            // päivitä backend fronttiin
            for (const bitem of backendItems) {
                const timestamp = bitem.timestamp ?? getTimeStamp();
                try {
                    await db.runAsync(
                        `INSERT INTO myitems 
        (backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            bitem.id,
                            bitem.name,
                            bitem.location ?? "",
                            bitem.desc ?? "",
                            bitem.owner,
                            bitem.category_id ?? 0,
                            Number(bitem.group_id) || 0,
                            bitem.image ?? "",
                            bitem.size ?? "",
                            timestamp,
                            bitem.on_market_place ?? 0,
                            bitem.price ?? 0,
                            0,
                        ]
                    );

                } catch (error2) {
                    console.log('error in local insert', bitem.id, error2)
                }
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    const deleteSingleItemFrontend = async (itemdel_id) => {
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=? AND owner=?', [itemdel_id, owner_id]);
        } catch (error) {
            console.log('Error in deleting item from FrontEnd', error);
        }
    }

    const deleteSingleItemBackend = async (itemdel_id) => {
        try {
            const res = await fetch(`${baseURL}/items/${itemdel_id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await db.runAsync('DELETE FROM myitems WHERE id=? AND owner=?', [itemdel_id, user.id]);
                console.log('deleted item from both backend and frontend', itemdel_id);
            } else {
                const txt = await res.text().catch(() => '');
                console.warn('Backend delete failed, not touching local', res.status, txt);
            }
        } catch (error) {
            console.log('error deletin item', error);
        }
    }

// huom POST POST POST single item in backend
      const postSingleItemInBackend = async (item) => {
        try {
            //         let integeritemid = parseInt(item.backend_id, 10);
            const payload = {
                name: item.name,
                location: item.location,
                desc: item.description,
                owner: owner_id,
                category_id: Number(item.category_id) || 0,
                group_id: Number(item.group_id) || 0,
                size: item.size,
                on_market_place: item.on_market_place,
                price: item.price,
                image: item.image,
            }
            const res = await fetch(`${baseURL}/items/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Upload failed ${res.status}: ${txt}`);
            } else {
                const data = await res.json();
                console.log("Item updated on backend");
            }
        } catch (error) {
            console.log('Error in post single item in backend', error);
        }
    }

// huom PUT PUT PUT item into backend
    const putSingleItemInBackend = async (item) => {
        try {
            let integeritemid = parseInt(item.backend_id, 10);
            const payload = {
                name: item.name,
                location: item.location,
                desc: item.description,
                owner: owner_id,
                category_id: Number(item.category_id) || 0,
                group_id: Number(item.group_id) || 0,
                size: item.size,
                on_market_place: item.on_market_place,
                price: item.price,
            }
            const res = await fetch(`${baseURL}/items/${integeritemid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Upload failed ${res.status}: ${txt}`);
            } else {
                const data = await res.json();
                console.log("Item updated on backend");
            }
        } catch (error) {
            console.log('Error in post single item in backend', error);
        }
    }

    const postSingleItemFrontend = async (item) => {
        try {
            await db.runAsync(
                `INSERT INTO myitems 
        (backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.id,
                    item.name,
                    item.location,
                    item.desc,
                    owner_id,
                    item.category_id,
                    Number(item.group_id) || 0,
                    item.uri,
                    item.size,
                    item.timestamp,
                    item.on_market_place,
                    item.price,
                    0,
                ]
            );
        } catch (error) {
            console.error('Could not add item', error);
        }

    }

    const checkFrontItemsVersusBackItems = async (localItems, backendItems) => {
        // jos ei tarkastetetaan ensin frontedin päädyn tuotteet
        try {
            for (const item of localItems) {
                // Onko itemillä backend_id
                if (item.backend_id === null) {
                    // / jos ei ole backend_id
                    // // tarkastetaan onko merkitty poistettavaksi frontendissä (deleted=1 merkkaa poistettava), 
                    if (item.deleted === 1) {
                        // /// jos on -> poistetaan frontista, ei tallenneta backendiin DEL frontti
                        try {
                            deleteSingleItemFrontend(item.id);
                        } catch (error2) {
                            console.log('error in deleting single item from fronted', error2);
                        }
                    } else {
                        // /// jos ei -> tallennetaan yksi item backendiin POST bäkkäri
                        postSingleItemInBackend(item);
                    }
                } else {
                    // meillä on backend_id frontin tiedoissa 
                    // // vertaa frontin ja backendin timestamppejä
                    // hae backendistä tuota item.backend_id vastaava backendItems.id 
                    const oneBackendItem = backendItems.find(i => i.id === item.backend_id);
                    // /// jos frontin timestamp tuoreempi
                    if (item.timestamp >= oneBackendItem.timestamp) {
                        // frontin timestamp on tuoreempi
                        // //// tarkastetaan onko merkitty poistettavaksi frontissa (deleted=1 merkkaa poistettava) 
                        if (item.deleted === 1) {
                            // ///// jos on merkitty poistettavaksi -> poistetaan backendistä ja poistetaan frontista DEL bäkkäri, DEL frontti 
                            deleteSingleItemBackend(item.backend_id);
                            deleteSingleItemFrontend(item.id);
                            // poistetaanko tämä myös backenditems listalta - joo
                            const newbackenditems = backendItems.filter(i => i.id !== item.backend_id);
                            //                  setBackendItems(newbackenditems);
                        } else {
                            // ///// jos ei merkitty poistettavaksi -> päivitetään frontin itemtiedot  backendiin itemin tietojen päälle  PUT bäkkäri
                            putSingleItemInBackend(item);
                        }
                    } else {
                        // ///  frontin timestamp on vanhempi kuin backendin 
                        // //// päivitetään frontin item tiedot bäkkärin tiedoista PUT frontti 
                        putSingleItemInBackend(item);
                    }
                    // ////// listätään listaan läpikäydyt backend_id
                }
            }
        } catch (error) {
            console.log("got an error on checking frontend items versus backenditems", error);
        }
    }

    const checkBackItemsVersusFrontItems = async (localItems, backendItems) => {
        try {
            // tarkastetaan sitten toiseen suuntaan backendin tuotteet yksi kerrallaan
            console.log('Backendissä tuotteita:', backendItems.length);
            for (const bitem of backendItems) {
                // Onko bäkkärin item_id on läpikäydyt backend_id listalla -> ei tehdä mitään, muuten: 
                console.log(bitem.name, 'in backend versus frontend search. id:', bitem.id);
                const existsInFront = localItems.some(i => i.backend_id === bitem.id);
                if (!existsInFront) {
                    // / jos ei ole, lisätään tuote fronttiin sqliteen POST frontti
                    postSingleItemFrontend(bitem);
                }
            }
        } catch (error) {
            console.log('Got error on checking backenditems versus frontend items', error);
        }
    }


    console.log("START SYNCING");

    // haetaan frontin lista 
    const localItems = await getLocalSQLiteItems();
    // haetaan backendin lista ja filtteröidään siitä jäljelle vain omat itemit
    const backendItems = await getBackendItems();
    // jos paikallinen lista on tyhjä, lataa kaikki käyttäjän tiedot kyseiseen itemDataStateen ja tallentaa sen 

    if (localItems.length === 0) {
        await updateBackToFront();
    }
    if (localItems.length === 0) {
        console.log("Frontend was empty → imported all backend data");
        return;
    }

    // vertaa listoja
    await checkFrontItemsVersusBackItems(localItems, backendItems);
    await checkBackItemsVersusFrontItems(localItems, backendItems);

    if (backendItems.length === localItems.length) {
        console.log("Frontend and Backend databases synced");
    }
    console.log("END SYNCING");


    return null;
}