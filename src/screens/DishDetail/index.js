import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {useNavigation,useRoute} from '@react-navigation/native';
import { useBasketContext } from '../../context/BasketContext';
import { supabase } from '../../lib/supabase';
const DishDetailsScreen = () => {
  const navigation = useNavigation();
  const [menu, setMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addDishToBasket } = useBasketContext();
  const route = useRoute();
  const id = route.params?.id;

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('menus')
        .select()
        .eq('id', id)
        .single(); // Use .single() to get a single object

      if (error) {
        console.error("Error fetching menu:", error);
        Alert.alert("Error", "Could not fetch menu data.");
      } else {
        setMenu(data);
      }
    };

    fetchMenu();
  }, [id]);

  const onAddToBasket = async () => {
    console.log('onAddToBasket called');
      await addDishToBasket(menu, quantity);
      console.log('Item added to basket, navigating back');
      navigation.goBack();
  };


  const onMinus = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const onPlus = () => {
    setQuantity(quantity + 1);
  };

  const getTotal = () => {
    return (menu?.price * quantity); // Use optional chaining
  };

  // Conditional rendering to avoid accessing properties of null
  if (!menu) {
    return (
      <View style={styles.page}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
        <Image source={{ uri: menu.image }} style={styles.image} />
        <View style={styles.top}>
        <Text style={styles.name}>{menu.name}</Text>
        <Text style={styles.description}>{menu.description}</Text>
        <Text style={styles.price}>Rp.{menu.price.toLocaleString("id-ID")}</Text>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.bottomContainer}>
        <View style={styles.quantityRow}>
          <Text style={styles.bold}>Jumlah Produk</Text>
          
          <View style={styles.quantityControls}>
            <AntDesign
              name="minuscircleo"
              size={35}
              color={"black"}
              onPress={onMinus}
            />
            <Text style={styles.quantity}>{quantity}</Text>
            <AntDesign
              name="pluscircleo"
              size={35}
              color={"black"}
              onPress={onPlus}
            />
          </View>
        </View>

        <View style={styles.quantityRow}>
          <Text style={styles.bold}>Total Harga</Text>
          <Text style={styles.total}>Rp.{getTotal().toLocaleString("id-ID")}</Text>
        </View>
        <Pressable onPress={onAddToBasket} style={styles.button}>
          <Text style={styles.buttonText}>
            Masukkan ke Keranjang 
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
    
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
  },
  top: {
    padding: 10,
  },
  image: {
    width: '100%',
    aspectRatio: 5/3,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingLeft: 10,
  },
  description: {
    paddingLeft: 10,
    color: 'gray',
  },
  price: {
    paddingLeft: 10,
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  bottomContainer: {
    padding: 15,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: '#8A1538',
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
        
export default DishDetailsScreen;