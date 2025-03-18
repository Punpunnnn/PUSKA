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

  useEffect(() => {
    // Fetch both restaurants and menu items
    const fetchData = async () => {
      setIsLoading(true);
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select();
          
        if (restaurantsError) throw restaurantsError;
        
        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menus') // Replace with your actual menu table name
          .select('id, name, price, restaurant_id'); // Select the fields you need
          
        if (menuError) throw menuError;
        
        setRestaurants(restaurantsData || []);
        setFilteredRestaurants(restaurantsData || []);
        setMenuItems(menuData || []);
        setIsLoading(false);
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
      {/* Header */}
      <Text style={styles.headerTitle}>Home</Text>
      
      {/* Search Component */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for restaurants or food..."
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
      
      {/* Results count when searching */}
      {searchQuery ? (
        <Text style={styles.resultsText}>
          Found {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'result' : 'results'}
        </Text>
      ) : null}
      
      {/* Restaurant list */}
      <FlatList
        data={filteredRestaurants}
        renderItem={({ item }) => <RestaurantItem restaurant={item} />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : (
            <Text style={styles.emptyText}>No restaurants found matching "{searchQuery}"</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 40, // Add padding to the top to ensure the header is visible
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
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
    marginBottom: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  }
});