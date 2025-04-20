import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { useState, useEffect } from 'react';
import RestaurantItem from '../../components/RestaurantItem';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function Homescreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
 

  useEffect(() => {
    // Fetch both restaurants and menu items
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select();
          
        if (restaurantsError) {
          console.error("Restaurant fetch error:", restaurantsError);
          setError("Failed to load restaurants");
          setIsLoading(false);
          return;
        }
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select('id, name, price, restaurants_id');
          
        if (menuError) {
          console.error("Menu fetch error:", menuError);
          setError("Failed to load menu items");
          setIsLoading(false);
          return;
        }
        
        // Ensure restaurantsData is valid before setting state
        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          setFilteredRestaurants(restaurantsData);
        } else {
          console.error("Restaurant data is not an array:", restaurantsData);
          setRestaurants([]);
          setFilteredRestaurants([]);
        }
        
        // Ensure menuData is valid before setting state
        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error("Unexpected error during data fetch:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search functionality
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // If search text is empty, show all restaurants
      setFilteredRestaurants(restaurants);
      return;
    }
    
    const lowercaseQuery = text.toLowerCase();
    
    // Search by restaurant name
    const matchedByName = restaurants.filter(restaurant => 
      restaurant?.title?.toLowerCase().includes(lowercaseQuery)
    );
    
    // Find restaurant IDs that have matching menu items
    const matchedMenuItems = menuItems.filter(item => 
      item?.name?.toLowerCase().includes(lowercaseQuery)
    );
    
    // Get unique restaurant IDs from matched menu items
    const matchedRestaurantIds = [...new Set(matchedMenuItems.map(item => item.restaurant_id))];
    
    // Find restaurants that match these IDs
    const matchedByMenu = restaurants.filter(restaurant => 
      matchedRestaurantIds.includes(restaurant.id)
    );
    
    // Combine results and remove duplicates
    const combinedResults = [...matchedByName, ...matchedByMenu];
    const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());
    
    setFilteredRestaurants(uniqueResults);
  };


  return (
    <View style={styles.page}>
      <View style={styles.headerContainer}> 
      {/* Header */}
      <Text style={styles.headerTitle}>Home</Text>
      
      {/* Search Component */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kantin atau menu..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color="gray" 
            style={styles.clearIcon}
            onPress={() => handleSearch('')} 
          />
        ) : null}
      </View>
      </View>
      
      {/* Results count when searching */}
      {searchQuery ? (
        <Text style={styles.resultsText}>
          Found {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'result' : 'results'}
        </Text>
      ) : null}
      
      {/* Restaurant list */}
      <FlatList
        contentContainerStyle={{ padding:16 }}
        data={filteredRestaurants}
        renderItem={({ item }) => <RestaurantItem restaurant={item} />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>
              {searchQuery ? `No restaurants found matching "${searchQuery}"` : "No restaurants available"}
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  headerContainer: {
    backgroundColor: '#88362F',
    borderBottomLeftRadius:8,
    borderBottomRightRadius:8,
  },
  headerTitle: {
    marginTop:40,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  searchContainer: {
    width:"90%",
    alignSelf:"center",
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  clearIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  resultsText: {
    paddingLeft: 16,
    paddingTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  }
});