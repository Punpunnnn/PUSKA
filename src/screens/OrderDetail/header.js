import { View, Text, StyleSheet, Image} from 'react-native';
import OrderStatusBadge from './badge';

const OrderDetailHeader = ({ order}) => {
  if (!order) {
    return null;
  }

  return (
    <View style={styles.page}>
        <Image
          source={{ uri: order.restaurant.image }}
          style={styles.image}
        />
      <View style={styles.restaurantContainer}>
        
        <Text style={styles.title}>{order.restaurant.title}</Text>
        
        <View style={styles.orderInfoRow}>
          <OrderStatusBadge status={order.status} />
          <Text style={styles.dateInfo}>
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.divider} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
  },
  restaurantContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  image: {
    width: '100%',
    aspectRatio: 5/3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  dateInfo: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
});

export default OrderDetailHeader;