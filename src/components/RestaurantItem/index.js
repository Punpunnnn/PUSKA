import {View, Text, StyleSheet, Image, Pressable} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
const RestaurantItem = ({ restaurant }) => {
  const navigation=useNavigation();

  const onPress = () => {
    navigation.navigate("Restaurant", { id: restaurant.id });
  };
    return (
          <Pressable onPress={onPress} style={styles.restaurantContainer}>
            <Image source={{ uri: restaurant.image }} style={styles.image} />
            <View style={styles.column}>
            <View style={styles.rating}>
            <Ionicons name="star" size={18} color="white" />
                <Text style={styles.fontRating}>{restaurant.rating}</Text>
            </View>
              <View style={{marginLeft: 5}}>
                <Text style={styles.title}>{restaurant.title}</Text>
                <Text style={styles.subtitle}>{restaurant.subtitle}</Text>
              </View> 
            
            </View>
           </Pressable>
    );
};

const styles = StyleSheet.create({
    restaurantContainer: {
      width: "100%",
      marginBottom: 10,
      borderBottomColor: "lightgray",
      borderBottomWidth: 1,
      padding: 15,
      borderRadius: 10,
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
    },
    subtitle: {
      fontSize: 16,
      color: "grey",
      marginBottom: 10,
    },
    column: {
      flexDirection: "column",
    },
    rating: {
      backgroundColor: "maroon",
      width: 70,
      height: 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
    fontRating: {
      marginLeft: 10,
      color: "white",
      fontWeight: "bold",
    },
  });

export default RestaurantItem;