import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { signOut} = useAuthContext();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coins')
        .eq('id', user.id)
        .single();
      setFullName(profile.full_name || '');
      setCoins(profile.coins || 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: fullName, 
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      console.log('Sign out success');
      if (error) throw error;
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
      console.error('Error during sign out:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.headerTitle}>Profile</Text>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                
                <View style={styles.avatarShadow}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={150} color="gray" />
                  </View>
                </View>
                
                <Text style={styles.fullName}>{fullName || 'No Name Set'}</Text>
                <Text style={styles.emailSubtitle}>{user?.email}</Text>
              </View>
              
              <View style={styles.statsCard}>
                <View style={styles.coinsContainer}>
                  <View style={styles.coinLabelContainer}>
                    <Ionicons name="wallet-outline" size={24} color="#666" />
                    <Text style={styles.coinsLabel}>PUSKACoin</Text>
                  </View>
                  <View style={styles.coinValueWrapper}>
                    <Text style={styles.coinsValue}>{coins}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>Edit Profile</Text>
                <TextInput
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  placeholderTextColor="#999"
                />

                <Pressable 
                  style={({pressed}) => [
                    styles.button,
                    pressed && styles.buttonPressed
                  ]} 
                  onPress={updateProfile}
                >
                  <Text style={styles.buttonText}>Update Profile</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                </Pressable>
              </View>

              <Pressable 
                style={({pressed}) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed
                ]} 
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#333',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarContainer: {
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  emailSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2c3e50',
  },
  coinValueWrapper: {
    backgroundColor: '#6f8b43',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  coinsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    height: 55,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6f8b43',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#2f5b00',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutButtonPressed: {
    backgroundColor: '#e0352b',
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Profile;