import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const RatingContext = createContext();

export const useRatingContext = () => useContext(RatingContext);

export const RatingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingsCache, setRatingsCache] = useState({});

  // Menggunakan useCallback untuk memoize fungsi
  const getCurrentUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }, []);

  // Menggunakan useCallback untuk memoize fungsi fetchData
  const fetchData = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit a new rating dengan useCallback
  const submitRating = useCallback(async (orderId, restaurantId, ratingData) => {
    try {
      const userId = await getCurrentUserId();
      return fetchData(
        supabase.from('ratings').insert({
          user_id: userId,
          restaurant_id: restaurantId,
          order_id: orderId,
          service_rating: ratingData.serviceRating,
          food_quality_rating: ratingData.foodQualityRating,
          review: ratingData.review
        }).select() // Tambahkan select() untuk mendapatkan data yang diinsert
      );
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [getCurrentUserId, fetchData]);

  // Get rating for a specific order dengan useCallback
  const getRatingByOrderId = useCallback(async (orderId) => {
    return fetchData(
      supabase.from('ratings').select('*').eq('order_id', orderId).single()
    );
  }, [fetchData]);

  // Get all ratings for a restaurant dengan useCallback dan optimasi kalkulasi
  const getRestaurantRatings = useCallback(async (restaurantId) => {
    const data = await fetchData(
      supabase.from('ratings')
        .select('*, users: user_id (id, full_name)')
        .eq('restaurant_id', restaurantId)
    );
    
    if (!data || data.length === 0) return { ratings: [], summary: { totalServiceRating: 0, totalFoodRating: 0, avgServiceRating: 0, avgFoodRating: 0, totalReviews: 0 } };

    // Optimasi: Kalkulasi dalam satu loop saja
    let totalServiceRating = 0;
    let totalFoodRating = 0;
    
    data.forEach(rating => {
      totalServiceRating += rating.service_rating;
      totalFoodRating += rating.food_quality_rating;
    });
    
    const totalReviews = data.length;
    const avgServiceRating = totalReviews ? totalServiceRating / totalReviews : 0;
    const avgFoodRating = totalReviews ? totalFoodRating / totalReviews : 0;

    return {
      ratings: data,
      summary: {
        totalServiceRating,
        totalFoodRating,
        avgServiceRating,
        avgFoodRating,
        totalReviews
      }
    };
  }, [fetchData]);

  // Memoize value object agar tidak di-recreate pada setiap render
  const value = React.useMemo(() => ({
    isLoading,
    error,
    submitRating,
    getRatingByOrderId,
    getRestaurantRatings
  }), [isLoading, error, submitRating, getRatingByOrderId, getRestaurantRatings]);

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>;
};

export default RatingProvider;