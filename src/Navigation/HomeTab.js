import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Foundation } from '@expo/vector-icons';
import HomeStackNavigator from './HomeStack';
import OrderStackNavigator from './OrderStack';
import ProfileStackNavigator from './ProfileStack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const HomeTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: ((route) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "";

          if (routeName === "ChangePassword" || routeName === "OrderDetail") {
            return { display: "none" };
          }
          return { display: "flex" };
        })(route),
        tabBarActiveTintColor: '#800000', // Active tab color
        tabBarInactiveTintColor: '#6c757d', // Inactive tab color
      })}
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
            e.preventDefault(); // Prevent tab switch before logic runs
            navigation.navigate('Hello', { screen: 'Home' }); // Navigate to Home screen in HomeStack
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
            navigation.navigate('Order', { screen: 'Orders' }); // Navigate to Orders in OrderStack
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
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
