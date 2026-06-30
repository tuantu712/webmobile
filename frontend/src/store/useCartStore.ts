import { create } from 'zustand';

export interface CartItem {
  id: string; // unique cart item id (e.g. productId-size-color)
  productId: number;
  name: string;
  price: number;
  prev_price?: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  stock: number;
}

interface CartState {
  cartItems: CartItem[];
  
  initialize: () => void;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],

  initialize: () => {
    try {
      const storedCart = localStorage.getItem('fuzzy_cart_items');
      if (storedCart) {
        set({ cartItems: JSON.parse(storedCart) });
      }
    } catch (e) {
      console.error('Failed to parse cached cart items:', e);
      localStorage.removeItem('fuzzy_cart_items');
    }
  },

  addItem: (item, quantity = 1) => {
    const cartItems = get().cartItems;
    const itemKey = `${item.productId}-${item.size || 'default'}-${item.color || 'default'}`;
    
    const existingIndex = cartItems.findIndex(i => i.id === itemKey);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      // Item exists, update quantity up to stock limits
      updatedCart = [...cartItems];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      updatedCart[existingIndex].quantity = Math.min(newQty, item.stock);
    } else {
      // Add new item
      updatedCart = [...cartItems, { ...item, id: itemKey, quantity: Math.min(quantity, item.stock) }];
    }

    localStorage.setItem('fuzzy_cart_items', JSON.stringify(updatedCart));
    set({ cartItems: updatedCart });
  },

  removeItem: (id) => {
    const updatedCart = get().cartItems.filter(i => i.id !== id);
    localStorage.setItem('fuzzy_cart_items', JSON.stringify(updatedCart));
    set({ cartItems: updatedCart });
  },

  updateQuantity: (id, quantity) => {
    const updatedCart = get().cartItems.map(item => {
      if (item.id === id) {
        // Clamp quantity between 1 and product's stock
        const validQuantity = Math.max(1, Math.min(quantity, item.stock));
        return { ...item, quantity: validQuantity };
      }
      return item;
    });

    localStorage.setItem('fuzzy_cart_items', JSON.stringify(updatedCart));
    set({ cartItems: updatedCart });
  },

  clearCart: () => {
    localStorage.removeItem('fuzzy_cart_items');
    set({ cartItems: [] });
  },

  getCartTotal: () => {
    return get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartItemsCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}));

// Initialize store immediately upon import to prevent race conditions
useCartStore.getState().initialize();
