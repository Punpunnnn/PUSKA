import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

const useRealtimeRestaurant = (setRestaurants, setIsLoading, setError) => {
  const { authUser, resettingPassword } = useAuthContext();
  
  useEffect(() => {
    // Skip fetching if user is resetting password or not authenticated
    if (resettingPassword || !authUser) {
      setRestaurants([]);
      setIsLoading(false);
      return () => {};
    }
    
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');

        if (error) {
          console.error('Error fetching restaurants:', error);
          setError(error.message);
        } else {
          setRestaurants(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan saat mengambil data restoran');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();

    // Only set up subscription if authenticated and not resetting password
    const subscription = supabase
      .channel('realtime:restaurants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurants' },
        (payload) => {
          fetchRestaurants();
        }
      )
      .subscribe();

    return () => {
      // Clean up subscription when component unmounts or auth state changes
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [authUser, resettingPassword, setRestaurants, setIsLoading, setError]);
};

export default useRealtimeRestaurant;