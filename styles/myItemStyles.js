import { StyleSheet } from "react-native";
export const myItemStyles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 140,
        paddingTop: 6,
        backgroundColor: "#F8FBFA",
    },
    container: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: "flex-start",
        paddingTop: 12,
        paddingHorizontal: 16,
        backgroundColor: "#F8FBFA",
    },
    horizontalListContent: {
        paddingRight: 24,
        paddingLeft: 2,
        paddingTop: 4,
    },
    section: {
        alignSelf: "stretch",
        marginBottom: 18,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#52946B",
        //        color: "#0D1A12",
        marginBottom: 12,
    },
    input: {
        height: 40,
        backgroundColor: "#EAF2EC",
        borderWidth: 0,
        paddingHorizontal: 12,
        color: "#52946B",
        width: "100%",
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
    },
    showimage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginRight: 12,
    },
    cameraimage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 12,
    },
    itembox: {
        marginRight: 12,
    },
    itemboxrow: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#0D1A12",
        marginTop: 6,
    },
    itemCategory: {
        fontSize: 13,
        color: "#52946B",
        marginLeft: 0,
        marginTop: 2,
    },
    categoryButton: {
        height: 40,
        borderRadius: 8,
        marginRight: 10,
        paddingHorizontal: 12,
    },
    categoryContent: {
        height: 40,
        paddingVertical: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryLabel: {
        fontSize: 14,
        lineHeight: 18,
    },
});
