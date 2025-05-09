import { View, Text, Alert, FlatList, Pressable, TextInput, SafeAreaView, ScrollView, Image } from 'react-native';
import BasketDishItem from '../../components/BasketDishItem';
import { useState, useCallback, useMemo } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useOrderContext } from '../../context/OrderContext';
import { useBasketContext } from '../../context/BasketContext';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { styles } from './style';

const Basket = () => {
  const { basketDishes, totalPrice, clearBasket } = useBasketContext();
  const { createOrder, notes, updateNotes, paymentMethod, updatePaymentMethod } = useOrderContext();
  const navigation = useNavigation();
  const { profile, setDbUser } = useAuthContext();
  const [userCoins, setUserCoins] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [isUsingCoins, setIsUsingCoins] = useState(false);

useFocusEffect(
  useCallback(() => {
    if (profile?.coins !== undefined && profile.coins !== userCoins) {
      setUserCoins(profile.coins || 0);
    }
  }, [profile])
);

const discountedPrice = useMemo(() => Math.max(0, totalPrice - coinsToUse), [totalPrice, coinsToUse]);

const toggleCoinUsage = () => {
  if (totalPrice < 10000) {
    Alert.alert('Tidak Bisa Menggunakan Koin', 'Minimal belanja Rp 10.000 untuk pakai koin.');
    return;
  }
  
  setIsUsingCoins(prev => !prev);
  if (!isUsingCoins) {
    setCoinsToUse(Math.min(userCoins, Math.floor(totalPrice * 0.1)));  
  } else {
     
    setCoinsToUse(0);
  }
};


const updatePuskacoin = async (newCoins) => {
  setUserCoins(newCoins);
  
   
  if (profile) {
    const { error } = await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('id', profile.id);
      
    if (error) {
      console.error('Error updating coins:', error);
      return;
    }
    
     
    setDbUser({
      ...profile,
      coins: newCoins
    });
  }
};

const onCreateOrder = async () => {
  try {
     
    const maxCoinAllowed = Math.floor(totalPrice * 0.1);
    const coinsToUse = Math.min(userCoins, maxCoinAllowed);
    if (isUsingCoins && coinsToUse > 0) {
      await updatePuskacoin(userCoins - coinsToUse);
    }
    const newOrder = await createOrder(discountedPrice);
    if (newOrder) {
       
      navigation.reset({
        index: 0,
        routes: [{ name: paymentMethod === 'QRIS' ? 'QRISPayment' : 'Orders' }],
      });
    }
  } catch (error) {
    console.error("Error in onCreateOrder:", error);
    Alert.alert("Error", "Terjadi kesalahan saat membuat pesanan.");
  }
};

  const onClearBasket = () => {
    clearBasket();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollableContent}>
        <Text style={styles.sectionTitle}>Daftar Pesanan</Text>
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
  <Text style={styles.sectionTitle}>PUSKACoin</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image style={{width: 48, height: 48}} source={require('../../../assets/puskaCoin.png')} />
      <Text style={{marginLeft: 5, fontWeight: 'bold', fontSize: 16}}>Saldo: {userCoins}</Text>
    </View>

    <Pressable
      style={[styles.toggleButton, isUsingCoins && styles.toggleActive]}
      onPress={toggleCoinUsage}
    >
      <View style={[styles.toggleCircle, isUsingCoins && styles.toggleCircleActive]} />
    </Pressable>
  </View>
  {totalPrice < 10000 && (
  <Text style={{ color: 'gray', fontSize: 12 }}>
    Belanja minimal Rp 10.000 untuk pakai koin
  </Text>
)}
</View>


        <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Catatan</Text>
          <TextInput style={styles.notesInput} placeholder="Tambahkan catatan (opsional)" value={notes} onChangeText={updateNotes} />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.totalPrice}>Rp.{discountedPrice.toLocaleString('id-ID')}</Text>
        <Pressable onPress={onCreateOrder} style={styles.buttonyes}><Text style={styles.buttonText}>Buat Pesanan</Text></Pressable>
        <Pressable onPress={onClearBasket} style={styles.buttonno}><Text style  ={styles.buttonText}>Hapus Keranjang</Text></Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Basket;