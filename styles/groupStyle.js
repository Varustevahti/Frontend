import { StyleSheet } from "react-native";
export const groupStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFA", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0D1A12", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  input: {
    flex: 1, height: 44, backgroundColor: "#EAF2EC", borderRadius: 8, paddingHorizontal: 10, color: "#52946B",
  },
  groupRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  groupName: { fontSize: 18, color: "#0D1A12" },
});