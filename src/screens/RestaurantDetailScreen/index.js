import {View, FlatList, StyleSheet, ActivityIndicator, Pressable, Text} from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DishListItem from '../../components/DishListItem';
import Header from './header';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useBasketContext } from '../../context/BasketContext';
import useRealtimeMenus from '../../hooks/useRealtimeMenus';

const RestaurantDetailScreen = () => {
    const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const { setRestaurant: setBasketRestaurant, basket, basketDishes } = useBasketContext();
  const [menuRatings, setMenuRatings] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params.id;

  useEffect(() => {
    const fetchMenuRatings = async () => {
      const { data, error } = await supabase
        .from('avg_menu_ratings')
        .select('*');
  
      if (error) {
        console.error('Gagal fetch avg menu ratings:', error.message);
      } else {
        setMenuRatings(data);
      }
    };
  
    fetchMenuRatings();
  }, []);
  
  const ratingsLookup = useMemo(() => {
    const lookup = {};
    menuRatings.forEach((rating) => {
      lookup[rating.menus_id] = rating.avg_rating;
    });
    return lookup;
  }, [menuRatings]);   

  const fetchRestaurant = useCallback(async () => {
    if (!id) return;
    setBasketRestaurant(null);

    const { data, error } = await supabase
      .from('restaurants')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching restaurant:", error);
      return;
    }

    setRestaurant(data);
  }, [id, setBasketRestaurant]);

  // Setup realtime menus listener
  useRealtimeMenus(setMenus, id);

  // Organize menus into categories on update
  useEffect(() => {
    const categorized = menus.reduce((acc, menu) => {
      const category = menu.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(menu);
      return acc;
    }, {});

    const categoriesArray = Object.keys(categorized).map(title => ({
      title,
      data: categorized[title],
    }));

    setCategories(categoriesArray);
  }, [menus]);

  // Fetch restaurant data on mount
  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  // Set restaurant into basket context
  useEffect(() => {
    setBasketRestaurant(restaurant);
  }, [restaurant, setBasketRestaurant]);

  if (!restaurant) {
    return <ActivityIndicator size="large" color="black" />;
  }

    return (
      <View style={styles.container}>
      <FlatList
      ListHeaderComponent={() => <Header restaurant={restaurant} />}
      data={categories}
      renderItem={({ item: category }) => (
        <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        {category.data.map((menuItem) => (
        <DishListItem key={menuItem.id} menus={menuItem} restaurant={restaurant} rating={ratingsLookup[menuItem.id] ?? null}/>
        ))}
        </View>
      )}
      keyExtractor={(item) => item.title}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }} // Increased padding to make room for button
      />
      
      <Ionicons 
      onPress={() => navigation.goBack()} 
      name="arrow-back-circle" 
      size={45} 
      color="white" 
      style={styles.IconContainer} 
      />
      
      <View style={styles.buttonContainer}>
        <Pressable
        onPress={() => {
        if (basketDishes.length > 0) {
          navigation.navigate("Basket", {restaurantTitle: restaurant.title});
        }
        }}
        style={[
        styles.button,
        ...(basketDishes.length === 0 ? [{ backgroundColor: "gray" }] : [])
        ]}
        disabled={basketDishes.length === 0}
        >
        <Text style={styles.buttonText}>
        Buka Keranjang ({basketDishes.length})
        </Text>
        </Pressable>
      </View>
      </View>
      );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FCFCFC",
        borderBottomColor: "lightgray",
        borderBottomWidth: 1,
        color: "#333333",
    },
    IconContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        zIndex: 1,
    },
    image: {
        width: "100%",
        aspectRatio: 5 / 3,
        marginBottom: 5,
    },
    title: {
        fontSize: 35,
        fontWeight: "600",
        marginVertical: 5,
    },
    rating: {
        fontSize: 20,
        color: "grey",
        marginBottom: 10,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'transparent',
      },
      button: {
        backgroundColor: "#5DA574",
        padding: 20,
        alignItems: "center",
        width: '100%',
      },
      buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
      },
      categoryContainer: {
        marginBottom: 15,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingVertical: 10,
    }
});

export default RestaurantDetailScreen;