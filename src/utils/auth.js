// src/utils/auth.js
import { supabase } from '../lib/supabase' // Adjust the path as necessary
import * as Linking from 'expo-linking'

export const sendResetPasswordEmail = async (email) => {
  const redirectTo = Linking.createURL('reset-password')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  return { error }
}
