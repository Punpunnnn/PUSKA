import {View, Text, StyleSheet, Image, Pressable} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRatingContext } from "../../context/RatingContext";  
const RestaurantItem = ({ restaurant, menus }) => {
  const navigation = useNavigation();
  const { getRestaurantRatings } = useRatingContext();
  const [serviceRating, setServiceRating] = useState(null);
  const isClosed = !restaurant.is_open;
  const noMenu = menus.length === 0;

  const fetchRatings = async () => {
     
    const result = await getRestaurantRatings(restaurant.id, false);
    setServiceRating(result?.avgServiceRating);
  };

  useEffect(() => {
    fetchRatings();
  }, [restaurant.id]);

  const onPress = () => {
    if (restaurant.is_open && !noMenu) {
      navigation.navigate("Restaurant", { id: restaurant.id });
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.restaurantContainer}>
      <View style={{ position: "relative" }}>
        {/* Bagian yang redup */}
        <View style={(isClosed || noMenu) && { opacity: 0.5 }}>
          <Image source={{ uri: restaurant.image }} style={styles.image} />

          <View style={styles.column}>
            {typeof serviceRating === 'number' && (
              <View style={styles.rating}>
                <Ionicons name="star" size={18} color="orange" />
                <Text style={styles.fontRating}>
                  {serviceRating.toFixed(1)}
                </Text>
              </View>
            )}

            <View style={{ marginLeft: 5 }}>
              <Text style={styles.title}>{restaurant.title}</Text>
              <Text style={styles.subtitle}>{restaurant.subtitle}</Text>
            </View>
          </View>
        </View>

        {isClosed && (
          <View style={styles.overlay}>
            <Text style={styles.closedText}>TUTUP</Text>
          </View>
        )}

        {noMenu && (
        <View style={styles.overlay}>
          <Text style={styles.closedText}>BELUM ADA MENU</Text>
        </View>
       )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  restaurantContainer: {
    width: "100%",
    borderRadius: 8,
    shadowOpacity: 0.2,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    backgroundColor: "#FCFCFC",  
    elevation: 3,  
    marginBottom: 20,
  },
  image: {
    width: "100%",
    aspectRatio: 5 / 3,
    marginBottom: 5,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 5,
    color: "#333333",
  },
  subtitle: {
    fontSize: 16,
    color: "#333333",
    opacity: 0.7,
    marginBottom: 10,
  },
  column: {
    padding: 10,
    flexDirection: "column",
  },
  rating: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 5,
  },
  fontRating: {
    marginRight: 5,
    color: "#333333",
    fontSize: 18,
    fontWeight: "bold",
  },
  });

export default RestaurantItem;