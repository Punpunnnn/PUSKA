import { createContext, useEffect, useState, useContext } from "react";
import {supabase} from '../lib/supabase';
import {useAuthContext} from './AuthContext';
import {useBasketContext} from './BasketContext';

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbUser  } = useAuthContext();
  const { restaurant, totalPrice, basketDishes, clearBasket } = useBasketContext();

  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState(''); // Add notes state
  const [paymentMethod, setPaymentMethod] = useState('CASH'); 

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
      .eq("user_id", dbUser.id);

    if (error) console.error("Error fetching orders:", error);
    else setOrders(data);
  };

  useEffect(() => {// Debugging
    fetchOrders();
  }, [dbUser]);
  

  // Function to update notes
  const updateNotes = (text) => {
    setNotes(text);
  };

  const updatePaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  const createOrder = async (finalPrice) => {
    const safeDiscountedPrice = isNaN(finalPrice) ? totalPrice : finalPrice;
    const usedCoins = totalPrice - safeDiscountedPrice;

    const orderStatus = paymentMethod === 'QRIS' ? 'PENDING' : 'NEW';
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: dbUser.id,
          restaurants_id: restaurant.id,
          total: safeDiscountedPrice,
          original_total: totalPrice,
          order_status: orderStatus,
          type: paymentMethod,
          notes,
          used_coin: usedCoins,
        },
      ])
      .select(`
        *,
        Restaurant:restaurants_id (
          id,
          title,
          image
        )
      `)
      .single();

    if (orderError || !newOrder) {
      console.error("Error creating order:", orderError || "newOrder is null");
      return null;
    }

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

    // Gunakan clearBasket dari basketContext
    try {
      await clearBasket();
    } catch (error) {
      console.error("Error clearing basket:", error);
    }

    setOrders((prevOrders) => [...prevOrders, newOrder]);
    
    // Clear notes after order is created
    setNotes('');
    setPaymentMethod('cash');

    return newOrder;
};

const clearCompletedOrders = async () => {
  try {
    console.log("Menghapus pesanan selesai...");

    const { error } = await supabase
      .from("orders")
      .update({is_deleted: true}) // Assuming you have a column to mark as deleted
      .eq("user_id", dbUser.id)
      .eq("order_status", "COMPLETED");


    if (error) {
      console.error("Error deleting completed orders:", error);
      return false;
    }

    console.log("Berhasil menghapus, sekarang fetch ulang data...");
    
    await fetchOrders(); // Panggil ulang fetchOrders() langsung
    
    return true;
  } catch (error) {
    console.error("Exception when clearing completed orders:", error);
    return false;
  }
};

  const getOrder = async (orderId) => {
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select(`
                *,
                Restaurant:restaurants_id (
                    id,
                    title,
                    image
                )
            `)
            .eq("id", orderId)
            .single();

        if (orderError) {
            throw new Error(`Error fetching order: ${orderError.message}`);
        }

        // Then, get the order dishes with menu details
        const { data: orderDishes, error: dishesError } = await supabase
            .from("order_dishes")
            .select(`
                *,
                menus (
                    id,
                    name,
                    price,
                    image
                )
            `)
            .eq("order_id", orderId);

        if (dishesError) {
            throw new Error(`Error fetching order dishes: ${dishesError.message}`);
        }

        // Format the order data
        return {
            ...order,
            restaurant: order.Restaurant,
            dishes: orderDishes.map(dish => ({
                id: dish.id,
                quantity: dish.quantity,
                menu_name: dish.menus.name,
                price: dish.menus.price,
            }))
        };
  };

  const updateOrderStatus = async (orderId, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);
    if (error) throw error;
  }
  return (
    <OrderContext.Provider value={{ 
      createOrder, 
      orders, 
      getOrder, 
      notes,         // Expose notes state
      updateNotes,    // Expose function to update notes
      paymentMethod,  // Expose paymentMethod state
      updatePaymentMethod,
      clearCompletedOrders,// Expose function to update paymentMethod
      updateOrderStatus,  // Expose function to update order status
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);