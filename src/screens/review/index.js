import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRatingContext } from '../../context/RatingContext';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Komponen untuk menampilkan rating bintang
const StarDisplay = ({ rating }) => (
  <Text style={styles.stars}>
    {[1, 2, 3, 4, 5].map(star => (star <= rating ? '★' : '☆'))}
  </Text>
);

// Header restoran
const RestaurantHeader = ({ restaurant }) => {
  return (
    <View style={styles.headerContainer}>
      <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
      <Text style={styles.restaurantName}>Review</Text>
    </View>
  );
};

const RestaurantReviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  const { getRestaurantRatings, isLoading } = useRatingContext();
  const [ratings, setRatings] = useState([]);
  const [restaurant, setRestaurant] = useState(null);

  // Ambil data restoran dari ID
useEffect(() => {
  const fetchRestaurantData = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, title, image')
      .eq('id', restaurantId)
      .single();

    if (error) {
      console.error('Error fetching restaurant data:', error);
    } else {
      setRestaurant(data);
    }
  };

  if (restaurantId) {
    fetchRestaurantData();
  }
}, [restaurantId]);

// Setelah restaurant tersedia, ambil rating
useEffect(() => {
  const fetchRatings = async () => {
    if (!restaurant?.id) return;
    const result = await getRestaurantRatings(restaurant.id);
    if (result?.ratings) {
      setRatings(result.ratings);
    }
  };

  fetchRatings();
}, [restaurant?.id]);

  const renderItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.userName}>{item.users?.full_name || 'Anonim'}</Text>
      <View style={styles.ratingRow}>
        <Text>Makanan:</Text>
        <StarDisplay rating={item.food_quality_rating} />
      </View>
      <View style={styles.ratingRow}>
        <Text>Pelayanan:</Text>
        <StarDisplay rating={item.service_rating} />
      </View>
      {item.review ? (
        <Text style={styles.reviewText}>"{item.review}"</Text>
      ) : (
        <Text style={styles.reviewTextMuted}>Tidak ada review tertulis.</Text>
      )}
    </View>
  );

  if (isLoading || !restaurant) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#B13636" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RestaurantHeader restaurant={restaurant} />
      <Ionicons 
        onPress={() => navigation.goBack()} 
        name="arrow-back-circle" 
        size={45} 
        color="white" 
        style={styles.iconContainer} 
      />
      <FlatList
        data={ratings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada review untuk kantin ini.</Text>}
      />
    </View>
  );
};

// Styling untuk seluruh komponen
const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#B13636',
  },
  headerContainer: {
    marginBottom: 16,
  },
  restaurantImage: {
    width: '100%',
    aspectRatio: 5 / 3,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    marginLeft: 6,
    fontSize: 18,
    color: '#FFD700',
  },
  reviewText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#444',
  },
  reviewTextMuted: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#aaa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    marginTop: 32,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  iconContainer: {
    paddingTop: 16,
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 2,
  },
});

export default RestaurantReviewScreen;
