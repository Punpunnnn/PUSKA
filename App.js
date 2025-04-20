import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import BasketContextProvider from './src/context/BasketContext';
import OrderContextProvider from './src/context/OrderContext';
import AuthContextProvider from './src/context/AuthContext';
import RatingContextProvider from './src/context/RatingContext';
import { linking } from './src/Navigation/linking';
export default function App() {
  return (
    <AuthContextProvider>
    <NavigationContainer linking={linking}>
      <BasketContextProvider>
      <OrderContextProvider>
      <RatingContextProvider>
      <RootNavigator/>
      </RatingContextProvider>
      </OrderContextProvider>
      </BasketContextProvider>
      <StatusBar style="auto" />
    </NavigationContainer>
    </AuthContextProvider>
  );
}