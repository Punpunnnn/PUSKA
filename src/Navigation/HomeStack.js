// navigation/HomeStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homescreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import DishDetailsScreen from '../screens/DishDetail';
import Basket from '../screens/BasketScreen';
import Order from '../screens/OrderScreen';
import OrderDetail from '../screens/OrderDetail';
import QRISPaymentScreen from '../screens/payment';
import RestaurantReviewScreen from '../screens/review';

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={Homescreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Restaurant" component={RestaurantDetailScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="RestaurantReview" component={RestaurantReviewScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="Dish" component={DishDetailsScreen} />
    <HomeStack.Screen
      name="Basket"
      component={Basket}
      options={({ route }) => ({
        title: route.params?.restaurantTitle || 'Basket',
      })}
    />
    <HomeStack.Screen name="Orders" component={Order} options={{ headerShown: false, title: "Orders" }} />
    <HomeStack.Screen name="OrderDetail" component={OrderDetail} />
    <HomeStack.Screen name="QRISPayment" component={QRISPaymentScreen} options={{ headerShown: false }} />
  </HomeStack.Navigator>
);

export default HomeStackNavigator;
