// screens/ResetPassword.js
import { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../../lib/supabase'; // Pastikan path ini benar

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      Alert.alert('Gagal', error.message);
    } else {
      Alert.alert('Berhasil', 'Password berhasil diubah!');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Password baru"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Ubah Password" onPress={handleChangePassword} />
    </View>
  );
}
