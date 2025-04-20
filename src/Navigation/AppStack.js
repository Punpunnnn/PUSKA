// navigation/AppStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTab from './HomeTab';

const Stack = createNativeStackNavigator();

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Hometab" component={HomeTab} />
  </Stack.Navigator>
);

export default AppStack;
