import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Alert } from "react-native";
import { Button } from "react-native-paper";
import Constants from "expo-constants";
import { useUser } from "@clerk/clerk-expo";
import { buildUserHeaders } from "../utils/apiHeaders";

function resolveBaseURL() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || Constants?.expoConfig?.extra?.apiUrl;
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/$/, "");
  const { manifest2, manifest } = Constants ?? {};
  const hostCandidate = manifest2?.debuggerHost || manifest?.debuggerHost || manifest2?.hostUri || manifest?.hostUri || "";
  const host = hostCandidate.replace(/^exp:\/\//, "").replace(/^https?:\/\//, "").split(":")[0];
  return host ? `http://${host}:8000` : null;
}

export default function GroupsScreen() {
  const baseURL = useMemo(() => resolveBaseURL(), []);
  const { user } = useUser();

  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const headers = buildUserHeaders(user);
  console.log("🔎 Groups headers:", headers);

  const loadGroups = async () => {
    try {
      if (!baseURL) return;
      const res = await fetch(`${baseURL}/groups/my`, { headers });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to load groups");
      }
      setGroups(await res.json());
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  };

  useEffect(() => { loadGroups(); }, [baseURL, user?.id]);

  const createGroup = async () => {
    try {
      if (!newGroup.trim()) return;
      const res = await fetch(`${baseURL}/groups/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: newGroup.trim() }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to create group");
      }
      setNewGroup("");
      await loadGroups();
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  };

  const invite = async () => {
    try {
      if (!selectedGroupId || !inviteEmail.trim()) return;
      const res = await fetch(`${baseURL}/groups/${selectedGroupId}/invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to invite");
      }
      setInviteEmail("");
      Alert.alert("Success", "Invitation sent / member added");
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="New group name"
          value={newGroup}
          onChangeText={setNewGroup}
          placeholderTextColor="#52946B"
        />
        <Button mode="contained" onPress={createGroup}>Create</Button>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => String(g.id)}
        renderItem={({ item }) => (
          <View style={styles.groupRow}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Button
              compact
              onPress={() => setSelectedGroupId(item.id)}
              mode={selectedGroupId === item.id ? "contained" : "outlined"}
            >
              Select
            </Button>
          </View>
        )}
      />

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Invite by email"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholderTextColor="#52946B"
        />
        <Button mode="contained" onPress={invite} disabled={!selectedGroupId}>Invite</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFA", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0D1A12", marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  input: {
    flex: 1, height: 44, backgroundColor: "#EAF2EC", borderRadius: 8, paddingHorizontal: 10, color: "#52946B",
  },
  groupRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  groupName: { fontSize: 18, color: "#0D1A12" },
});