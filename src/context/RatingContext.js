import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const RatingContext = createContext();

export const useRatingContext = () => useContext(RatingContext);

export const RatingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingsCache, setRatingsCache] = useState({});

  // Helper function to get the current user ID
  const getCurrentUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }, []);

  // Generic helper for fetching data with error handling
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

  // Fungsi untuk menghapus cache rating untuk restoran tertentu
  const invalidateCache = useCallback((restaurantId) => {
    setRatingsCache(prev => {
      const newCache = {...prev};
      delete newCache[restaurantId];
      return newCache;
    });
  }, []);

  // Submit a new rating or update existing one
  const submitRating = useCallback(async (orderId, restaurantId, ratingData) => {
    try {
      const userId = await getCurrentUserId();
      const result = await fetchData(
        supabase.from('ratings').insert({
          user_id: userId,
          restaurant_id: restaurantId,
          order_id: orderId,
          service_rating: ratingData.serviceRating,
          food_quality_rating: ratingData.foodQualityRating,
          review: ratingData.review
        }).select()
      );
      
      // Invalidate cache setelah submit rating baru
      invalidateCache(restaurantId);
      
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [getCurrentUserId, fetchData, invalidateCache]);

  // Get rating for a specific order
  const getRatingByOrderId = useCallback(async (orderId) => {
    return fetchData(
      supabase.from('ratings').select('*').eq('order_id', orderId).single()
    );
  }, [fetchData]);

  const getRestaurantRatings = useCallback(async (restaurantId, forceRefresh = false) => {
    if (!forceRefresh && ratingsCache[restaurantId]) {
      return ratingsCache[restaurantId];
    }
    
    const data = await fetchData(
      supabase.from('ratings')
        .select('*, users: user_id (id, full_name)')
        .eq('restaurant_id', restaurantId)
    );
    
    if (!data || data.length === 0) {
      const emptyResult = { 
        ratings: [], 
        summary: { 
          totalServiceRating: 0, 
          totalFoodRating: 0, 
          avgServiceRating: 0, 
          avgFoodRating: 0, 
          totalReviews: 0 
        } 
      };
      
      setRatingsCache(prev => ({...prev, [restaurantId]: emptyResult}));
      return emptyResult;
    }

    let totalServiceRating = 0;
    let totalFoodRating = 0;
    
    data.forEach(rating => {
      totalServiceRating += rating.service_rating;
      totalFoodRating += rating.food_quality_rating;
    });
    
    const totalReviews = data.length;
    const summary = {
      totalServiceRating,
      totalFoodRating,
      avgServiceRating: totalServiceRating / totalReviews || 0,
      avgFoodRating: totalFoodRating / totalReviews || 0,
      totalReviews
    };

    const results = { ratings: data, summary };
    
    setRatingsCache(prev => ({...prev, [restaurantId]: results}));
    
    return summary;
  }, [fetchData, ratingsCache]);

  // Expose invalidateCache jika perlu digunakan dari luar Context
  const value = React.useMemo(() => ({
    isLoading,
    error,
    submitRating,
    getRatingByOrderId,
    getRestaurantRatings,
    invalidateCache  // Export fungsi ini juga
  }), [isLoading, error, submitRating, getRatingByOrderId, getRestaurantRatings, invalidateCache]);

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>;
};

export default RatingProvider;