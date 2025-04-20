// src/hooks/useHandleResetPassword.js
import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import { supabase } from '../lib/supabase' // Adjust the path as necessary
import { useAuthContext } from '../context/AuthContext'
import { useNavigation } from '@react-navigation/native'

export default function useHandleResetPassword() {
  const { setAuthUser } = useAuthContext()
  const navigation = useNavigation()

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = Linking.parse(event.url)
      const { access_token, refresh_token, type } = url.queryParams

      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (!error) {
          setAuthUser(data.user)
          navigation.navigate('ChangePassword')
        }
      }
    }

    const subscription = Linking.addEventListener('url', handleDeepLink)

    return () => {
      subscription.remove()
    }
  }, [])
}
