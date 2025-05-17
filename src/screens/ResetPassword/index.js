import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../context/AuthContext';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {setResettingPassword } = useAuthContext();

  const showError = (message) => {
    Alert.alert('Error', message || 'Terjadi kesalahan.');
  };
  
  const handleResetPassword = async () => {  
    if (password !== confirmPassword) {  
      showError('Password baru dan konfirmasi password tidak cocok.');  
      return;
    }
    try {  
      const { error: otpError } = await supabase.auth.verifyOtp({ 
        email,
        token: otp,
        type: 'recovery',
      });
  
      if (otpError) return showError(otpError.message);  
  
      setResettingPassword(true);  
  
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) return showError(updateError.message);  
  
      await supabase.auth.signOut({ scope: 'global' });  
  
      Alert.alert('Berhasil', 'Password berhasil diubah. Silakan login kembali dengan password baru Anda.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            setTimeout(() => setResettingPassword(false), 1000);
          },
        },
      ]);
    } catch (error) {  
      showError('Terjadi kesalahan saat mengubah password.');
      setResettingPassword(false);
    }
  };  
  
  
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Password recovery.png')}  
        style={styles.image}
      />

      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.description}>
        Kode OTP sudah dikirimkan ke email. cek ya!
      </Text>
      <Text style={styles.subbab}>Kode OTP</Text>
      <TextInput
        placeholder="Masukkan kode OTP "
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Text style={styles.subbab}>Password Baru</Text>
      <TextInput
        placeholder="Buat kata sandi baru"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Text style={styles.subbab}>Konfirmasi Password Baru</Text>
      <TextInput
        placeholder="Konfirmasi kata sandi baru"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleResetPassword}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Masuk
        </Text>
      </Pressable>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FCFCFC',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: -120,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#800000',  
  },
  description: {
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  subbab: {
    fontSize: 16,
    fontWeight: '500',
    paddingLeft: '10%',  
    marginBottom: 8,
  },
  input: {
    width: '80%',
    alignSelf: 'center',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  backToLogin: {
    color: '#800000',
    textAlign: 'center',
    marginTop: 10,
  },
});