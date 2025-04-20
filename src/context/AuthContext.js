import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Explicitly set authUser to null
      setAuthUser(null);
      setDbUser(null);
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        // User logged in
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);
      } else {
        // User logged out
        setAuthUser(null);
      }
      setLoading(false); 
    }
  );

  // Initial load
  const getInitialUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setAuthUser(user);
  };

  getInitialUser();

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


  // Fetch DB user if authUser changes
  useEffect(() => {
    const fetchDbUser = async () => {
      if (!authUser) {
        setDbUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching database user:', error);
      } else {
        setDbUser(data);
      }
    };

    fetchDbUser();
  }, [authUser]);

  const isLoggedIn = !!authUser;

  return (
    <AuthContext.Provider value={{ authUser, dbUser, setDbUser, isLoggedIn, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);
