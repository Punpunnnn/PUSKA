// useAuth.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signUpWithEmail = async (email, password) => {
    setLoading(true);
    console.log('Signing up with:', email); // Debugging log
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      console.log('Sign up error:', error.message); // Debugging log
      Alert.alert(error.message);
    }
    return error;
  };

  return {
    loading,
    signUpWithEmail,
  };
};