import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Homescreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import DishDetailsScreen from '../screens/DishDetail';
import Basket from '../screens/BasketScreen';
import Order from '../screens/OrderScreen';
import OrderDetail from '../screens/OrderDetail';
import ProfileScreen from '../screens/ProfileScreen';
import { AntDesign, Foundation } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignUpScreen';
import QRISPaymentScreen from '../screens/payment';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Hometab'>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Hometab" component={HomeTab} />
        </Stack.Navigator>
    );
};

const Tab = createBottomTabNavigator();

const HomeTab = () => {
    return (
        <Tab.Navigator 
            screenOptions={{ 
                headerShown: false,
                tabBarStyle:{
                    backgroundColor:'white',
                },
                tabBarActiveTintColor:'maroon',
                tabBarInactiveTintColor:'grey'
            }}
        >
            <Tab.Screen 
                name="Hello" 
                component={HomeStackNavigator} 
                options={{
                    tabBarIcon: ({ color }) => (<Foundation name="home" size={24} color={color} />),
                    unmountOnBlur: true,
                }} 
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        // Prevent default action
                        e.preventDefault();
                        // Reset the stack to first screen
                        navigation.navigate('Hello', { screen: 'Home' });
                    },
                })}
            />
            <Tab.Screen 
                name="Order" 
                component={OrderStackNavigator} 
                options={{
                    tabBarIcon: ({ color}) => (<Foundation name="shopping-cart" size={24} color={color}/>),
                    unmountOnBlur: true,
                }} 
                listeners={({ navigation }) => ({
                    tabPress: e => {
                        // Prevent default action
                        e.preventDefault();
                        // Reset the stack to first screen
                        navigation.navigate('Order', { screen: 'Orders' });
                    },
                })}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                    headerShown: true,
                    tabBarIcon: ({ color}) => (<AntDesign name="user" size={24} color={color}/>),
                }}
            />
        </Tab.Navigator>
    );
}

const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Home" component={Homescreen}
                options={{headerShown: false}} />
            <HomeStack.Screen 
                name="Restaurant" 
                component={RestaurantDetailScreen}
                options={{headerShown: false}} 
            />
            <HomeStack.Screen name="Dish" component={DishDetailsScreen} />
            <HomeStack.Screen name="Basket" component={Basket} />
            <HomeStack.Screen name="Orders" component={Order} options={{headerShown: false, title: "Orders"}} />
            <HomeStack.Screen name="OrderDetail" component={OrderDetail} />
            <HomeStack.Screen name="QRISPayment" component={QRISPaymentScreen}
                options={{headerShown: false}} />
        </HomeStack.Navigator>
    );
}

const OrderStack = createNativeStackNavigator();
const OrderStackNavigator = () => {
    return (
        <OrderStack.Navigator>
            <OrderStack.Screen name="Orders" component={Order} options={{headerShown: false, title: "Orders"}} />
            <OrderStack.Screen name="OrderDetail" component={OrderDetail} o />
        </OrderStack.Navigator>
    );
};

export default RootNavigator;