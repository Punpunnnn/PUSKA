import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import RestaurantItem from '../../components/RestaurantItem';
import useRealtimeRestaurant from '../../hooks/useRealtimeRestaurant';
import useRealtimeAllMenus from '../../hooks/useRealtimeAllMenus';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';

export default function Homescreen() {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useRealtimeRestaurant(setRestaurants, setIsLoading, setError);
  useRealtimeAllMenus(setMenuItems, setIsLoading, setError);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const lowercaseQuery = text.toLowerCase();
    const matchedByName = restaurants.filter(restaurant =>
      restaurant?.title?.toLowerCase().includes(lowercaseQuery)
    );
    const matchedMenuItems = menuItems.filter(item => {
      const name = item?.name?.toLowerCase();
      return (
        name.includes(lowercaseQuery) ||
        name.split(' ').some(word => word.startsWith(lowercaseQuery))
      );
    });
    const matchedRestaurantIds = [...new Set(matchedMenuItems.map(item => item.restaurants_id))];
    const matchedByMenu = restaurants.filter(restaurant =>
      matchedRestaurantIds.includes(restaurant.id)
    );
    const combinedResults = [...matchedByName, ...matchedByMenu];
    const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());
    setFilteredRestaurants(uniqueResults);
  }, [restaurants, menuItems]);

  const debouncedSearch = useMemo(() => debounce(handleSearch, 300), [handleSearch]);
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
    }
  }, [restaurants, searchQuery]);


  return (
    <View style={styles.page}>
      <View style={styles.headerContainer}> 
        <Text style={styles.headerTitle}>Home</Text>
        
        <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />

        <TextInput
          style={styles.searchInput}
          placeholder="Cari kantin atau menu..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            debouncedSearch(text);
          }}
          returnKeyType="search"
          clearButtonMode="never"
        />

        {searchQuery ? (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color="gray" 
            style={styles.clearIcon}
            onPress={() => {
              setSearchQuery('');
              debouncedSearch('');
            }} 
          />
        ) : null}
      </View>

      {searchQuery.trim() !== '' && (
        <Text style={styles.resultsText}>
          Ditemukan {filteredRestaurants.length} hasil
        </Text>
      )}

      </View>
      
      <FlatList
        contentContainerStyle={{ padding:16 }}
        data={filteredRestaurants}
        renderItem={({ item }) => <RestaurantItem 
        restaurant={item}
        menus={menuItems.filter(menu => menu.restaurants_id === item.id)} />}
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
    backgroundColor: "#FCFCFC",
  },
  headerContainer: {
    backgroundColor: '#8A1538',
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
    color: '#fcfcfc',
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
    color: 'white',
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