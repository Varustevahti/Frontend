
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
    console.log("SYNC 1");

    // jos paikallinen lista on tyhjä, lataa kaikki käyttäjän tiedot kyseiseen itemDataStateen ja tallentaa sen 
    if (localItems.length === 0) {
        for (const b of backendItems) {
            await insertLocalItem(b);
        }
        console.log("DONE: Imported all backend data to local DB");
        return;
    }

    console.log("SYNC 2");
    // FRONT -> BACK
    for (const f of localItems) {
        console.log("SYNC 2.1");
        if (!f.backend_id) {
            // new item in front
            if (f.deleted === 1) await deleteLocalItem(f.id);
            else await postBackendItem(f);
            console.log("SYNC 2.2");
        } else {
            console.log("SYNC 2.3");
            const b = backendItems.find((x) => x.id === f.backend_id);
            if (!b) {
                console.log("SYNC 2.31 - POST item to backend ");
                await postBackendItem(f);
            };
            console.log("SYNC 2.4");
            if (f.timestamp >= b.timestamp) {
                console.log("SYNC 2.5");
                if (f.deleted === 1) {
                    await deleteBackendItem(f.backend_id);
                    await deleteLocalItem(f.id);
                } else {
                    console.log("SYNC 2.6");
                    await putBackendItem(f);
                }
                console.log("SYNC 2.7");
            } else {
                console.log("SYNC 2.8");
                await putBackendItem(f); // or update front using backend
            }
        }
    }
    console.log("SYNC 3");
    // BACK -> FRONT
    for (const b of backendItems) {
        const exists = localItems.some((x) => x.backend_id === b.id);
        if (!exists) await insertLocalItem(b);
    }

    console.log("SYNC 4");

    if (backendItems.length === localItems.length) {
        console.log("Frontend and Backend databases synced");
    }
    console.log("END SYNCING");


    return null;
}