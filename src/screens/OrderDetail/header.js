import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderStatusBadge from './badge';

const OrderDetailHeader = ({ order, onCancelOrder, onCompleteOrder, onPay }) => {
  if (!order) {
    return null;
  }

  const renderActionButtons = () => {
    return (
      <View style={styles.actionsContainer}>
        {order.order_status === 'PENDING' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onPay}
          >
            <Ionicons name="close-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Pay</Text>
          </TouchableOpacity>
        )}

        {order.order_status === 'NEW' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancelOrder}
          >
            <Ionicons name="close-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {order.order_status === 'READY_TO_PICKUP' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={onCompleteOrder}
          >
            <Ionicons name="checkmark-circle" size={18} color="white" />
            <Text style={styles.buttonText}>Complete Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.page}>
        <Image
          source={{ uri: order.restaurant.image }}
          style={styles.image}
        />
      <View style={styles.restaurantContainer}>
        
        <Text style={styles.title}>{order.restaurant.title}</Text>
        
        <View style={styles.orderInfoRow}>
          <OrderStatusBadge status={order.order_status} />
          <Text style={styles.dateInfo}>
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {renderActionButtons()}
        
        <View style={styles.divider} />
        <Text style={styles.menuTitle}>Your Order</Text>
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
  actionsContainer: {
    marginVertical: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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