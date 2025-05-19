import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

const useRealtimeRestaurant = (setRestaurants, setIsLoading, setError) => {
  const { authUser, resettingPassword } = useAuthContext();
  
  useEffect(() => {
     
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
          .select('*')
          .order('is_open', { ascending: false })  

        if (error) {  
          setError(error.message);  
        }
        setRestaurants(data || []);  
        setError(null);
      } catch (err) {  
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan saat mengambil data restoran');
      } finally {  
        setIsLoading(false);
      }
    };

    fetchRestaurants();

     
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
       
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [authUser, resettingPassword, setRestaurants, setIsLoading, setError]);
};

export default useRealtimeRestaurant;