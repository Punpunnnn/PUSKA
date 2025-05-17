import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/Navigation';
import { NavigationContainer } from '@react-navigation/native';
import BasketContextProvider from './src/context/BasketContext';
import OrderContextProvider from './src/context/OrderContext';
import AuthContextProvider from './src/context/AuthContext';
import RatingContextProvider from './src/context/RatingContext';
export default function App() {
  return (
    <SafeAreaProvider>
    <AuthContextProvider>
    <NavigationContainer>
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
    </SafeAreaProvider>
  );
}