import {View, FlatList, StyleSheet, ActivityIndicator, Pressable, Text} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DishListItem from '../../components/DishListItem';
import Header from './header';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useBasketContext } from '../../context/BasketContext';

const RestaurantDetailScreen = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const {setRestaurant: setBasketRestaurant, basket, basketDishes} = useBasketContext();
    const route = useRoute();
    const navigation = useNavigation();
    const id = route.params.id;

    const fetchRestaurantAndMenus = useCallback(async () => {
        if (!id) {
            return;
        }
        // Reset basket restaurant
        setBasketRestaurant(null);
        try {
            // Fetch restaurant
            const { data: restaurantData, error: restaurantError } = await supabase
                .from('restaurants')
                .select()
                .eq('id', id)
                .single(); // Use .single() to get a single object

            if (restaurantError) {
                console.error("Error fetching restaurant:", restaurantError);
                return;
            }

            setRestaurant(restaurantData);

            // Fetch menus
            const { data: menuData, error: menuError } = await supabase
                .from('menus')
                .select()
                .eq('restaurants_id', id);

            if (menuError) {
                console.error("Error fetching menus:", menuError);
                return;
            }

            setMenus(menuData);
            
            
            // Organize menus by category
            const menuByCategory = menuData.reduce((acc, menu) => {
                const category = menu.category || "Other";
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(menu);
                return acc;
            }, {});
            
            // Create categories array for the section list
            const categoriesArray = Object.keys(menuByCategory).map(title => ({
                title,
                data: menuByCategory[title]
            }));
            
            setCategories(categoriesArray);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [id, setBasketRestaurant]);

    useEffect(() => {
        fetchRestaurantAndMenus();
    }, [fetchRestaurantAndMenus]);

    useEffect(() => {
      const menuChannel = supabase
        .channel('realtime:menus')
        .on(
          'postgres_changes',
          {
            event: '*', // bisa diganti 'UPDATE' kalau hanya mau saat update
            schema: 'public',
            table: 'menus',
            filter: `restaurants_id=eq.${id}`,
          },
          (payload) => {
            console.log('📦 Menu changed:', payload);
            fetchRestaurantAndMenus(); // refetch menus
          }
        )
        .subscribe();
    
      const restoChannel = supabase
        .channel('realtime:restaurants')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'restaurants',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            console.log('🏪 Restoran changed:', payload);
            fetchRestaurantAndMenus(); // refetch resto
          }
        )
        .subscribe();
    
      return () => {
        supabase.removeChannel(menuChannel);
        supabase.removeChannel(restoChannel);
      };
    }, [id, fetchRestaurantAndMenus]);

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
            <DishListItem key={menuItem.id} menus={menuItem} restaurant={restaurant} />
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
        
        {basket && (
        <View style={styles.buttonContainer}>
          <Pressable
          onPress={() => {
            if (basketDishes.length > 0) {
            navigation.navigate("Basket", {restaurantTitle: restaurant.title});
            }
          }}
          style={[
            styles.button,
            basketDishes.length === 0 && { backgroundColor: "gray" }
          ]}
          disabled={basketDishes.length === 0}
          >
          <Text style={styles.buttonText}>
            Buka Keranjang ({basketDishes.length})
          </Text>
          </Pressable>
        </View>
        )}
      </View>
      );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF9F6",
        borderBottomColor: "lightgray",
        borderBottomWidth: 1,
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
        backgroundColor: "#88362F",
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
        paddingHorizontal: 10,
        paddingVertical: 10,
    }
});

export default RestaurantDetailScreen;