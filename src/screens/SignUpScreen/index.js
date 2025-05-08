 
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading] = useState(false);
  const navigation = useNavigation();  

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username
        },
      },
    });
  
    if (error) {
      Alert.alert('Registrasi Gagal', error.message);
    } else {
       
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user.id;

      const { error: coinsError } = await supabase
        .from('profiles')
        .upsert([{ id: userId, coins: 300 }], { onConflict: ['id'] });
  
      if (coinsError) {
        console.error('Gagal menambahkan coins:', coinsError.message);
        Alert.alert('Gagal Menambahkan Coins', 'Terdapat masalah saat menambahkan coins.');
      } else {
        Alert.alert('Registrasi Berhasil', 'Akun Anda telah berhasil dibuat dan Anda mendapatkan 300 coins!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/puska.png')} style={styles.image} />
      <Text style={styles.subtitle}>Buat akun baru</Text>
      <Text style={styles.subbab}>Username</Text>
      <TextInput
        placeholder="masukkan username anda"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        keyboardType="default"
        style={styles.input}
      />
      <Text style={styles.subbab}>Email</Text>
      <TextInput
        placeholder="Masukkan email anda"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Text style={styles.subbab}>Password</Text>
      <TextInput
        placeholder="Masukkan kata sandi anda"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Daftar Akun</Text>
        )}
      </Pressable>
      <Text style={styles.link}>
              Sudah punya akun?{' '}
              <Text
                style={{ color: '#8A1538' }}
                onPress={() => navigation.navigate('Login')}
              >
                Masuk
              </Text>
            </Text>
    </View>
  );
};

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
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#8A1538',
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
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  link: {
    fontSize: 13,
    marginTop: 12,
    color: '#333333',
    textAlign: 'center',
  },
  button: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#5DA574',
    borderRadius: 16,
    paddingVertical: 12,
  },
});

export default Signup;