import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Foundation from '@expo/vector-icons/Foundation';
import Octicons from '@expo/vector-icons/Octicons';
import MyItemsScreen from "./screens/MyItemsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import SearchScreen from "./screens/SearchScreen";
import GroupsScreen from "./screens/GroupsScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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

          sceneContainerStyle: { backgroundColor: "#E8F2ED" },
          headerStyle: {
            backgroundColor: "#E8F2ED",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: "#0D1A12",

          tabBarStyle: {
            backgroundColor: "#E8F2ED",
            height: 120,
            paddingBottom: 10,
            paddigTop: 10,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2ED',
    color: '0D1A12',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

