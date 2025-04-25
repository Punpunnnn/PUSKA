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

  // Clear auth when resetting password flag is set
  useEffect(() => {
    if (resettingPassword) {
      console.log("Password reset flow active - clearing auth state");
      setAuthUser(null);
    }
  }, [resettingPassword]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      setAuthUser(null);
      setDbUser(null);
      setLoading(false);
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      return { error };
    }
  };

  useEffect(() => {
    if (resettingPassword) {
      console.log("Skipping auth state setup - resetting password");
      return;
    }
    
    console.log("Setting up auth state listener");
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      if (resettingPassword) {
        console.log("Ignoring auth state change during password reset");
        return;
      }
      
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Setting auth user:", user?.email);
        setAuthUser(user);
        if (_event === 'SIGNED_IN') {
          setJustLoggedIn(true);
        }
      } else {
        console.log("Clearing auth user");
        setAuthUser(null);
      }
      setLoading(false);
    });

    const getInitialUser = async () => {
      if (resettingPassword) {
        console.log("Skipping initial user fetch - resetting password");
        setLoading(false);
        return;
      }
      
      console.log("Fetching initial user");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Initial user found:", user.email);
        setAuthUser(user);
      } else {
        console.log("No initial user found");
      }
      setLoading(false);
    };

    getInitialUser();

    return () => {
      console.log("Cleaning up auth state listener");
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, [resettingPassword]);

  // User profile effect
  useEffect(() => {
    const fetchDbUser = async () => {
      if (!authUser?.id) {
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

    if (authUser?.id) {
      fetchDbUser();
    }
  }, [authUser]);

  return (
    <AuthContext.Provider value={{
      profile,
      authUser,
      dbUser,
      setDbUser,
      isLoggedIn: !!authUser && !resettingPassword, // Important: consider not logged in during reset
      loading,
      signOut,
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