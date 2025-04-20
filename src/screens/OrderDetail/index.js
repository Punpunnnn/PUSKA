import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrderContext } from '../../context/OrderContext';
import { useRatingContext } from '../../context/RatingContext';
import BasketDishItem from '../../components/BasketDishItem';
import OrderDetailHeader from './header';

// Separate StarRating component for reusability
const StarRating = ({ rating, setRating, size = 30, disabled = false }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity 
          key={star} 
          onPress={() => !disabled && setRating(star)}
          style={styles.starButton}
          disabled={disabled}
        >
          <Text style={[styles.starIcon, { fontSize: size }]}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [serviceRating, setServiceRating] = useState(0);
  const [foodQualityRating, setFoodQualityRating] = useState(0);
  const [review, setReview] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [contextError, setContextError] = useState(null);
  
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params?.id;
  const { getOrder, updateOrderStatus } = useOrderContext();
  
  // Safely access rating context with error handling
  const ratingContext = useRatingContext();

  useEffect(() => {
    // Check if rating context is available
    if (!ratingContext) {
      console.error("Rating context is undefined!");
      setContextError("Rating functionality unavailable");
    }
  }, [ratingContext]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const orderData = await getOrder(id);
      setOrder(orderData);
      
      // Fetch rating after order is loaded if context is available
      if (orderData && ratingContext) {
        fetchRatingData(orderData);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingData = async (orderData) => {
    try {
      // Only try to fetch ratings if the context is available
      if (ratingContext && ratingContext.getRatingByOrderId) {
        const rating = await ratingContext.getRatingByOrderId(id);
        setUserRating(rating);
        
        if (rating) {
          setServiceRating(rating.service_rating);
          setFoodQualityRating(rating.food_quality_rating);
          setReview(rating.review || '');
        }
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
      // Non-critical error, don't show alert to user
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, getOrder]);

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel"
        },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await updateOrderStatus(id, 'CANCELLED');
              fetchOrder(); // Refresh order data
              Alert.alert("Success", "Your order has been cancelled");
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenRatingModal = () => {
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!ratingContext || !ratingContext.submitRating) {
      Alert.alert("Error", "Rating functionality is not available");
      return;
    }
    
    if (serviceRating === 0 || foodQualityRating === 0) {
      Alert.alert("Error", "Please provide ratings for both service and food quality");
      return;
    }
    
    try {
      setIsLoading(true);
      await ratingContext.submitRating(id, order.restaurants_id, {
        serviceRating,
        foodQualityRating,
        review
      });
      
      await fetchRatingData(order);
      setShowRatingModal(false);
      Alert.alert("Success", "Your rating has been submitted");
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit rating");
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <BasketDishItem 
      basketDish={{
        quantity: item.quantity,
        menus: {
          name: item.menu_name,
          price: item.price
        }
      }} 
    />
  );

  const renderRatingModal = () => {
    return (
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rate Your Order</Text>
            
            <Text style={styles.ratingLabel}>Pelayanan Kantin</Text>
            <StarRating rating={serviceRating} setRating={setServiceRating} />
            
            <Text style={styles.ratingLabel}>Kualitas Makanan dan Minuman</Text>
            <StarRating rating={foodQualityRating} setRating={setFoodQualityRating} />
            
            <Text style={styles.ratingLabel}>Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review (optional)"
              value={review}
              onChangeText={setReview}
              multiline={true}
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (serviceRating === 0 || foodQualityRating === 0) && styles.disabledButton
                ]}
                onPress={handleSubmitRating}
                disabled={serviceRating === 0 || foodQualityRating === 0}
              >
                <Text style={styles.buttonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderUserRating = () => {
    if (!userRating) return null;
    
    return (
      <View style={styles.userRatingSection}>
        <Text style={styles.ratingLabel}>Pelayanan Kantin</Text>
        <StarRating rating={userRating.service_rating} setRating={() => {}} disabled={true} size={24} />
        
        <Text style={styles.ratingLabel}>Kualitas Makanan dan Minuman</Text>
        <StarRating rating={userRating.food_quality_rating} setRating={() => {}} disabled={true} size={24} />
        
        {userRating.review && (
          <>
            <Text style={styles.ratingLabel}>Review</Text>
            <Text style={styles.userReview}>{userRating.review}</Text>
          </>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!order) return null;
    return (
      <View style={styles.footer}>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Harga Asli:</Text>
          <Text style={styles.totalPrice}>
            Rp.{order.original_total.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>PUSKACoin:</Text>
          <Text style={styles.totalPrice}>
            {order.used_coin}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            Rp.{order.total.toLocaleString("id-ID")}
          </Text>
        </View>
        
        {/* Rating section for completed orders */}
        {order.order_status === 'COMPLETED' && (
          <>
            {contextError ? (
              <Text style={styles.errorText}>{contextError}</Text>
            ) : userRating ? (
              renderUserRating()
            ) : (
              <TouchableOpacity 
                style={styles.rateButton}
                onPress={handleOpenRatingModal}
              >
                <Text style={styles.rateButtonText}>Rate This Order</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#B13636" />
      </View>
    );
  }
  
  return (
    <>
      <FlatList
        style={styles.container}
        ListHeaderComponent={() => (
          <OrderDetailHeader 
            order={order} 
            onCancelOrder={order?.status === 'NEW' ? handleCancelOrder : null}
            onPay={null}
          />
        )}
        data={order?.dishes || []}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.contentContainer}
      />
      {renderRatingModal()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rateButton: {
    backgroundColor: '#B13636',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  starIcon: {
    color: '#FFA500',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#B13636',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D89999',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userRatingSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  userReview: {
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  editRatingButton: {
    backgroundColor: '#B13636',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editRatingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#B13636',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OrderDetail;