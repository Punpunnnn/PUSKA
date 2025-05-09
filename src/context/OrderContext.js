import { createContext, useContext, useEffect, useState } from "react";
import { useBasketContext } from "./BasketContext";
import { useAuthContext } from "./AuthContext";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { restaurant, totalPrice, basketDishes, clearBasket } = useBasketContext();
  const { dbUser } = useAuthContext();

  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const updateNotes = (text) => setNotes(text);
  const updatePaymentMethod = (method) => setPaymentMethod(method);
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        Restaurant:restaurants_id (
          id,
          title,
          image
        )
      `)
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false });

    if (error) {
       console.error("Error fetching orders:", error);
    }
    setOrders(data);
  };

  useEffect(() => {
    if (!dbUser?.id) return;
  
    fetchOrders();  
  
    const subscription = supabase
      .channel("user-orders-" + dbUser.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${dbUser.id}`,
        },
        () => {
          fetchOrders();  
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [dbUser]);

  const createOrder = async (finalPrice) => {
    try {
      if (!paymentMethod) {
        Alert.alert('Pilih Metode Pembayaran', 'Pilih metode pembayaran terlebih dahulu.');
        return;
      }
      const safeDiscountedPrice = isNaN(finalPrice) ? totalPrice : finalPrice;
      const usedCoins = totalPrice - safeDiscountedPrice;
      const orderStatus = paymentMethod === 'QRIS' ? 'PENDING' : 'NEW';
  
      const orderPayload = {
        user_id: dbUser.id,
        restaurants_id: restaurant.id,
        total: safeDiscountedPrice,
        original_total: totalPrice,
        order_status: orderStatus,
        type: paymentMethod,
        notes,
        used_coin: usedCoins,
      };
  
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select();
  
      if (orderError || !orderData?.[0]) {
        console.error("Error membuat pesanan:", orderError || "No data returned");
        return null;
      }
  
      const newOrder = orderData[0];
  
      const orderDishesPayload = basketDishes.map(({ quantity, menus }) => ({
        quantity,
        order_id: newOrder.id,
        menus_id: menus.id,
      }));
  
      const { error: dishesError } = await supabase
        .from("order_dishes")
        .insert(orderDishesPayload);
  
      if (dishesError) {
        console.error("Error menambahkan menu ke pesanan:", dishesError);
        return null;
      }
      await clearBasket();  
      setNotes('');
      setPaymentMethod('');
  
      return newOrder;
    } catch (error) {
      console.error("Error in createOrder:", error);
      return null;
    }
  };
  
  const getOrder = async (orderId) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`*, Restaurant:restaurants_id (id, title, image)`)
        .eq("id", orderId)
        .single();
  
      if (orderError || !order) {
        throw new Error(`Gagal mengambil data order: ${orderError?.message || 'Order tidak ditemukan'}`);
      }
  
      const { data: orderDishes, error: dishesError } = await supabase
        .from("order_dishes")
        .select(`id, quantity, menus (id, name, price, image)`)
        .eq("order_id", orderId);
  
      if (dishesError) {
        throw new Error(`Gagal mengambil data menu pesanan: ${dishesError.message}`);
      }
  
      return {
        id: order.id,
        status: order.order_status,
        total: order.total,
        original_total: order.original_total,
        notes: order.notes,
        type: order.type,
        used_coin: order.used_coin,
        restaurantId: order.restaurants_id,
        created_at: order.created_at,
        restaurant: order.Restaurant,
        dishes: orderDishes.map(({ id, quantity, menus }) => ({
          id,
          quantity,
          menu_id: menus.id,
          menu_name: menus.name,
          price: menus.price,
          image: menus.image,
        })),
      };
    } catch (error) {
      console.error("getOrder error:", error);
      throw error;
    }
  };  

  const updateOrderStatus = async (orderId, status) => {
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('user_id, used_coin')
      .eq('id', orderId)
      .single();
  
    if (fetchError) {
      throw fetchError;
    }
  
    const updates = [];
    if ((status === 'CANCELLED' || status === 'EXPIRED') && orderData.used_coin > 0) {
      updates.push(
        supabase.rpc('increment_coins', {
          user_id_param: orderData.user_id,
          coin_amount: orderData.used_coin,
        })
      );
    }
    updates.push(
      supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)
    );
  
    const results = await Promise.all(updates);
  
    for (const result of results) {
      if (result.error) {
        throw result.error;
      }
    }
  };

  const clearCompletedOrders = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ is_deleted: true })
      .eq("user_id", dbUser.id)
      .in("order_status", ["COMPLETED", "CANCELLED", "EXPIRED"]);

    if (error) {
      console.error("Error deleting completed orders:", error);
      return false;
    }

    await fetchOrders();  
    return true;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      getOrder,
      updateOrderStatus,
      clearCompletedOrders,
      notes,
      updateNotes,
      paymentMethod,
      updatePaymentMethod,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;
export const useOrderContext = () => useContext(OrderContext);
