// useAuth.js
import { useState } from 'react';

import { supabase } from '../../lib/supabase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signUpWithEmail = async (username, email, password) => {
    setLoading(true);
    console.log('Signing up with:', email); // Debugging log
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username
        },
      },
    });
    setLoading(false);
    if (error) {
      console.log('Sign up error:', error.message); // Debugging log
    }
    return error;
  };

  return {
    loading,
    signUpWithEmail,
  };
};