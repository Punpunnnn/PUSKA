import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Foundation } from '@expo/vector-icons';
import HomeStackNavigator from './HomeStack';
import OrderStackNavigator from './OrderStack';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const HomeTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarActiveTintColor: 'maroon',
        tabBarInactiveTintColor: 'grey',
      }}
    >
      <Tab.Screen
        name="Hello"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Foundation name="home" size={24} color={color} />
          ),
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault(); // Mencegah tab untuk berpindah sebelum logika kita dijalankan
            navigation.navigate('Hello', { screen: 'Home' }); // Navigasi ke screen Home dalam HomeStack
          },
        })}
      />
      <Tab.Screen
        name="Order"
        component={OrderStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Foundation name="shopping-cart" size={24} color={color} />
          ),
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Order', { screen: 'Orders' }); // Navigasi ke Orders dalam OrderStack
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTab;
