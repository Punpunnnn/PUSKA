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
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const QRISPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId: routeOrderId, totalAmount: routeTotalAmount } = route.params || {};
  
  const [orderId, setOrderId] = useState(routeOrderId || '');
  const [totalAmount, setTotalAmount] = useState(routeTotalAmount || '');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch order details from Supabase
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      if (routeOrderId) {
        const { data } = await supabase
          .from('orders')
          .select('id, total, order_status')
          .eq('id', routeOrderId)
          .single();
          
        if (data) {
          setTotalAmount(data.total.toLocaleString());
          setOrderStatus(data.order_status);
        }
      } else {
        const { data } = await supabase
          .from('orders')
          .select('id, total, order_status')
          .eq('order_status', 'PENDING')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (data) {
          setOrderId(data.id);
          setTotalAmount(data.total.toLocaleString());
          setOrderStatus(data.order_status);
        }
      }
      
      setLoading(false);
    };
    
    fetchOrderDetails();
  }, [routeOrderId]);
  
  // Set up the deep link handler for QR code scanning
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (url && url.includes('paymentSuccess') && url.includes(`orderId=${orderId}`)) {
        // Check if this is an auto-confirmation link
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
  
  // Generate QR code content that includes a deep link
  const generateQRISContent = () => {
    return `yourapp://payment/autoProcess?orderId=${orderId}&paymentSuccess=true&autoConfirm=true`;
  };
  
  const qrContent = generateQRISContent();

  // Set up real-time subscription to order status updates
  useEffect(() => {
    if (!orderId) return;
    
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
          if (payload.new.order_status === 'NEW' || payload.new.order_status === 'PAID') {
            handlePaymentSuccess(payload.new.order_status);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId, orderStatus]);

  // Poll for payment status as a backup to real-time updates
  useEffect(() => {
    if (!orderId || orderStatus !== 'PENDING') return;
    
    const checkPaymentStatus = async () => {
      const { data } = await supabase
        .from('orders')
        .select('order_status')
        .eq('id', orderId)
        .single();
        
      if (data && data.order_status !== orderStatus) {
        setOrderStatus(data.order_status);
        if (data.order_status === 'NEW' || data.order_status === 'PAID') {
          handlePaymentSuccess(data.order_status);
        }
      }
    };
    
    const statusInterval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(statusInterval);
  }, [orderId, orderStatus]);

  // Countdown timer
  useEffect(() => {
    if (orderStatus === 'PENDING') {
      const countdownTimer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdownTimer);
            Alert.alert('Payment Expired', 'Your payment session has expired. Please try again.');
            handlePaymentExpired();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [orderStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle payment expiration
  const handlePaymentExpired = async () => {
    if (!orderId) return;
    
    await supabase
      .from('orders')
      .update({ order_status: 'EXPIRED' })
      .eq('id', orderId);
      
    setOrderStatus('EXPIRED');
    navigation.navigate('Orders');
  };
  const handlePaymentSuccess = async (status) => {
    setPaymentComplete(true);
    
    setTimeout(() => {
      navigation.navigate('Orders', { 
        orderId, 
        order_status: status || 'NEW' 
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
          <Text style={styles.title}>QRIS Payment</Text>
          <Text style={styles.subtitle}>Order #{orderId}</Text>
        </View>

        {!paymentComplete ? (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Scan this QR code to complete your payment</Text>
            
            <View style={styles.qrCode}>
              <QRCode
                value={qrContent}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount:</Text>
              <Text style={styles.amount}>Rp {totalAmount}</Text>
            </View>
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Time remaining:</Text>
              <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to pay:</Text>
              <Text style={styles.instructionItem}>1. Open your mobile banking or e-wallet app</Text>
              <Text style={styles.instructionItem}>2. Select the QRIS payment option</Text>
              <Text style={styles.instructionItem}>3. Scan the QR code above</Text>
              <Text style={styles.instructionItem}>4. Confirm the payment amount</Text>
              <Text style={styles.instructionItem}>5. Complete the payment process in your app</Text>
            </View>
            
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={handlePaymentCallback}
              >
                <Text style={styles.testButtonText}>Test Payment Callback</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successText}>
              Your order has been placed successfully. Order status has been updated to "New".
            </Text>
            <Text style={styles.orderIdText}>Order ID: #{orderId}</Text>
          </View>
        )}
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Order Status:</Text>
          <Text style={[
            styles.statusValue, 
            orderStatus === 'New' ? styles.statusNew : styles.statusPending
          ]}>
            {orderStatus}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrCode: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timerWarning: {
    color: '#ff4d4f',
  },
  instructions: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: '#722ed1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#f6ffed',
    borderColor: '#b7eb8f',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#52c41a',
    marginBottom: 10,
  },
  successText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#faad14',
  },
  statusNew: {
    color: '#52c41a',
  },
});

export default QRISPaymentScreen;