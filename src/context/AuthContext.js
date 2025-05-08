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
      console.log("Password reset flow active - clearing auth state");
      setAuthUser(null);
    }
  }, [resettingPassword]);

  useEffect(() => {
    if (resettingPassword) {
      console.log("Skipping auth state setup - resetting password");
      setLoading(false);
      return;
    }

    console.log("Setting up auth state listener");

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");

      if (resettingPassword) {
        console.log("Ignoring auth state change during password reset");
        return;
      }

      if (session) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          console.log("Setting auth user:", user?.email);
          setAuthUser(user);
          if (_event === 'SIGNED_IN') setJustLoggedIn(true);
        } catch (error) {
          console.error('Error getting user during auth state change:', error.message);
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
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          console.log("Initial user found:", user.email);
          setAuthUser(user);
        } else {
          console.log("No initial user found");
        }
      } catch (error) {
        console.log('Error fetching initial user:', error.message);
      } finally {
        setLoading(false);
      }
    };
6
    getInitialUser();

    return () => {
      console.log("Cleaning up auth state listener");
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
