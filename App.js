import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import Octicons from '@expo/vector-icons/Octicons';
import MyItemsScreen from "./screens/MyItemsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import SearchScreen from "./screens/SearchScreen";
import GroupsScreen from "./screens/GroupsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { PaperProvider } from "react-native-paper";
import { ItemsProvider } from "./ItemContext";
import { SQLiteProvider } from "expo-sqlite";
import * as SQLite from 'expo-sqlite';

const Tab = createBottomTabNavigator();

// const db = SQLite.openDatabaseSync('myitems.db');

export default function App() {


  // set up database
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

  return (
    <SQLiteProvider
      databaseName="myitemsdb.db"
      onInit={initialize}
      onError={error => console.error("Could not open database", error)}
    >
      <ItemsProvider>
        <PaperProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  switch (route.name) {
                    case 'My Items':
                      return <Foundation name="home" size={size} color={color} />;

                    case 'Add Item':
                      return <Octicons name="diff-added" size={size} color={color} />;

                    case 'Search':
                      return <Ionicons name="search" size={size} color={color} />;

                    case 'Groups':
                      return <Ionicons name="people" size={size} color={color} />;

                    case 'Profile':
                      return <Ionicons name="person" size={size} color={color} />;

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
                },
                headerTintColor: "#0D1A12",

                tabBarStyle: {
                  backgroundColor: "#F8FBFA",
                  height: 80,
                  paddingBottom: 10,
                  paddignTop: 10,
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
              <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
          </NavigationContainer >
        </PaperProvider>
      </ItemsProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    color: '0D1A12',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

