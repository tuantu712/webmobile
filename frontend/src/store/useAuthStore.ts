import { create } from 'zustand';
import apiClient from '../api/axios';

export interface Address {
  id: string;
  title: string;
  receiver: string;
  phone: string;
  detail: string;
  city: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  birthday?: string;
  avatar?: string;
  addresses: Address[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  initialize: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: { name: string; phone: string; birthday: string; avatar: string }) => Promise<boolean>;
  addAddress: (addressData: Omit<Address, 'id'>) => Promise<boolean>;
  updateAddress: (addressData: Address) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
}

// Helpers for encoding/decoding local storage values
const encryptData = (data: string): string => btoa(encodeURIComponent(data));
const decryptData = (data: string): string => decodeURIComponent(atob(data));

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    try {
      const encryptedToken = localStorage.getItem('fuzzy_auth_token');
      const encryptedUser = localStorage.getItem('fuzzy_auth_user');
      
      if (encryptedToken && encryptedUser) {
        const token = decryptData(encryptedToken);
        const user = JSON.parse(decryptData(encryptedUser));
        set({ token, user, isAuthenticated: true });
      }
    } catch (e) {
      console.error('Failed to parse cached auth state:', e);
      localStorage.removeItem('fuzzy_auth_token');
      localStorage.removeItem('fuzzy_auth_user');
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      const encryptedToken = encryptData(token);
      const encryptedUser = encryptData(JSON.stringify(user));
      
      localStorage.setItem('fuzzy_auth_token', encryptedToken);
      localStorage.setItem('fuzzy_auth_user', encryptedUser);
      
      set({ token, user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Login failed. Please check credentials.';
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  register: async (email, password, name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/api/auth/register', { email, password, name, phone });
      const { token, user } = response.data;
      
      const encryptedToken = encryptData(token);
      const encryptedUser = encryptData(JSON.stringify(user));
      
      localStorage.setItem('fuzzy_auth_token', encryptedToken);
      localStorage.setItem('fuzzy_auth_user', encryptedUser);
      
      set({ token, user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Registration failed. Try again.';
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('fuzzy_auth_token');
    localStorage.removeItem('fuzzy_auth_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const response = await apiClient.get('/api/auth/profile');
      const { user } = response.data;
      const encryptedUser = encryptData(JSON.stringify(user));
      localStorage.setItem('fuzzy_auth_user', encryptedUser);
      set({ user });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put('/api/auth/profile', profileData);
      const { user } = response.data;
      
      const encryptedUser = encryptData(JSON.stringify(user));
      localStorage.setItem('fuzzy_auth_user', encryptedUser);
      
      set({ user, isLoading: false });
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to update profile.';
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await apiClient.post('/api/auth/addresses', addressData);
      const { addresses } = response.data;
      
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, addresses };
        const encryptedUser = encryptData(JSON.stringify(updatedUser));
        localStorage.setItem('fuzzy_auth_user', encryptedUser);
        set({ user: updatedUser });
      }
      return true;
    } catch (err: any) {
      console.error('Add address error:', err);
      return false;
    }
  },

  updateAddress: async (addressData) => {
    try {
      const response = await apiClient.put('/api/auth/addresses', addressData);
      const { addresses } = response.data;
      
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, addresses };
        const encryptedUser = encryptData(JSON.stringify(updatedUser));
        localStorage.setItem('fuzzy_auth_user', encryptedUser);
        set({ user: updatedUser });
      }
      return true;
    } catch (err: any) {
      console.error('Update address error:', err);
      return false;
    }
  },

  deleteAddress: async (id) => {
    try {
      const response = await apiClient.delete(`/api/auth/addresses?id=${id}`);
      const { addresses } = response.data;
      
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, addresses };
        const encryptedUser = encryptData(JSON.stringify(updatedUser));
        localStorage.setItem('fuzzy_auth_user', encryptedUser);
        set({ user: updatedUser });
      }
      return true;
    } catch (err: any) {
      console.error('Delete address error:', err);
      return false;
    }
  }
}));

// Initialize store immediately upon import to prevent auth-guard race conditions
useAuthStore.getState().initialize();
