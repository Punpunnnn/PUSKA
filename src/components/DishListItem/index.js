import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRatingContext } from '../../context/RatingContext';
import { Ionicons } from '@expo/vector-icons';

const DishListItem = ({ menus, restaurant }) => {
    const navigation = useNavigation();
    const { getRestaurantRatings } = useRatingContext();
    const [foodRating, setFoodRating] = useState(null);
  
    useEffect(() => {
      const fetchRatings = async () => {
        const result = await getRestaurantRatings(restaurant.id);
        setFoodRating(result?.summary?.avgFoodRating);
      };
      fetchRatings();
    }, [restaurant.id]);
  
    const handlePress = () => {
      if (menus.is_available) {
        navigation.navigate('Dish', { id: menus.id });
      }
    };
  
    return (
      <Pressable onPress={menus.is_available ? handlePress : null} style={styles.container}>
        <View style={{ position: 'relative' }}>
          {/* Bagian isi yang diberi opacity kalau habis */}
          <View style={!menus.is_available && { opacity: 0.4 }}>
            <View style={styles.content}>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{menus.name}</Text>
                <View style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'center', gap: 5 }}>
                  <Ionicons name="star" size={18} color="orange" />
                  <Text style={styles.rating}>
                    {foodRating !== null ? foodRating.toFixed(1) : '?'}
                  </Text>
                </View>
                <Text style={styles.desc} numberOfLines={2}>
                  {menus.description}
                </Text>
                <Text style={styles.price}>
                  Rp.{menus.price.toLocaleString('id-ID')}
                </Text>
              </View>
              <Image source={{ uri: menus.image }} style={styles.image} />
            </View>
          </View>
  
          {/* Overlay teks "HABIS" */}
          {!menus.is_available && (
            <View style={styles.overlay}>
              <Text style={styles.outOfStockText}>HABIS</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };
  

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      },
      
      outOfStockText: {
        backgroundColor: 'rgba(255, 0, 0, 0.85)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        elevation: 2,
      },      
    container: {
        backgroundColor: "#FAF9F6",
        marginHorizontal: 10,
        marginVertical: 6,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    infoContainer: {
        flex: 1,
        paddingRight: 10,
        paddingLeft: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    desc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    rating: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
        gap: 5,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'black'
    },
});

export default DishListItem;
