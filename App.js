import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Ionicons from "@expo/vector-icons/Ionicons";
import Foundation from "@expo/vector-icons/Foundation";
import Octicons from "@expo/vector-icons/Octicons";

import MyItemsScreen from "./screens/MyItemsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import SearchScreen from "./screens/SearchScreen";
import GroupsScreen from "./screens/GroupsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LocationScreen from "./screens/LocationScreen";
import ShowItem from "./screens/ShowItem";

import { PaperProvider } from "react-native-paper";
import { SQLiteProvider } from "expo-sqlite";

import { ClerkProvider, ClerkLoaded, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LogoutButton from "./components/LogOutButton";

import Toast from "react-native-toast-message";

// ---- Navigaattorit ----
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ---- Clerk avain (Expo env) ----
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// ---- SQLite init ----
const initialize = async (db) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS myitems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        image TEXT,
        description TEXT,
        owner TEXT,
        location TEXT,
        size TEXT,
        category_id INT,
        group_id INT
      );
    `);
  } catch (error) {
    console.error("Could not initialize database", error);
    throw error;
  }
};

// ---- Tab-näkymä ----
function Tabs() {
  return (
    <Tab.Navigator
      theme={MyTheme}
      screenOptions={({ route }) => ({
        headerRight: () => <LogoutButton />,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "My Items":
              return <Foundation name="home" size={size} color={color} />;
            case "Add Item":
              return <Octicons name="diff-added" size={size} color={color} />;
            case "Search":
              return <Ionicons name="search" size={size} color={color} />;
            case "Groups":
              return <Ionicons name="people" size={size} color={color} />;
            case "Profile":
              return <Ionicons name="person" size={size} color={color} />;
            case "Locations":
              // voit vaihtaa halutessasi esim. "map"
              return <Ionicons name="home" size={size} color={color} />;
            default:
              return null;
          }
        },
        sceneContainerStyle: { backgroundColor: "#F8FBFA" },
        headerStyle: {
          backgroundColor: "#F8FBFA",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          shadowColor: "#52946B",
        },
        headerTintColor: "#0D1A12",
        tabBarStyle: {
          backgroundColor: "#F8FBFA",
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 15,
        },
        tabBarLabelStyle: {
          marginBottom: 10,
        },
        tabBarActiveTintColor: "#0D1A12",
        tabBarInactiveTintColor: "#52946B",
      })}
    >
      <Tab.Screen name="My Items" component={MyItemsScreen} />
      <Tab.Screen name="Add Item" component={AddItemScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Locations" component={LocationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ---- App ----
export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SQLiteProvider
          databaseName="myitemsdb.db"
          onInit={initialize}
          onError={(error) => console.error("Could not open database", error)}
        >
          <PaperProvider>
            <NavigationContainer>
              <SignedIn>
                <Stack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
                  <Stack.Screen name="Back" component={Tabs} options={{ headerShown: false }} />
                  <Stack.Screen
                    name="ShowItem"
                    component={ShowItem}
                    options={{
                      title: "Edit item",
                      headerBackTitleVisible: false,
                    }}
                  />
                </Stack.Navigator>
              </SignedIn>

              <SignedOut>
                <Stack.Navigator
                  screenOptions={{
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                  }}
                >
                  <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: "Sign in" }} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "Create account" }} />
                </Stack.Navigator>
              </SignedOut>
            </NavigationContainer>
            <Toast position="bottom" />
          </PaperProvider>
        </SQLiteProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

// ---- Teema ----
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFA",
    color: "0D1A12",
    alignItems: "center",
    justifyContent: "center",
  },
});