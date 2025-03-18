// AuthContext.js
import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from '../lib/supabase'; // Import the Supabase client

const AuthContext = createContext({});

const AuthContextProvider = ({ children }) => {
  const [authUser , setAuthUser ] = useState(null);
  const [dbUser , setDbUser ] = useState(null);

  useEffect(() => {
    const fetchUser  = async () => {
      const { data: { user }, error } = await supabase.auth.getUser ();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setAuthUser (user);
      }
    };

    fetchUser ();
  }, []);

  useEffect(() => {
    const fetchDbUser  = async () => {
      if (authUser ) {
        const { data, error } = await supabase
          .from('profiles') // Replace 'users' with your actual table name
          .select('*')
          .eq('id', authUser.id) // Assuming 'sub' is the unique identifier
          .single();

        if (error) {
          console.error('Error fetching database user:', error);
        } else {
          setDbUser (data);
        }
      }
    };

    fetchDbUser ();
  }, [authUser ]);

  return (
    <AuthContext.Provider value={{ authUser , dbUser , setDbUser  }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuthContext = () => useContext(AuthContext);