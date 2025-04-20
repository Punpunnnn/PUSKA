// SplashScreen.js
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    return () => {
      fadeAnim.setValue(0);
    };
  }, []);

  return (
    <View style={styles.container}>
    <Image source={require('../../../assets/Puska.png')} style={{ width: 200, height: 200 }} />
      <Text style={styles.text}>Your Affordable Buddy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 20,
    fontWeight: 500,
    marginTop: 10,
    fontFamily: 'Poppins',
  },
});

export default SplashScreen;
