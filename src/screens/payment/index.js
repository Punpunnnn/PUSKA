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
  const [timeLeft, setTimeLeft] = useState(10); // 5 minutes in seconds
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loading, setLoading] = useState(true);

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
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId, orderStatus]);

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

  useEffect(() => {
    if (orderStatus === 'PENDING') {
      const countdownTimer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdownTimer);
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

  const handlePaymentExpired = async () => {
    if (!orderId) return;

    await supabase
      .from('orders')
      .update({ order_status: 'EXPIRED' })
      .eq('id', orderId);

    setOrderStatus('EXPIRED');
    Alert.alert(
      'Payment Expired',
      'Your payment session has expired. Please try again.',
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
                <Text style={styles.buttontext}>Tekan untuk menyegarkan ulang</Text>
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
            orderStatus === 'NEW' ? styles.statusNew : styles.statusPending
          ]}>
            {orderStatus === 'NEW' ? 'Baru' : 'Menunggu'}
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
});

export default QRISPaymentScreen;
