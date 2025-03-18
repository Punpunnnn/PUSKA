import {View, Text, Image, StyleSheet} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const RestaurantHeader = ({restaurant}) => {
    return (
        <View style={styles.page}>
            <Image source={{ uri: restaurant.image }} style={styles.image} />
            <View style={styles.container}>
                <Text style={styles.title}>{restaurant.title}</Text>
                <Text style={styles.subtitle}>{restaurant.subtitle}</Text>
                <View style={styles.rating}>
                    <Text style={{ fontSize: 16, color: 'black' }}>
                        {restaurant.rating ? restaurant.rating + " -" : "---"}
                    </Text>
                    {restaurant.rating && <Ionicons name="star" size={20} color="gold" />}
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
        borderBottomColor: "lightgray",
        borderBottomWidth: 1,
    },
    IconContainer: {
        position: "absolute",
        top: 40,
        left: 10,
        zIndex: 1,
    },
    image: {
        width: "100%",
        aspectRatio: 5 / 3,
        marginBottom: 5,
    },
    title: {
        marginLeft: 10,
        fontSize: 35,
        fontWeight: "600",
        marginVertical: 5,
    },
    subtitle: {
        marginLeft: 10,
        fontSize: 16,
        color: "#525252",
        marginBottom: 10,
    },
    rating: {
        marginLeft: 10,
        marginBottom: 10,
        flexDirection: "row",
        gap: 5,
    }
});

export default RestaurantHeader;