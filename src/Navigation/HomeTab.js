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
        tabBarActiveTintColor: '#800000',  
        tabBarInactiveTintColor: '#6c757d',  
      })}
    >
      <Tab.Screen
        name="Homes"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Foundation name="home" size={24} color={color} />
          ),
          unmountOnBlur: true,
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();  
            navigation.navigate('Homes', { screen: 'Home' });  
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
            navigation.navigate('Order', { screen: 'Orders' });  
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
