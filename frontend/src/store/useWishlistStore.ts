import { create } from 'zustand';

export interface WishlistItem {
  id: number;
  name: string;
  description: string;
  price: number;
  prev_price?: number;
  image: string;
  rating: number;
  stock: number;
  sizes: string[];
  colors: string[];
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  
  initialize: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],

  initialize: () => {
    try {
      const stored = localStorage.getItem('fuzzy_wishlist_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          set({ wishlistItems: parsed });
        } else {
          set({ wishlistItems: [] });
        }
      }
    } catch (e) {
      console.error('Failed to parse cached wishlist:', e);
      localStorage.removeItem('fuzzy_wishlist_items');
    }
  },

  toggleWishlist: (item) => {
    const items = get().wishlistItems;
    const exists = items.some(i => i.id === item.id);
    let updated: WishlistItem[];

    if (exists) {
      // Remove it
      updated = items.filter(i => i.id !== item.id);
    } else {
      // Add it
      updated = [...items, item];
    }

    set({ wishlistItems: updated });
    localStorage.setItem('fuzzy_wishlist_items', JSON.stringify(updated));
  },

  isInWishlist: (id) => {
    return get().wishlistItems.some(i => i.id === id);
  },

  clearWishlist: () => {
    set({ wishlistItems: [] });
    localStorage.removeItem('fuzzy_wishlist_items');
  }
}));

// Initialize store immediately upon import to prevent race conditions
useWishlistStore.getState().initialize();
