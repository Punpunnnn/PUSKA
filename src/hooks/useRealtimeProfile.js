 
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const useRealtimeProfile = (userId) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error.message);
      } else {
        setProfile(data);
      }
    };

    fetchProfile();

    const channel = supabase
      .channel('realtime:profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,  
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return profile;
};

export default useRealtimeProfile;
