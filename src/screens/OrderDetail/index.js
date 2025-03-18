import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import BasketDishItem from '../../components/BasketDishItem';
import { useOrderContext } from '../../context/OrderContext';
import OrderDetailHeader from './header';

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params?.id;
  const { getOrder, updateOrderStatus } = useOrderContext();

  useEffect(() => {
    const fetchOrder = async () => {
        setIsLoading(true);
        const orderData = await getOrder(id);
        setOrder(orderData);
        setIsLoading(false);
    };

    fetchOrder();
  }, [id, getOrder]);

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
              setIsLoading(true);
              await updateOrderStatus(id, 'CANCELLED');
              const updatedOrder = await getOrder(id);
              setOrder(updatedOrder);
              Alert.alert("Success", "Your order has been cancelled");
              navigation.goBack();
          }
        }
      ]
    );
  };

  const handleCompleteOrder = () => {
    Alert.alert(
      "Complete Order",
      "Did you receive your order successfully?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          onPress: async () => {
              setIsLoading(true);
              await updateOrderStatus(id, 'COMPLETED');
              const updatedOrder = await getOrder(id);
              setOrder(updatedOrder);
              Alert.alert("Success", "Order marked as completed");
              navigation.goBack();
          }
        }
      ]
    );
  };

  const handlePayOrder = () => {
    // Implementation for payment
    // This function was defined in props but not implemented in the original code
    console.log('Payment functionality to be implemented');
  };

  const renderItem = ({ item }) => (
    <BasketDishItem 
      basketDish={{
        quantity: item.quantity,
        menus: {
          name: item.menu_name,
          price: item.price
        }
      }} 
    />
  );

  const renderFooter = () => {
    if (!order) return null;
    
    const totalPrice = order.dishes.reduce(
      (sum, item) => sum + item.quantity * item.price, 
      0
    );
    
    return (
      <View style={styles.footer}>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            Rp.{totalPrice.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={() => (
        <OrderDetailHeader 
          order={order} 
          onCancelOrder={handleCancelOrder}
          onCompleteOrder={handleCompleteOrder}
          onPay={handlePayOrder}
        />
      )}
      data={order.dishes}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  footer: {
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});

export default OrderDetail;