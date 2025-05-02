import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePassword';

const OrderStack = createNativeStackNavigator();

const ProfileStackNavigator = () => (
  <OrderStack.Navigator>
    <OrderStack.Screen name="Profiles" component={ProfileScreen} options={{ headerShown: false }} />
    <OrderStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{headerShown: false }}/>
  </OrderStack.Navigator>
);

export default ProfileStackNavigator;
