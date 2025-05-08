import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const PaymentMethodModal = ({ visible, onClose, onSelectMethod, totalPrice }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(600);  

    useEffect(() => {
        let timer;
        if (selectedMethod === 'QRIS' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [selectedMethod, timeLeft]);

    const generateQRData = () => {
         
        return JSON.stringify({
            amount: totalPrice,
            timestamp: new Date().toISOString(),
            merchantId: 'YOUR_MERCHANT_ID',
        });
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        if (method === 'QRIS') {
            setQrData(generateQRData());
        }
        onSelectMethod(method);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const resetModal = () => {
        setSelectedMethod(null);
        setQrData(null);
        setTimeLeft(600);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>
                    
                    <Pressable 
                        style={[styles.methodButton, selectedMethod === 'QRIS' && styles.selectedMethod]}
                        onPress={() => handleMethodSelect('QRIS')}
                    >
                        <Text>QRIS</Text>
                    </Pressable>

                    <Pressable 
                        style={[styles.methodButton, selectedMethod === 'CASH' && styles.selectedMethod]}
                        onPress={() => handleMethodSelect('CASH')}
                    >
                        <Text>Cash</Text>
                    </Pressable>

                    {selectedMethod === 'QRIS' && qrData && (
                        <View style={styles.qrContainer}>
                            <QRCode value={qrData} size={200} />
                            <Text style={styles.timer}>Time remaining: {formatTime(timeLeft)}</Text>
                            <Text style={styles.amount}>
                                Amount: Rp.{totalPrice.toLocaleString('id-ID')}
                            </Text>
                        </View>
                    )}

                    <Pressable style={styles.closeButton} onPress={resetModal}>
                        <Text>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = {
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    methodButton: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
    },
    selectedMethod: {
        backgroundColor: '#e6e6e6',
    },
    qrContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    timer: {
        marginTop: 10,
        fontSize: 16,
    },
    amount: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#e6e6e6',
        borderRadius: 5,
        alignItems: 'center',
    },
};

export default PaymentMethodModal;