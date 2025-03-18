import {View, StyleSheet, Image, Text, Pressable} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DishListItem = ({menus}) => {
    const navigation = useNavigation();
    return (
        <Pressable onPress={() => navigation.navigate('Dish', {id: menus.id})} style={styles.container}>
            <Image source={{uri: menus.image}} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{menus.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{menus.description}</Text>
                <Text style={styles.price}>Rp.{(menus.price).toLocaleString('id-ID')}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        marginVertical: 10,
        marginHorizontal: 10,
        flexDirection: 'row',
        marginVertical: 10,
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    infoContainer: {
        marginHorizontal: 10,
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    desc: {
        fontSize: 14,
        color: 'grey',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e47911',
    },
});

export default DishListItem;