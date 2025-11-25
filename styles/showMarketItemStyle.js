import { StyleSheet } from "react-native";
export const showMarketItemStyles = StyleSheet.create({
     button: {
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: '',
        paddingTop: 10,
        paddingRight: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    text: {
        color: "#52946B",
        fontSize: 15,
        padding: 5,
    },
    text2: {
        color: "#52946B",
        fontSize: 25,
        padding: 5,
    },
    cameraimage: {
        aspectRatio: 1.5,
        height: '200',
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    itembox: {
        alignItems: 'center',
    },
    textinput: {
        width: '90%',
        fontSize: 15,
        backgroundColor: '#EAF2EC', // kevyt vihertävä tausta esim.
        color: '#52946B',
        marginVertical: 6,
        alignSelf: 'center',
    },
    input: {
        height: 45,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        marginVertical: 4,
        borderRadius: 5,
    },
    inputdescription: {
        height: 70,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',

        justifyContent: 'space-around',
        margin: 4,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        textAlignVertical: 'top',
    },
    dropdown: {
        backgroundColor: '#EAF2EC',
        borderColor: '#52946B',
        borderWidth: 0,
        borderRadius: 8,
        minHeight: 45,
    },
    dropdownContainer: {
        backgroundColor: '#F8FBFA',
        borderColor: '#52946B',
        borderWidth: 1,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 16,
        color: '#52946B',
    },
    dropdownPlaceholder: {
        color: '#777',
        fontStyle: 'italic',
    },
    dropdownItemContainer: {
        paddingVertical: 10,
    },
    dropdownItemLabel: {
        color: '#333',
        fontSize: 16,
    },
    dropdownSelectedItemLabel: {
        fontWeight: 'bold',
        color: '#52946B',
    },
    dropdownArrow: {
        tintColor: '#52946B',
    },
    dropdownTick: {
        tintColor: '#52946B',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 12,
        paddingBottom: 220,

    },
});