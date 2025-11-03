import React, { useState, useEffect } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useItemsData } from "../ItemContext";

export default function CategoryPicker({ category_id, setCategory_id }) {
    const { categories } = useItemsData();   // get categories from context
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(category_id?.toString() || null);

    // if category_id changes from parent, update local value
    useEffect(() => {
        setValue(category_id?.toString() || null);
    }, [category_id]);

    return (
        <View style={{ zIndex: 1000, width: "100%", marginVertical: 10 }}>
            <DropDownPicker
                open={open}
                value={value}
                items={categories || []}
                setOpen={setOpen}
                setValue={setValue}
                // when value changes, update both local and parent state
                onChangeValue={(val) => {
                    console.log("Selected category id:", val);
                    setCategory_id(Number(val));
                }}
                placeholder="Valitse kategoria"
                listMode="SCROLLVIEW"
                style={{
                    backgroundColor: "#EAF2EC",
                    borderColor: "#52946B",
                    borderWidth: 0,
                    borderRadius: 8,
                    minHeight: 45,
                }}
                dropDownContainerStyle={{
                    backgroundColor: "#F8FBFA",
                    borderColor: "#52946B",
                    borderWidth: 1,
                    borderRadius: 8,
                }}
                textStyle={{
                    fontSize: 16,
                    color: "#52946B",
                }}
                placeholderStyle={{
                    color: "#777",
                    fontStyle: "italic",
                }}
                listItemContainerStyle={{
                    paddingVertical: 10,
                }}
                selectedItemLabelStyle={{
                    fontWeight: "bold",
                    color: "#52946B",
                }}
            />
        </View>
    );
}

