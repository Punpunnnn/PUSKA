import { useAuthContext } from '../context/AuthContext'; // Adjust the import path as necessary
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '../components/splashscreen';
import useHandleResetPassword from '../utils/handlereset'; // Adjust the import path as necessary

const RootNavigator = () => {
    const { authUser, loading } = useAuthContext();
    useHandleResetPassword()
    if (loading) {
      return <SplashScreen />;
    }
    console.log('IsLoggedIn:', !!authUser);

  return !!authUser ? <AppStack /> : <AuthStack />;
};

export default RootNavigator;
