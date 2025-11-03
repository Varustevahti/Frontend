
import { baseURL } from '../config';

// not working yet 
   console.log("Updating existing item to backend with id:", backend_id ? backend_id : "new item");
                let integeritemid = parseInt(backend_id, 10);
                console.log("Parsed item id:", integeritemid);
                console.log("Item details:", { itemName, location, description, owner_id, category_id, group_id, size, timestamp, on_market_place, price, deleted});
                const payload = {
                    name: itemName,
                    location: location,
                    desc: description,
                    owner: owner_id,
                    category_id: Number(category_id) || 0,
                    group_id: Number(group_id) || 0,
                    size: size,
                    timestamp: timestamp,
                    on_market_place: on_market_place,
                    price: price,
                    deleted: deleted
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
                    aikaleima = data.timestamp;
                    setTimestamp(aikaleima);
                }