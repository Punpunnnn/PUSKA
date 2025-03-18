import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import BasketContextProvider from './src/context/BasketContext';
import OrderContextProvider from './src/context/OrderContext';
import AuthContextProvider from './src/context/AuthContext';
export default function App() {
  return (
    <NavigationContainer>
      <AuthContextProvider>
      <BasketContextProvider>
      <OrderContextProvider>
      <RootNavigator/>
      </OrderContextProvider>
      </BasketContextProvider>
      </AuthContextProvider>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}