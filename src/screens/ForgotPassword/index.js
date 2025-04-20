import React, { useState } from 'react';
import { View, TextInput, Button, Alert} from 'react-native';
import { sendResetPasswordEmail } from "../../utils/auth";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  const handleSendResetLink = async () => {
    const { error } = await sendResetPasswordEmail(email)
  if (error) {
    Alert.alert('Gagal', error.message)
  } else {
    Alert.alert('Email terkirim', 'Cek email kamu untuk reset password.')
  }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Kirim Link Reset" onPress={handleSendResetLink} />
    </View>
  );
};

export default ForgotPasswordScreen;
