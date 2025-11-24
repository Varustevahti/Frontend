import { StyleSheet } from "react-native";
export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    alignItems: 'center',
    justifyContent: 'center',
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
});