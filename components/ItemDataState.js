import { useState } from "react";


// if you submit initialOwnerId that will be the owner id. Otherwise it will be null
export function useItemData(initialOwnerId = null) {
    const [itemData, setItemData] = useState({
        id: null,
        backend_id: null,
        name: "",
        location: "",
        description: "",
        owner: "",
        category_id: 0,
        group_id: 0,
        image: "",
        size: "",
        on_market_place: 0,
        price: 0,
        timestamp: null,
        deleted: 0,
    });

    // used for saving item data olioon
    const updateItemData = (updates) => {
        console.log("updating data");
        setItemData((prev) => ({ ...prev, ...updates }));
        console.log("data updated, ehkä??");
    }

    // used for clearing item data from olio
    const clearItemData = () => {
        setItemData({
        id: null,
        backend_id: null,
        name: "",
        location: "",
        description: "",
        owner: initialOwnerId,
        category_id: 0,
        group_id: 0,
        image: "",
        size: "",
        on_market_place: 0,
        price: 0,
        timestamp: null,
        deleted: 0,
        });
    };

    return { itemData, updateItemData, clearItemData };
}