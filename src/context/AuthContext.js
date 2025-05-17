import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from '../lib/supabase';
import useRealtimeProfile from '../hooks/useRealtimeProfile';

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const profile = useRealtimeProfile(authUser?.id);
  
  useEffect(() => {
    if (resettingPassword) {
      setAuthUser(null);
    }
  }, [resettingPassword]);

  useEffect(() => {
    if (resettingPassword) {
      setLoading(false);
      return;
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {

      if (resettingPassword) {
        return;
      }

      if (session) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          setAuthUser(user);
          if (_event === 'SIGNED_IN') setJustLoggedIn(true);
        } catch (error) {
        }
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    const getInitialUser = async () => {
      if (resettingPassword) {
        setLoading(false);
        return;
      }
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          setAuthUser(user);
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
6
    getInitialUser();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [resettingPassword]);

   
  useEffect(() => {
    const fetchDbUser = async () => {
      if (!authUser?.id) {
        setDbUser(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) throw error;
        setDbUser(data);
      } catch (error) {
        console.error('Error fetching database user:', error.message);
      }
    };

    fetchDbUser();
  }, [authUser]);

  return (
    <AuthContext.Provider value={{
      profile,
      authUser,
      dbUser,
      setDbUser,
      isLoggedIn: !!authUser && !resettingPassword,
      loading,
      justLoggedIn,
      setJustLoggedIn,
      resettingPassword,
      setResettingPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
export const useAuthContext = () => useContext(AuthContext);
