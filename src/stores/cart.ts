import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem, Product } from '@/types';
import { calculateTax } from '@/utils';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product) => {
        const items = get().items;
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          const newItem: CartItem = {
            id: `cart-${Date.now()}-${Math.random()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          };
          set({ items: [...items, newItem] });
        }
      },
      
      removeItem: (productId: string) => {
        set({
          items: get().items.filter(item => item.productId !== productId)
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTax: (taxRate: number) => {
        return calculateTax(get().getSubtotal(), taxRate);
      },
      
      getTotal: (taxRate: number) => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax(taxRate);
        return subtotal + tax;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);