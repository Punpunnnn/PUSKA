import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Use Supabase to sign in the user with the updated method
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // Assuming username is the email
      password: password,
    });

    if (error) {
      Alert.alert('Login Error', error.message); // Show error message
    } else {
      console.log('Login success:', data.user.email);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email" // Change placeholder to Email
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
        Don't have an account? Sign up
      </Text>
      <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot Password?
      </Text>
      <Text style={styles.link} onPress={() => navigation.navigate('ManualResetPassword')}>
        Manual Reset Password
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  link: {
    marginTop: 12,
    color: 'blue',
    textAlign: 'center',
  },
});

export default LoginScreen;