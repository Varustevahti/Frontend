import { StyleSheet } from "react-native";
export const marketStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FBFA',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
    },
    text: {
        color: "#52946B",
        fontSize: 18,
    },
    input: {
        height: 40,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    cameraimage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 5,
        marginRight: 10,
        zIndex: 0,
    },
    itembox: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 3,
        borderWidth: 0,
        borderColor: '#52946B',
        borderStyle: 'dashed',
  
    },
      buttonProfile: {
    backgroundColor: '#52946B',
    marginBottom: 20,
  },
});