import { View, Text, StyleSheet } from 'react-native';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING':
        return 'purple';  
      case 'NEW':
        return '#2196f3';  
      case 'COOKING':
        return '#ff9800';  
      case 'READY_FOR_PICKUP':
        return '#008a65';  
      case 'COMPLETED':
        return '#8bc34a';  
      case 'CANCELLED':
        return '#f44336';  
      case 'EXPIRED':
        return 'gray';  
      default:
        return '#9e9e9e';  
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default OrderStatusBadge;