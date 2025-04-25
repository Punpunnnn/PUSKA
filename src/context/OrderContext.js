import { createContext, useContext, useEffect, useState } from "react";
import { useBasketContext } from "./BasketContext";
import { useAuthContext } from "./AuthContext";
import { supabase } from "../lib/supabase";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { restaurant, totalPrice, basketDishes, clearBasket } = useBasketContext();
  const { dbUser } = useAuthContext();

  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

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

    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
  };

  // Setup realtime order untuk user
  useEffect(() => {
    if (!dbUser?.id) return;
  
    fetchOrders(); // Initial fetch
  
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
        (payload) => {
          console.log("Realtime orders payload:", payload);
          fetchOrders(); // Refresh orders saat ada perubahan
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [dbUser]);

  const createOrder = async (finalPrice) => {
    try {
      const safeDiscountedPrice = isNaN(finalPrice) ? totalPrice : finalPrice;
      const usedCoins = totalPrice - safeDiscountedPrice;
      const orderStatus = paymentMethod === 'QRIS' ? 'PENDING' : 'NEW';
  
      // Gunakan .select() untuk mendapatkan data yang diinsert
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: dbUser.id,
          restaurants_id: restaurant.id,
          total: safeDiscountedPrice,
          original_total: totalPrice,
          order_status: orderStatus,
          type: paymentMethod,
          notes,
          used_coin: usedCoins,
        }])
        .select();
  
      if (orderError || !data || data.length === 0) {
        console.error("Error creating order:", orderError || "No data returned");
        return null;
      }
  
      const newOrder = data[0]; // Ambil order pertama dari array data
      
      const orderDishes = basketDishes.map((basketDish) => ({
        quantity: basketDish.quantity,
        order_id: newOrder.id,
        menus_id: basketDish.menus.id,
      }));
  
      const { error: dishesError } = await supabase
        .from("order_dishes")
        .insert(orderDishes);
  
      if (dishesError) {
        console.error("Error adding order dishes:", dishesError);
        return null;
      }
  
      // Pastikan basket dibersihkan setelah order berhasil dibuat
      const clearResult = await clearBasket();
      if (!clearResult) {
        console.warn("Warning: Basket might not be cleared properly");
      }
      
      setNotes('');
      setPaymentMethod('CASH');
      return newOrder;
    } catch (error) {
      console.error("Error in createOrder:", error);
      return null;
    }
  };

  const getOrder = async (orderId) => {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`*, Restaurant:restaurants_id (id, title, image)`)
      .eq("id", orderId)
      .single();

    if (orderError) {
      throw new Error(`Error fetching order: ${orderError.message}`);
    }

    const { data: orderDishes, error: dishesError } = await supabase
      .from("order_dishes")
      .select(`*, menus (id, name, price, image)`)
      .eq("order_id", orderId);

    if (dishesError) {
      throw new Error(`Error fetching order dishes: ${dishesError.message}`);
    }

    return {
      ...order,
      status: order.order_status,
      restaurant: order.Restaurant,
      dishes: orderDishes.map((dish) => ({
        id: dish.id,
        quantity: dish.quantity,
        menu_name: dish.menus.name,
        price: dish.menus.price,
      })),
    };
  };

  const updateOrderStatus = async (orderId, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);
    if (error) throw error;
  };

  const clearCompletedOrders = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ is_deleted: true })
      .eq("user_id", dbUser.id)
      .eq("order_status", "COMPLETED");

    if (error) {
      console.error("Error deleting completed orders:", error);
      return false;
    }

    await fetchOrders(); // Refresh
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
