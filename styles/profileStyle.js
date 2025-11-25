import { StyleSheet } from "react-native";
export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  showimage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 7,
    zIndex: 0,
  },
  text: {
    color: "#52946B",
    fontSize: 18,
  },
  buttonProfile: {
    backgroundColor: '#52946B',
    marginBottom: 10,
  },
  camerabutton: {
    backgroundColor: '#EAF2EC',
    color: '#0D1A12',
    fontWeight: 'bold',
    padding: 5,
    marginTop: 0,
    marginBottom: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,

  },
  camerabuttontext: {
    backgroundColor: '#EAF2EC',
    color: '#52946B',
    fontWeight: 'bold',
    padding: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});