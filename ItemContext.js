import { createContext, useCallback, useContext, useReducer, useMemo } from "react";

// export const Item = { id: string, name: string, description: string, size: string, url: string, location: string, condition: string, category: string};

const DataContext = createContext();
const ActionsContext = createContext();

const initialState = { items: [] };

function reducer(state, action) {
    switch (action.type) {
        case "add":
            return { items: [action.item, ...state.items] };
        case "update":
            return {
                items: state.items.map((i) =>
                    i.id === action.item.id ? { ...i, ...action.item } : i
                ),
            };
        case "remove":
            return {
                items: state.items.filter((i) => i.id !== action.id)
            };
        default:
            return state;
    }
}

export function ItemsProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const addItem = useCallback((item) => dispatch({ type: "add", item }), []);
    const updateItem = useCallback((item) => dispatch({ type: "update", item }), []);
    const removeItem = useCallback((item) => dispatch({ type: "remove", item }), []);

    const data = useMemo(() => state, [state]);
    const actions = useMemo(() => ({ addItem, updateItem, removeItem }),
        [addItem, updateItem, removeItem]);

    return (
        <DataContext.Provider value={data}>
            <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
        </DataContext.Provider>
    );

}

export const useItemsData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useItemsData must be used in ItemsProvider");
    return ctx;
}

export const useItemsActions = () => {
    const ctx = useContext(ActionsContext);
        if (!ctx) throw new Error("useItemsData must be used in ItemsProvider");
    return ctx;
}