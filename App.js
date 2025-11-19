import React from "react";
import { useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import ShowItem from "./screens/ShowItem";
import ShowCategory from "./screens/ShowCategory";
import LocationScreen from "./screens/LocationScreen";
import ShowMyItemsScreen from "./screens/ShowMyItemsScreen";
import { PaperProvider } from "react-native-paper";
import { ItemsProvider } from "./ItemContext";
import { SQLiteProvider } from "expo-sqlite";
import { ClerkProvider, ClerkLoaded, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import LogoutButton from "./components/LogOutButton";
import Toast from 'react-native-toast-message';
import MarketScreen from "./screens/MarketScreen";
import ShowMarketItem from "./screens/ShowMarketItem";

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function App() {

  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  // set up database
  const initialize = async (db) => {
    try {
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS myitems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backend_id INT,
        name TEXT,
        location TEXT,
        description TEXT,
        owner TEXT,
        category_id INT,
        group_id INT,
        image TEXT,
        size TEXT,
        on_market_place INT,
        price INT,
        timestamp TEXT,
        deleted INTEGER DEFAULT 0
      );
      `);
      console.log("Database initialized");
    } catch (error) {
      console.error("Could not initialize database", error);
      throw error;
    }

  };

  function Tabs() {
    return (
      <Tab.Navigator theme={MyTheme}
        screenOptions={({ route }) => ({
          headerRight: () => <LogoutButton />,
          tabBarIcon: ({ focused, color, size }) => {
            switch (route.name) {
              case 'My Items':
                return <Foundation name="home" size={size} color={color} />;

              case 'Add Item':
                return <Octicons name="diff-added" size={size} color={color} />;

              case 'Market':
                return <Ionicons name="storefront-outline" size={size} color={color} />;

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
            //           elevation: 1,  // Android-varjo
            //           shadowOpacity: 1, // iOS-varjo
            //           borderBottomWidth: 1,
            //           shadowColor: "#52946B",
          },
          //         headerTintColor: "#0D1A12",

          tabBarStyle: {
            backgroundColor: "#F8FBFA",
            height: 80,
            paddingBottom: 0,
            paddingTop: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 15,
          },
          tabBarLabelStyle: {
            marginBottom: 5,
          },
          tabBarActiveTintColor: "#0D1A12",
          tabBarInactiveTintColor: "#52946B",
        })}
      >
        <Tab.Screen name="My Items" component={MyItemsScreen} />
        <Tab.Screen name="Add Item" component={AddItemScreen} />
        <Tab.Screen name="Market" component={MarketScreen} />
        <Tab.Screen name="Groups" component={GroupsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />

      </Tab.Navigator>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SQLiteProvider
          databaseName="myitemsdb7.db"
          onInit={initialize}
          onError={error => console.error("Could not open database", error)}
        >
          <ItemsProvider>
            <PaperProvider>
              <NavigationContainer>
                <SignedIn>

                  <Stack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }} >
                    <Stack.Screen
                      name="Back"
                      component={Tabs}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="ShowItem"
                      component={ShowItem}
                      options={{
                        title: 'Edit item',        // haluamasi otsikko
                        headerBackTitleVisible: false,
                        // jos haluat ilman yläreunan headeria:
                        // headerShown: false,
                        // tai modaalina iOS-tyyliin:
                        // presentation: 'modal',
                      }} />
                    <Stack.Screen
                      name="ShowMarketItem"
                      component={ShowMarketItem}
                      options={{
                        title: 'View item',        // haluamasi otsikko
                        headerBackTitleVisible: false,
                        // jos haluat ilman yläreunan headeria:
                        // headerShown: false,
                        // tai modaalina iOS-tyyliin:
                        // presentation: 'modal',
                      }} />
                    <Stack.Screen
                      name="ShowCategory"
                      component={ShowCategory}
                      options={{
                        title: 'Items by category',        // haluamasi otsikko
                        headerBackTitleVisible: false,
                        // jos haluat ilman yläreunan headeria:
                        // headerShown: false,
                        // tai modaalina iOS-tyyliin:
                        // presentation: 'modal',
                      }} />
                    <Stack.Screen
                      name="LocationScreen"
                      component={LocationScreen}
                      options={{
                        title: 'Items by category',        // haluamasi otsikko
                        headerBackTitleVisible: false,
                        // jos haluat ilman yläreunan headeria:
                        // headerShown: false,
                        // tai modaalina iOS-tyyliin:
                        // presentation: 'modal',
                      }} />
                    <Stack.Screen
                      name="ShowMyItemsScreen"
                      component={ShowMyItemsScreen}
                      options={{
                        title: 'My Items',        // haluamasi otsikko
                        headerBackTitleVisible: false,
                        // jos haluat ilman yläreunan headeria:
                        // headerShown: false,
                        // tai modaalina iOS-tyyliin:
                        // presentation: 'modal',
                      }} />



                  </Stack.Navigator>
                </SignedIn>
                <SignedOut>
                  <AuthStack.Navigator screenOptions={{
                    headerTitleAlign: 'center',
                    headerShadowVisible: false,
                  }} >
                    <AuthStack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign in' }} />
                    <AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
                  </AuthStack.Navigator>
                </SignedOut>
              </NavigationContainer>
              <Toast position="bottom" />
            </PaperProvider>
          </ItemsProvider>
        </SQLiteProvider>
      </ClerkLoaded>
    </ClerkProvider>

  );
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFA',
    color: '0D1A12',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

