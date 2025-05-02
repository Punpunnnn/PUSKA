import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

const useRealtimeMenus = (setMenus, restaurantId) => {
  useEffect(() => {
    if (!restaurantId) return;

    const fetchMenus = async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurants_id', restaurantId);

      if (error) {
        Alert.alert('Gagal menampilkan menu:', error.message);
        return;
      }
      setMenus(data);
    };

    fetchMenus();

    const subscription = supabase
      .channel('realtime:menus')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menus' },
        (payload) => {
          const item = payload.new || payload.old;
          if (item?.restaurants_id === restaurantId) {
            fetchMenus();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [restaurantId, setMenus]);
};

export default useRealtimeMenus;
