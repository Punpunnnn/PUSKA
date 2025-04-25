import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';

const useRealtimeMenus = (setMenuItems, setIsLoading, setError) => {
  const { authUser, resettingPassword } = useAuthContext();

  useEffect(() => {

    if (resettingPassword || !authUser) {
      setMenuItems([]);
      return () => {};
    }
    const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select('*');

      if (error) {
        console.error('❌ Error fetching menus:', error.message);
        setError('Gagal memuat data menu.');
      } else {
        setMenuItems(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
        setError('Terjadi kesalahan saat mengambil data menu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();

    const subscription = supabase
      .channel('realtime:menus')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menus' },
        (payload) => {
          fetchMenus(); // Refresh data kalau ada perubahan
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [authUser, resettingPassword, setMenuItems, setIsLoading, setError]);
};

export default useRealtimeMenus;
