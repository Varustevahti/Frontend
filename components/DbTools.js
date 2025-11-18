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
            return list;
        } catch (error) {
            console.error('Could not get local items', error);
        }
    };

    const getLocalItemsNotDeleted = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=?', [user.id]);
            console.log('loaded items from frontend SQLite. Quantity:', list.length);
            return list;
        } catch (error) {
            console.error('Could not get local items', error);
        }
    };

        const getLocalDeletedItems = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=1 AND owner=?', [user.id]);
            console.log('loaded items from frontend SQLite. Quantity:', list.length);
            return list;
        } catch (error) {
            console.error('Could not get local items', error);
        }
    };

        const getLocalRecentItemsNotDeleted = async () => {
        try {
            const list = await db.getAllAsync('SELECT * from myitems WHERE deleted=0 AND owner=? ORDER BY timestamp DESC LIMIT 10', [user.id]);
            console.log('loaded recent items from frontend SQLite. Quantity:', list.length);
            return list;
        } catch (error) {
            console.error('Could not get local items', error);
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
        } catch (error) {
            console.error('Could not add item', error);
        }
    }

    const deleteLocalItem = async (id) => {
        try {
            await db.runAsync('DELETE FROM myitems WHERE id=? AND owner=?', [id, owner_id]);
        } catch (error) {
            console.log('Error in deleting item from FrontEnd', error);
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
            return uniquelocations;
        } catch (error) {
            console.error('Could not get local items', error);
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
                console.log("Items get from backend");
                // filtteröi backendin tiedoista pelkästään käyttäjän itemit 
                const onlymyitems = data.filter(item => item.owner === owner_id)
                return onlymyitems;
            } else {
                console.log('getting items from backend aborted');
            }
        } catch (error) {
            console.error('Could not get items from backend', error);
            return [];
        }
    }

    const postBackendItem = async (item) => {
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
            if (!res.ok) { throw new Error(`Backend Post failed`); }
            return await res.json();
        } catch (error) {
            console.log('Backend POST failed', error);
        }
    }

    const putBackendItem = async (item) => {
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
            if (!res.ok) { throw new Error(`Backend Post failed`); }
            return await res.json();
        } catch (error) {
            console.log('Backend PUT failed', error);
        }
    }

    const deleteBackendItem = async (itemdel_id) => {
        try {
            const res = await fetch(`${baseURL}/items/${itemdel_id}`, {
                method: 'DELETE',
            });
            return await res.json();
        } catch (error) {
            console.log('Backend DELETE failed', error);
        }
    }


    return {
        getLocalItems,
        getLocalItemsNotDeleted,
        getLocalDeletedItems,
        getLocalRecentItemsNotDeleted,
        insertLocalItem,
        deleteLocalItem,
        getLocalLocations,
        getBackendItems,
        postBackendItem,
        putBackendItem,
        deleteBackendItem
    };
}