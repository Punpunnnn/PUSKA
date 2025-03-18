import { View, Text, StyleSheet, FlatList, Pressable, TextInput, SafeAreaView, ScrollView } from 'react-native';
import BasketDishItem from '../../components/BasketDishItem';
import { useState, useCallback, useMemo } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useOrderContext } from '../../context/OrderContext';
import { useBasketContext } from '../../context/BasketContext';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const Basket = () => {
  const { restaurant, basketDishes, totalPrice, clearBasket } = useBasketContext();
  const { createOrder, notes, updateNotes, paymentMethod, updatePaymentMethod } = useOrderContext();
  const navigation = useNavigation();
  const { dbUser, setDbUser } = useAuthContext();
  const [userCoins, setUserCoins] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [isUsingCoins, setIsUsingCoins] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (dbUser?.coins !== undefined && dbUser.coins !== userCoins) {
      setUserCoins(dbUser.coins || 0);
    }
  }, [dbUser])
);

const discountedPrice = useMemo(() => Math.max(0, totalPrice - coinsToUse), [totalPrice, coinsToUse]);

const toggleCoinUsage = () => {
  setIsUsingCoins(prev => !prev);
  setCoinsToUse(prev => (prev > 0 ? 0 : Math.min(userCoins, totalPrice)));
};

const updatePuskacoin = async (newCoins) => {
  setUserCoins(newCoins);
  
  // Update Supabase
  if (dbUser) {
    const { error } = await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('id', dbUser.id);
      
    if (error) {
      console.error('Error updating coins:', error);
      return;
    }
    
    // Update local context state
    setDbUser({
      ...dbUser,
      coins: newCoins
    });
  }
};

  const onCreateOrder = async () => {
    if (isUsingCoins) await updatePuskacoin(userCoins - coinsToUse);
    await createOrder(discountedPrice);
    navigation.navigate(paymentMethod === 'QRIS' ? 'QRISPayment' : 'HomeOrders');
  };

  const onClearBasket = () => {
    clearBasket();
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollableContent}>
        <Text style={styles.name}>{restaurant?.title}</Text>
        <FlatList
          data={basketDishes}
          renderItem={({ item }) => <BasketDishItem basketDish={item} />}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          {['CASH', 'QRIS'].map((method) => (
            <Pressable 
              key={method}
              style={[styles.paymentOption, paymentMethod === method && styles.selectedPayment]}
              onPress={() => updatePaymentMethod(method)}>
              <Text style={styles.paymentText}>{method}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>PUSKACoin (Saldo: {userCoins})</Text>
          <Pressable style={[styles.toggleButton, isUsingCoins && styles.toggleActive]} onPress={toggleCoinUsage}>
            <View style={[styles.toggleCircle, isUsingCoins && styles.toggleCircleActive]} />
          </Pressable>
        </View>

        <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput style={styles.notesInput} placeholder="Tambahkan notes (opsional)" value={notes} onChangeText={updateNotes} />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.totalPrice}>Rp.{discountedPrice.toLocaleString('id-ID')}</Text>
        <Pressable onPress={onCreateOrder} style={styles.buttonyes}><Text style={styles.buttonText}>Place Order</Text></Pressable>
        <Pressable onPress={onClearBasket} style={styles.buttonno}><Text style  ={styles.buttonText}>Clear Basket</Text></Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollableContent: { flex: 1, paddingHorizontal: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  sectionContainer: { marginBottom: 20 },
  paymentOption: { padding: 12, borderRadius: 8, backgroundColor: '#f0f0f0', marginVertical: 4, alignItems: 'center' },
  selectedPayment: { backgroundColor: '#4CAF50', color: 'white' },
  toggleButton: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#e0e0e0', padding: 2 },
  toggleActive: { backgroundColor: '#4caf50' },
  toggleCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white' },
  toggleCircleActive: { transform: [{ translateX: 22 }] },
  coinInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 16, textAlign: 'center' },
  notesInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, textAlignVertical: 'top' },
  footer: { borderTopWidth: 1, borderTopColor: '#e0e0e0', padding: 16 },
  totalPrice: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  buttonyes: { backgroundColor: '#4CAF50', padding: 16, alignItems: 'center', marginBottom: 8, borderRadius: 4 },
  buttonno: { backgroundColor: '#f44336', padding: 16, alignItems: 'center',borderRadius: 4},
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Basket;