import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OrderStatusBadge from '../../screens/OrderDetail/badge';

const OrderListItem = ({ order }) => {
    const navigation = useNavigation();
    
    if (!order) return null;

    const formattedPrice = order.total?.toLocaleString('id-ID') || '0';
    const formattedDate = order.created_at 
        ? new Date(order.created_at).toDateString() 
        : 'Date unavailable';

    const handlePress = () => {
        navigation.navigate("OrderDetail", { id: order.id });
    };

    const restaurantImage = order.Restaurant?.image;
    const restaurantName = order.Restaurant?.title;

    return (
        <Pressable 
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed
            ]}
        >
            <Image 
                source={{ uri: restaurantImage }}
                style={styles.image}S
            />

            <View style={styles.contentContainer}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurantName}
                </Text>
                <Text style={styles.price}>
                    Rp.{formattedPrice}
                </Text>
                <Text style={styles.date}>
                    {formattedDate}
                </Text>
            </View>
            <OrderStatusBadge status={order.order_status} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: 'white',
        alignItems: 'center'
    },
    pressed: {
        opacity: 0.7,
        backgroundColor: '#f8f8f8'
    },
    image: {
        width: 60,
        height: 60,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0' // Placeholder color while loading
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4
    },
    price: {
        color: '#22C55E',
        fontWeight: '500',
        marginBottom: 4
    },
    date: {
        color: '#6B7280',
        fontSize: 14
    }
});

export default OrderListItem;