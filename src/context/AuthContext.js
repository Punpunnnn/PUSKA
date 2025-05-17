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
      setDbUser(null);
      setLoading(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (resettingPassword) return;

      if (session?.user) {
        setAuthUser(session.user);
        if (_event === 'SIGNED_IN') setJustLoggedIn(true);
      } else {
        setAuthUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    const checkInitialSession = async () => {
      if (resettingPassword) return;

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAuthUser(session.user);
      } else {
        setAuthUser(null);
        setDbUser(null);
      }
      setLoading(false);
    };

    checkInitialSession();

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [resettingPassword]);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (!authUser?.id || resettingPassword) {
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
  }, [authUser, resettingPassword]);

  const isLoggedIn = !!authUser && !resettingPassword;
  const userReady = isLoggedIn && !!dbUser;

  return (
    <AuthContext.Provider
      value={{
        profile,
        authUser,
        dbUser,
        setDbUser,
        isLoggedIn,
        loading: loading || (isLoggedIn && !dbUser),
        justLoggedIn,
        setJustLoggedIn,
        resettingPassword,
        setResettingPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
export const useAuthContext = () => useContext(AuthContext);
