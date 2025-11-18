
import { baseURL } from '../config';
import dbTools from '../components/DbTools';
import { Alert } from 'react-native';
// import { useState } from 'react';
//import { useUser } from "@clerk/clerk-expo";
// import { useSQLiteContext } from 'expo-sqlite';

export default async function syncItems(db, user) {
    const owner_id = user.id;
    const tools = dbTools(db, user);
    const {
        getLocalItems,
        getBackendItems,
        insertLocalItem,
        deleteLocalItem,
        postBackendItem,
        putBackendItem,
        deleteBackendItem,
    } = tools;

    console.log("START SYNC");


    // haetaan frontin lista 
    const localItems = await getLocalItems();
    // haetaan backendin lista ja filtteröidään siitä jäljelle vain omat itemit
    const backendItems = await getBackendItems();


    // jos paikallinen lista on tyhjä, lataa kaikki käyttäjän tiedot kyseiseen itemDataStateen ja tallentaa sen 
    if (localItems.length === 0) {
        for (const b of backendItems) {
            await insertLocalItem(b);
        }
        console.log("DONE: Imported all backend data to local DB");
        return;
    }


    // FRONT -> BACK
    for (const f of local) {
        if (!f.backend_id) {
            // new item in front
            if (f.deleted === 1) await deleteLocalItem(f.id);
            else await postBackendItem(f);
        } else {
            const b = backend.find((x) => x.id === f.backend_id);
            if (!b) continue;

            if (f.timestamp >= b.timestamp) {
                if (f.deleted === 1) {
                    await deleteBackendItem(f.backend_id);
                    await deleteLocalItem(f.id);
                } else {
                    await putBackendItem(f);
                }
            } else {
                await putBackendItem(f); // or update front using backend
            }
        }
    }

    // BACK -> FRONT
    for (const b of backend) {
        const exists = local.some((x) => x.backend_id === b.id);
        if (!exists) await insertLocalItem(b);
    }



    if (backendItems.length === localItems.length) {
        console.log("Frontend and Backend databases synced");
    }
    console.log("END SYNCING");


    return null;
}