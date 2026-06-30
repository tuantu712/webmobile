import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';

// Layout
import MainLayout from './components/MainLayout';

// Components
import InstallPrompt from './components/InstallPrompt';
import OfflineDetector from './components/OfflineDetector';

// Pages
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

export default function App() {
  const initializeAuth = useAuthStore(state => state.initialize);
  const initializeCart = useCartStore(state => state.initialize);
  const initializeWishlist = useWishlistStore(state => state.initialize);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    // Load local storage states
    initializeAuth();
    initializeCart();
    initializeWishlist();
  }, [initializeAuth, initializeCart, initializeWishlist]);

  return (
    <BrowserRouter>
      {/* PWA offline banner */}
      <OfflineDetector />
      
      <Routes>
        {/* Public auth pages */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

        {/* Protected app pages inside MainLayout (route guarded) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PWA Install Promotion overlay */}
      <InstallPrompt />
    </BrowserRouter>
  );
}
