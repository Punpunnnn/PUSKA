// navigation/OrderStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Order from '../screens/OrderScreen';
import OrderDetail from '../screens/OrderDetail';

const OrderStack = createNativeStackNavigator();

const OrderStackNavigator = () => (
  <OrderStack.Navigator>
    <OrderStack.Screen name="Orders" component={Order} options={{ headerShown: false }} />
    <OrderStack.Screen name="OrderDetail" component={OrderDetail} />
  </OrderStack.Navigator>
);

export default OrderStackNavigator;
