import React, { useState } from 'react';
import { Pressable, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useOrderContext } from '../../context/OrderContext';  

const ClearHistoryButton = () => {
  const { clearCompletedOrders } = useOrderContext();
  const [loading, setLoading] = useState(false);

  const handleClearHistory = () => {
    Alert.alert(
      "Hapus Riwayat Pesanan",
      "Apakah kamu yakin ingin menghapus riwayat pesanan ini? tindakan ini tidak dapat dikembalikan semula",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await clearCompletedOrders();
              if (success) {
                Alert.alert("Success", "All completed orders have been deleted.");
              } else {
                Alert.alert("Error", "Failed to delete completed orders. Please try again.");
              }
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "An unexpected error occurred. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Pressable 
      onPress={handleClearHistory}
      style={({ pressed }) => [
        styles.clearButton,
        pressed && styles.pressed
      ]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="gray" />
      ) : (
        <Text style={styles.clearText}>Hapus Riwayat</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    paddingBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  clearText: {
    color: 'gray',
    fontWeight: '500',
  }
});

export default ClearHistoryButton;