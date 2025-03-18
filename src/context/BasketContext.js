import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "./AuthContext";

const BasketContext = createContext({});

const BasketContextProvider = ({ children }) => {
  const { dbUser } = useAuthContext();
  const [restaurant, setRestaurant] = useState(null);
  const [basket, setBasket] = useState(null);
  const [basketDishes, setBasketDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = basketDishes.reduce(
    (sum, basketDish) => sum + basketDish.quantity * (basketDish.menus?.price || 0),
    0
  );

  // Fetch or create basket
  const getOrCreateBasket = async () => {
    if (!dbUser || !restaurant) return null;

    try {
      // First try to fetch existing basket
      let { data: existingBasket, error: fetchError } = await supabase
        .from("baskets")
        .select("*")
        .eq("restaurants_id", restaurant.id)
        .eq("profiles_id", dbUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }

      // If no basket exists, create one
      if (!existingBasket) {
        const { data: newBasket, error: createError } = await supabase
          .from("baskets")
          .insert([{ 
            profiles_id: dbUser.id, 
            restaurants_id: restaurant.id 
          }])
          .single();

        if (createError) throw createError;
        return newBasket;
      }

      return existingBasket;
    } catch (error) {
      console.error("Error in getOrCreateBasket:", error);
      return null;
    }
  };

  // Fetch basket and dishes
  useEffect(() => {
    const initializeBasket = async () => {
      if (!dbUser || !restaurant) {
        setBasket(null);
        setBasketDishes([]);
        return;
      }

      setIsLoading(true);
      try {
        const currentBasket = await getOrCreateBasket();
        setBasket(currentBasket);

        if (currentBasket) {
          const { data: dishes, error } = await supabase
            .from("basket_items")
            .select("*, menus (id, name, price)")
            .eq("basket_id", currentBasket.id);

          if (error) throw error;
          setBasketDishes(dishes || []);
        }
      } catch (error) {
        console.error("Error initializing basket:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeBasket();
  }, [dbUser, restaurant]);

  // Add or update dish quantity
  const addDishToBasket = async (menu, quantity) => {
    if (!dbUser || !restaurant) return;

    setIsLoading(true);
    try {
      let currentBasket = basket || await getOrCreateBasket();
      if (!currentBasket) throw new Error("Could not create basket");

      // Check if dish already exists in basket
      const existingDishIndex = basketDishes.findIndex(
        dish => dish.menus_id === menu.id
      );

      if (existingDishIndex !== -1) {
        // Update existing dish quantity
        const existingDish = basketDishes[existingDishIndex];
        const newQuantity = existingDish.quantity + quantity;

        const { data, error } = await supabase
          .from("basket_items")
          .update({ quantity: newQuantity })
          .eq("id", existingDish.id)
          .select("*, menus (id, name, price)")
          .single();

        if (error) throw error;

        const updatedDishes = [...basketDishes];
        updatedDishes[existingDishIndex] = data;
        setBasketDishes(updatedDishes);
      } else {
        // Add new dish
        const { data, error } = await supabase
          .from("basket_items")
          .insert([{
            quantity,
            menus_id: menu.id,
            basket_id: currentBasket.id
          }])
          .select("*, menus (id, name, price)")
          .single();

        if (error) throw error;
        setBasketDishes([...basketDishes, data]);
      }
    } catch (error) {
      console.error("Error in addDishToBasket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update dish quantity
  const updateDishQuantity = async (basketDishId, newQuantity) => {
    setIsLoading(true);
    try {
      if (newQuantity <= 0) {
        // Remove dish if quantity is 0 or negative
        const { error } = await supabase
          .from("basket_items")
          .delete()
          .eq("id", basketDishId);

        if (error) throw error;
        setBasketDishes(basketDishes.filter(dish => dish.id !== basketDishId));
      } else {
        // Update quantity
        const { data, error } = await supabase
          .from("basket_items")
          .update({ quantity: newQuantity })
          .eq("id", basketDishId)
          .select("*, menus (id, name, price)")
          .single();

        if (error) throw error;
        setBasketDishes(basketDishes.map(dish => 
          dish.id === basketDishId ? data : dish
        ));
      }
    } catch (error) {
      console.error("Error updating dish quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear basket
  const clearBasket = async () => {
    if (!basket) return;
    setIsLoading(true);
      const { error } = await supabase
        .from("basket_items")
        .delete()
        .eq("basket_id", basket.id);

      if (error) throw error;
      setBasketDishes([]);
  };

  return (
    <BasketContext.Provider
      value={{
        addDishToBasket,
        updateDishQuantity,
        clearBasket,
        setRestaurant,
        restaurant,
        basket,
        basketDishes,
        totalPrice,
        isLoading
      }}
    >
      {children}
    </BasketContext.Provider>
  );
};

export default BasketContextProvider;

export const useBasketContext = () => useContext(BasketContext);