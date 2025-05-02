import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '../components/splashscreen';

const RootNavigator = () => {
  const { 
    authUser, 
    loading, 
    // justLoggedIn, 
    // setJustLoggedIn, 
    resettingPassword 
  } = useAuthContext();

  // useEffect(() => {
  //   if (justLoggedIn) {
  //     const timer = setTimeout(() => {
  //       alert('Login Berhasil! Selamat datang kembali!');
  //       setJustLoggedIn(false);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [justLoggedIn, setJustLoggedIn]);

  // Add debug logs
  // console.log(
  //   `RootNavigator state: loading=${loading}, resetting=${resettingPassword}, authUser=${authUser ? 'exists' : 'none'}`
  // );

  // Show splash screen when loading
  if (loading) {
    return <SplashScreen />;
  }

  // Critical fix: ALWAYS show AuthStack when resetting password
  if (resettingPassword) {
    // console.log("Showing AuthStack - Password reset flow");
    return <AuthStack />;
  }

  // Now handle normal auth flow
  if (!authUser) {
    // console.log("Showing AuthStack - No authenticated user");
    return <AuthStack />;
  }

  // console.log("Showing AppStack - User authenticated");
  return <AppStack />;
};

export default RootNavigator;