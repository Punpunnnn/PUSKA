import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useOrderContext } from '../../context/OrderContext';
import OrderListItem from '../../components/OrderListItem';
import ClearHistoryButton from '../../components/ClearHistory';

const OrderScreen = () => {
    const { orders } = useOrderContext();
    const [activeTab, setActiveTab] = useState('ongoing');
    
    // Separate orders into ongoing and completed
    const ongoingOrders = orders.filter(order => order.order_status !== 'COMPLETED');
    const completedOrders = orders.filter(order => order.order_status === 'COMPLETED');

    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.headerTitle}>Order</Text>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <ClearHistoryButton />
                </View>   
            </View>
    
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    onPress={() => setActiveTab('ongoing')}
                    style={[
                        styles.tabButton,
                        activeTab === 'ongoing' && styles.activeTabButton
                    ]}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'ongoing' && styles.activeTabText
                    ]}>Diproses</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => setActiveTab('history')}
                    style={[
                        styles.tabButton,
                        activeTab === 'history' && styles.activeTabButton
                    ]}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'history' && styles.activeTabText
                    ]}>Riwayat</Text>
                </TouchableOpacity>
            </View>
    
            {/* Order Lists */}
            {activeTab === 'ongoing' && (
                <FlatList 
                    data={ongoingOrders} 
                    renderItem={({ item }) => <OrderListItem order={item} />}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyListText}>No ongoing orders</Text>
                    )}
                />
            )}
    
            {activeTab === 'history' && (
                <FlatList 
                    data={completedOrders} 
                    renderItem={({ item }) => <OrderListItem order={item} />}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyListText}>No order history</Text>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 25,
        color: '#333',
        padding: 16,
      },
    headerLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: '#ff4500',
    },
    tabText: {
        textAlign: 'center',
        color: 'gray',
    },
    activeTabText: {
        color: '#ff4500',
    },
    emptyListText: {
        padding: 16,
        textAlign: 'center',
        color: 'gray',
    },
});

export default OrderScreen;