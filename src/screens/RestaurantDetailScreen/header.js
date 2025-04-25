import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useRatingContext } from '../../context/RatingContext';
import { useNavigation } from '@react-navigation/native';

const RestaurantHeader = ({ restaurant }) => {
  const { getRestaurantRatings } = useRatingContext();
  const [serviceRating, setServiceRating] = useState(null);
  const [totalUser, setTotalUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRatings = async () => {
      const result = await getRestaurantRatings(restaurant.id);
      setServiceRating(result?.summary?.avgServiceRating);
      setTotalUser(result?.summary?.totalReviews);
    };
    fetchRatings();
  }, [restaurant.id]);

  const goToReviewPage = () => {
    navigation.navigate("RestaurantReview", { restaurantId: restaurant.id });
  };

  return (
    <View style={styles.page}>
      <Image source={{ uri: restaurant.image }} style={styles.image} />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.textSection}>
            <Text style={styles.title}>{restaurant.title}</Text>
            <Text style={styles.subtitle}>{restaurant.subtitle}</Text>
          </View>

          <Pressable onPress={goToReviewPage} style={styles.ratingBox}>
            <View style={styles.ratingTop}>
              <Ionicons name="star" size={16} color="white" />
              <Text style={styles.ratingText}>
                {serviceRating !== null ? serviceRating.toFixed(1) : "?"}
              </Text>
            </View>
            <Text style={styles.reviewText}>
              {totalUser !== null
                ? totalUser > 10
                  ? "+10 Reviews"
                  : `${totalUser} Review${totalUser > 1 ? "s" : ""}`
                : "?"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: "#FAF9F6",
    shadowOpacity: 0.2,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    marginBottom: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 5 / 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textSection: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#525252",
    marginBottom: 10,
  },
  ratingBox: {
    backgroundColor: '#88362F',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  ratingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  reviewText: {
    color: "white",
    fontSize: 10,
  },
});

export default RestaurantHeader;
