// Fix for RatingContext.js
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

const RatingContext = createContext();

export const useRatingContext = () => {
  return useContext(RatingContext);
};

export const RatingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get the current user ID
  const getCurrentUserId = async () => {
    // For Supabase v2.x, use getUser() or getSession()
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return user.id;
  };

  // Submit a new rating or update existing one
  const submitRating = async (orderId, restaurantId, ratingData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user ID with the updated method
      const userId = await getCurrentUserId();
        // Insert new rating
        const { data, error } = await supabase
          .from('ratings')
          .insert({
            user_id: userId, // Use the user ID from our helper function
            restaurant_id: restaurantId,
            order_id: orderId,
            service_rating: ratingData.serviceRating,
            food_quality_rating: ratingData.foodQualityRating,
            review: ratingData.review
          });
          
        if (error) throw error;
        return data;
    } catch (err) {
      console.error("Error in submitRating:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get rating for a specific order
  const getRatingByOrderId = async (orderId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('order_id', orderId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
      
      return data || null;
    } catch (err) {
      console.error("Error in getRatingByOrderId:", err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all ratings for a restaurant
  const getRestaurantRatings = async (restaurantId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (error) throw error;
      
      // Calculate total and average service ratings
      const serviceRatings = data.map(r => r.service_rating);
      const totalServiceRating = serviceRatings.reduce((sum, rating) => sum + rating, 0);
      const avgServiceRating = serviceRatings.length > 0 
        ? totalServiceRating / serviceRatings.length
        : 0;
        
      // Calculate total and average food quality ratings
      const foodRatings = data.map(r => r.food_quality_rating);
      const totalFoodRating = foodRatings.reduce((sum, rating) => sum + rating, 0);
      const avgFoodRating = foodRatings.length > 0
        ? totalFoodRating / foodRatings.length
        : 0;

      // Calculate total reviews and average star rating
      const totalReviews = data.length;
      
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
    } catch (err) {
      console.error("Error in getRestaurantRatings:", err);
      setError(err.message);
      return {
        ratings: [],
        summary: {
          totalServiceRating: 0,
          totalFoodRating: 0,
          avgServiceRating: 0,
          avgFoodRating: 0,
          totalReviews: 0
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Get all ratings by current user
  const getUserRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user ID with the updated method
      const userId = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          restaurants:restaurant_id (
            id,
            name,
            image_url
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error("Error in getUserRatings:", err);
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };



  const value = {
    isLoading,
    error,
    submitRating,
    getRatingByOrderId,
    getRestaurantRatings,
    getUserRatings
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};

export default RatingProvider;