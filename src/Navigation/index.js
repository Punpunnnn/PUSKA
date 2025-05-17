import { useAuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '../components/splashscreen';

const RootNavigator = () => {
  const { 
    authUser, 
    loading, 
     
     
    resettingPassword 
  } = useAuthContext();

  if (loading) {
    return <SplashScreen />;
  }

   
  if (resettingPassword) {
     
    return <AuthStack />;
  }

   
  if (!authUser) {
     
    return <AuthStack />;
  }

   
  return <AppStack />;
};

export default RootNavigator;