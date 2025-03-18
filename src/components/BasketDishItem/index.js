import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BasketDishItem = ({ basketDish }) => {
  return (
    <View style={styles.row}>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{basketDish.quantity}</Text>
      </View>
      
      <View style={styles.dishInfoContainer}>
        <Text style={styles.dishName}>{basketDish.menus?.name}</Text>
        <Text style={styles.price}>
          Rp.{(basketDish.quantity * basketDish.menus?.price).toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  quantityContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityText: {
    fontWeight: '700',
    fontSize: 14,
  },
  dishInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishName: {
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  price: {
    fontWeight: '500',
    fontSize: 14,
    color: '#2e7d32',
  },
});

export default BasketDishItem;