import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useRealtimeProfile from '../../hooks/useRealtimeProfile';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const profile = useRealtimeProfile(user?.id);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading || !profile) {
    return <Text>Loading...</Text>; // tampilkan loading sementara
  }
  const handlePress = () => {
    navigation.navigate("ChangePassword", { currentFullName: profile.full_name });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      Alert.alert('Logout Gagal', error.message);
    };
    return;
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
                
                <Text style={styles.fullName}>{profile.full_name || 'No Name Set'}</Text>
                <Text style={styles.emailSubtitle}>{user?.email}</Text>
              </View>
              
              <View style={styles.statsCard}>
                <View style={styles.coinsContainer}>
                  <View style={styles.coinLabelContainer}>
                    <Ionicons name="wallet-outline" size={24} color="#666" />
                    <Text style={styles.coinsLabel}>PUSKACoin</Text>
                  </View>
                  <View style={styles.coinValueWrapper}>
                    <Text style={styles.coinsValue}>{profile.coins}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formCard}>
                <Pressable 
                  style={({pressed}) => [
                    styles.button,
                    pressed && styles.buttonPressed
                  ]} 
                  onPress={handlePress}
                >
                  <Text style={styles.buttonText}>Edit Profil</Text>
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
                <Text style={styles.logoutButtonText}>Keluar</Text>
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
    backgroundColor: "#FCFCFC",
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
    backgroundColor: '#fcfcfc',
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
    backgroundColor: '#5DA574',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  coinsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  formCard: {
    backgroundColor: '#fcfcfc',
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
    backgroundColor: '#5DA574',
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
    backgroundColor: '#8A1538',
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