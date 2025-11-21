import { baseURL } from '../config';

export default function dbTools(db, user) {
    const owner_id = user.id;


    // ================ LOCAL SQLITE =================
    // lataa tiedot paikallisesta sqlite:sta itemdatastate
    const getLocalItems = async () => {
        //       console.log("Käyttäjä on",user.id);
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
            //         setLocalItems(list);
            console.log('loaded items from frontend SQLite. Quantity:', list.length);
            //           console.log(list);
            return { data: list, error: null, };
        } catch (error) {
            console.error('Could not get local items', error);
            return {
                data: null,
                error: new Error(`Could not get local items: ${error.message}`),
            }
        }
    };

    const getLocalItem = async (localitemid) => {
        //       console.log("Käyttäjä on",user.id);
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE id = ? and owner=?', [localitemid, user.id]);
            //           console.log('loaded single item from frontend SQLite. Quantity:', list.length);
            return { data: list?.[0], error: null, };
        } catch (error) {
            console.error('Could not get local item', error);
            return {
                data: null,
                error: new Error(`Could not get a local item: ${error.message}`),
            }
        }
    };


    const getLocalItemsNotDeleted = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=?', [user.id]);
            console.log('loaded items from frontend SQLite. Quantity:', list.length);
            return { data: list, error: null, };
        } catch (error) {
            console.error('Could not get local items', error);
            return {
                data: null,
                error: new Error(`Could not get local items: ${error.message}`),
            }
        }
    };

    const getLocalDeletedItems = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner=?', [user.id]);
            console.log('loaded items from frontend SQLite. Quantity:', list.length);
            return { data: list, error: null, };
        } catch (error) {
            console.error('Could not get local items', error);
            return {
                data: null,
                error: new Error(`Could not get local items: ${error.message}`),
            }
        }
    };

    const getLocalRecentItemsNotDeleted = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=? ORDER BY timestamp DESC LIMIT 10', [user.id]);
            console.log('loaded recent items from frontend SQLite. Quantity:', list.length);
            return { data: list, error: null, };
        } catch (error) {
            console.error('Could not get local items', error);
            return {
                data: null,
                error: new Error(`Could not get local items: ${error.message}`),
            }
        }
    };

    const insertLocalItem = async (item) => {
        try {
            await db.runAsync(
                `INSERT INTO myitems 
        (backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.id,
                    item.name,
                    item.location ?? "",
                    item.desc ?? "",
                    owner_id,
                    item.category_id ?? 0,
                    Number(item.group_id) || 0,
                    item.uri ?? "",
                    item.size ?? "",
                    item.timestamp ?? new Date().toISOString().split(".")[0],
                    item.on_market_place ?? 0,
                    item.price ?? 0,
                    item.deleted ?? 0,
                ]
            );
            return { data: true, error: null, }
        } catch (error) {
            console.error('Could not add item', error);
            return {
                data: null,
                error: new Error(`Could not add an item: ${error.message}`),
            }
        }
    }

    const replaceLocalItem = async (item) => {
        try {
            await db.runAsync(
                `REPLACE INTO myitems 
                            (id, backend_id, name, location, description, owner, category_id, group_id, image, size, timestamp, on_market_place, price, deleted)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    item.id,
                    item.backend_id,
                    item.name,
                    item.location,
                    item.description,
                    item.owner,
                    item.category_id,
                    item.group_id,
                    item.image,
                    item.size,
                    item.timestamp,
                    item.on_market_place,
                    item.price,
                    item.deleted,
                ]
            );
            return { data: true, error: null, }
        } catch (error) {
            console.error('could not replace item info', error);
            return {
                data: null,
                error: new Error(`Could not replace local item info: ${error.message}`),
            }
        }
    }

    const deleteLocalItem = async (id) => {
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=? AND owner=?', [id, owner_id]);
            return { data: true, error: null, }
        } catch (error) {
            console.error('Error in deleting item from FrontEnd', error);
            return {
                data: null,
                error: new Error(`Could not get delete items local: ${error.message}`),
            }
        }
    }

    const getLocalLocations = async () => {
        //       console.log("Käyttäjä on",user.id);
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE owner=?', [user.id]);
            const ulocations = (list.map(item => item.location));
            const uniquelocations = [...new Set((list.map(item => item.location)))];
            console.log('loaded unique locations from local SQLite. Quantity:', list.length);
            console.log(ulocations);
            console.log(uniquelocations);
            return { data: uniquelocations, error: null, };
        } catch (error) {
            console.error('Could not get local items', error);
            return {
                data: null,
                error: new Error(`Could not get local items: ${error.message}`),
            }
        }
    };


    // ================= BACKEND API ==================
    const getBackendItems = async () => {
        try {
            const res = await fetch(`${baseURL}/items/`, {
                method: 'GET',
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Got items from backend");
                // filtteröi backendin tiedoista pelkästään käyttäjän itemit 
                const onlymyitems = data.filter(item => item.owner === owner_id);
                return { data: onlymyitems, error: null };
            } else {
                console.error('getting items from backend aborted');
                const txt = await res.text().catch(() => '')
                return {
                    data: null,
                    error: new Error(`Backend fetch failed: ${res.status} ${res.statusText} ${txt}`),
                };
            }
        } catch (error) {
            console.error('Could not get items from backend', error);
            return {
                data: null,
                error: new Error('Could not get items from backend: ' + error.message),
            };
        }
    }

    const postBackendItem = async (item) => {
        try {
            //         let integeritemid = parseInt(item.backend_id, 10);
            const payload = {
                name: item.name || "",
                location: item.location || "",
                desc: item.description || "",
                owner: owner_id,
                category_id: Number(item.category_id) || 0,
                group_id: Number(item.group_id) || 0,
                size: item.size ?? "",
                on_market_place: item.on_market_place ?? 0,
                price: item.price ?? 0,
                image: item.image ?? "",
            }
            const res = await fetch(`${baseURL}/items/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            console.log("payload before sending:", payload);
            if (!res.ok) {
                const txt = await res.text();
                console.error('Backend POST failed', res.status, res.statusText, txt);
                return {
                    data: null,
                    error: new Error(`Backend POST failed ${res.status} ${res.statusText}: ${txt}`),
                }
            }
            console.log("Posted item to backend");
            return {
                data: await res.json(),
                error: null,
            }
        } catch (error) {
            return {
                data: null,
                error: new Error(`Backend POST failed: ${error.message}`),
            }
        }
    }

    const putBackendItem = async (item) => {
        try {
            let integeritemid = parseInt(item.backend_id, 10);
            const payload = {
                name: item.name || "",
                location: item.location || "",
                desc: item.description || "",
                owner: owner_id,
                category_id: Number(item.category_id) || 0,
                group_id: Number(item.group_id) || 0,
                size: item.size || "",
                on_market_place: item.on_market_place || 0,
                price: item.price || 0,
            }
            const res = await fetch(`${baseURL}/items/${integeritemid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error('Backend PUT failed', res.status, res.statusText, txt);
                return {
                    data: null,
                    error: new Error(`Backend PUT failed ${res.status} ${res.statusText}: ${txt}`),
                }
            }
            return {
                data: await res.json(),
                error: null,
            }
        } catch (error) {
            console.error('Backend PUT failed', error);
            return {
                data: null,
                error: new Error(`Backend PUT failed: ${error.message}`),
            }
        }
    }

    const deleteBackendItem = async (itemdel_id) => {
        try {
            const res = await fetch(`${baseURL}/items/${itemdel_id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const txt = await res.text();
                console.error('Backend DELETE failed', res.status, res.statusText, txt);
                return {
                    data: null,
                    error: new Error(`Backend DELETE failed ${res.status} ${res.statusText} ${txt}`),
                }
            }
            return {
                data: await res.json(),
                error: null,
            };
        } catch (error) {
            return {
                data: null,
                error: new Error(`Backend DELETE failed: ${error.message}`),
            }
        }
    }

    const getBackendMarketItems = async () => {
        try {
            const res = await fetch(`${baseURL}/items/market`, {
                method: 'GET',
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Got on market items from backend");
                // filtteröi backendin tiedoista pelkästään muiden käyttäjien itemit 
                const onlymyitems = data.filter(item => item.owner !== owner_id);
                return {
                    data: onlymyitems,
                    error: null,
                };
            } else {
                const data = await res.text();
                console.log('getting items from backend aborted');
                return {
                    data: null,
                    error: new Error(`Backend fetch failed ${res.status} ${res.statusText}: ${data}`),
                }
            }
        } catch (error) {
            console.error('Could not get items from backend', error);
            return {
                data: null,
                error: new Error(`Could not get items from backend: ${error.message}`)
            };
        }
    }


    return {
        getLocalItems,
        getLocalItem,
        getLocalItemsNotDeleted,
        getLocalDeletedItems,
        getLocalRecentItemsNotDeleted,
        insertLocalItem,
        replaceLocalItem,
        deleteLocalItem,
        getLocalLocations,
        getBackendItems,
        postBackendItem,
        putBackendItem,
        deleteBackendItem,
        getBackendMarketItems
    };
}