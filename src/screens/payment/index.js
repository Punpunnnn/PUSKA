import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Linking,
  AppState,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useOrderContext } from '../../context/OrderContext';

const QRISPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId: routeOrderId, totalAmount: routeTotalAmount } = route.params || {};

  const [orderId, setOrderId] = useState(routeOrderId || '');
  const [totalAmount, setTotalAmount] = useState(routeTotalAmount || '');
  const [createdAt, setCreatedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [setLoading] = useState(true);
  const [expirationTimeStamp, setExpirationTimeStamp] = useState(null);
  const { updateOrderStatus } = useOrderContext();

  const TIME_LIMIT = 300;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);

      try {
        if (routeOrderId) {
          const { data, error } = await supabase
            .from('orders')
            .select('id, total, order_status, created_at')
            .eq('id', routeOrderId)
            .single();

          if (error) throw error;
          
          if (data) {
            const orderCreatedAt = new Date(data.created_at);
            setOrderId(data.id);
            setCreatedAt(orderCreatedAt);
            setTotalAmount(data.total.toLocaleString());
            setOrderStatus(data.order_status);
            
             
            const expirationTime = new Date(orderCreatedAt.getTime() + TIME_LIMIT * 1000);
            setExpirationTimeStamp(expirationTime);
          }
        } else {
          const { data, error } = await supabase
            .from('orders')
            .select('id, total, order_status, created_at')
            .eq('order_status', 'PENDING')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) throw error;
          
          if (data) {
            const orderCreatedAt = new Date(data.created_at);
            setOrderId(data.id);
            setCreatedAt(orderCreatedAt);
            setTotalAmount(data.total.toLocaleString());
            setOrderStatus(data.order_status);
            
             
            const expirationTime = new Date(orderCreatedAt.getTime() + TIME_LIMIT * 1000);
            setExpirationTimeStamp(expirationTime);
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [routeOrderId]);

  useEffect(() => {
     
    const updateCountdown = () => {
      if (!expirationTimeStamp) return;
      
      const now = new Date();
      const timeDiff = expirationTimeStamp - now;
      
       
      if (timeDiff <= 0) {
        setTimeLeft(0);
        if (orderStatus === 'PENDING') {
          handlePaymentExpired();
        }
        return;
      }
      
      // Convert to seconds
      const secondsLeft = Math.floor(timeDiff / 1000);
      setTimeLeft(secondsLeft);
    };
    
    // Run immediately
    updateCountdown();
    
    // Update every second
    const timer = setInterval(updateCountdown, 1000);
    
    // Handle app coming to foreground
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateCountdown();
      }
    });
    
    return () => {
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, [expirationTimeStamp, orderStatus]);

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (url && url.includes('paymentSuccess') && url.includes(`orderId=${orderId}`)) {
        if (url.includes('autoConfirm=true')) {
          await handlePaymentCallback();
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [orderId]);

  const generateQRISContent = () => {
    return `yourapp://payment/autoProcess?orderId=${orderId}&paymentSuccess=true&autoConfirm=true`;
  };

  const qrContent = generateQRISContent();

  useEffect(() => {
    if (!orderId) return;

    // Set up Supabase realtime subscription for order status changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        if (payload.new.order_status !== orderStatus) {
          setOrderStatus(payload.new.order_status);
          
          if (payload.new.order_status === 'NEW') {
            handlePaymentSuccess(payload.new.order_status);
          } else if (payload.new.order_status === 'EXPIRED') {
            Alert.alert(
              'Pembayaran Kedaluwarsa',
              'Pembayaran Anda telah kedaluwarsa.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Orders' }],
                    });
                  },
                },
              ],
              { cancelable: false }
            );
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId, orderStatus]);

  useEffect(() => {
    if (!orderId || !createdAt || orderStatus !== 'PENDING') return;
    
    // Schedule job to expire the order
    const expirationDelay = TIME_LIMIT * 1000; // Convert to milliseconds
    
    // Calculate how much time has already passed
    const now = new Date();
    const elapsedTime = now - createdAt;
    
    // Only schedule if there's still time left
    const remainingDelay = expirationDelay - elapsedTime;
    
    if (remainingDelay <= 0) {
      // Already expired, handle immediately
      handlePaymentExpired();
      return;
    }
    
    // Schedule expiration
    const expirationTimer = setTimeout(() => {
      if (orderStatus === 'PENDING') {
        handlePaymentExpired();
      }
    }, remainingDelay);
    
    return () => clearTimeout(expirationTimer);
  }, [orderId, createdAt, orderStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaymentExpired = async () => {
    if (!orderId || orderStatus !== 'PENDING') return;
  
    try {
      await updateOrderStatus(orderId, 'EXPIRED');
      setOrderStatus('EXPIRED');
      Alert.alert(
        'Pembayaran Kedaluwarsa',
        'Pembayaran Anda telah kedaluwarsa.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Orders' }],
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Failed to update expired order:', error);
    }
  };
  
  const handlePaymentSuccess = async (status) => {
    setPaymentComplete(true);
  
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Orders',
            params: {
              orderId,
              order_status: status || 'NEW',
            },
          },
        ],
      });
    }, 2000);
  };  

  const handlePaymentCallback = async () => {
    if (!orderId) return;

    await supabase
      .from('orders')
      .update({ order_status: 'NEW' })
      .eq('id', orderId);

    setOrderStatus('NEW');
    handlePaymentSuccess('NEW');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Pembayaran QRIS</Text>
          <Text style={styles.subtitle}>Pesanan #{orderId}</Text>
        </View>

        {!paymentComplete ? (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Pindai kode QR ini untuk menyelesaikan pembayaran Anda</Text>

            <View style={styles.qrCode}>
              <QRCode
                value={qrContent}
                size={250}
                backgroundColor="#ffffff"
                color="#000000"
              />
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Pembayaran:</Text>
              <Text style={styles.amount}>Rp {totalAmount}</Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Waktu tersisa:</Text>
              <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
                {formatTime(timeLeft)}
              </Text>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>Cara Membayar:</Text>
              <Text style={styles.instructionItem}>1. Buka aplikasi QRIS</Text>
              <Text style={styles.instructionItem}>2. Pindai kode QR di atas</Text>
              <Text style={styles.instructionItem}>3. Konfirmasi jumlah pembayaran</Text>
              <Text style={styles.instructionItem}>4. Selesaikan proses pembayaran di aplikasi Anda</Text>
              <TouchableOpacity style={styles.button} onPress={handlePaymentCallback}>
                <Text style={styles.buttontext}>Cek Status Pembayaran</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
            <Text style={styles.successText}>
              Pesanan Anda telah berhasil dibuat. Status pesanan telah diperbarui menjadi "Baru".
            </Text>
            <Text style={styles.orderIdText}>ID Pesanan: #{orderId}</Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status Pesanan:</Text>
          <Text style={[
            styles.statusValue,
            orderStatus === 'NEW' ? styles.statusNew : 
            orderStatus === 'EXPIRED' ? styles.statusExpired : styles.statusPending
          ]}>
            {orderStatus === 'NEW' ? 'Baru' : 
             orderStatus === 'EXPIRED' ? 'Kedaluwarsa' : 'Menunggu'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  qrTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  qrCode: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 18,
    color: '#777',
    marginRight: 5,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 18,
    color: '#777',
    marginRight: 5,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timerWarning: {
    color: '#FF4D4F',
  },
  instructions: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  successContainer: {
    backgroundColor: '#E8F7E4',
    borderColor: '#66BB6A',
    borderWidth: 2,
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 14,
    color: '#555',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  statusLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttontext: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#FF9800',
  },
  statusNew: {
    color: '#4CAF50',
  },
  statusExpired: {
    color: '#F44336',
  },
});

export default QRISPaymentScreen;