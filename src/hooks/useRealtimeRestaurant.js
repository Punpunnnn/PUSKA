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
      try { //1
        setIsLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*');

        if (error) { //2
          setError(error.message); //3
        }
        setRestaurants(data || []); //4
        setError(null);
      } catch (err) { //5
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan saat mengambil data restoran');
      } finally { //6
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
        () => {
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