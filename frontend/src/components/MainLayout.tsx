import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Heart, User, Menu, Bell, LogOut, X, Moon, Sun, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getCartItemsCount } = useCartStore();
  const { wishlistItems } = useWishlistStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to Dark mode like Fuzzy

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to onboarding or login
    if (!isAuthenticated) {
      const onboarded = localStorage.getItem('fuzzy_onboarded');
      if (!onboarded) {
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Standard dark mode logic could go here
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/shop', label: 'Shop', icon: LayoutGrid },
    { path: '/cart', label: 'Cart', icon: ShoppingBag, badge: true },
    { path: '/wishlist', label: 'Wishlist', icon: Heart, wishlistBadge: true },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  if (!isAuthenticated || !user) {
    return null; // Don't render until redirected
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-bg-dark text-white' : 'bg-white text-slate-900'} flex flex-col justify-between relative select-none pb-20`}>
      
      {/* Sidebar / Side Drawer Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 bg-primary-dark border-r border-primary-light z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-primary-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png'} 
              alt="profile" 
              className="w-10 h-10 rounded-full border border-accent object-cover"
            />
            <div>
              <h4 className="font-semibold text-sm text-white">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-grow flex flex-col justify-between">
          <ul className="space-y-4">
            <li className="flex justify-between items-center p-3 rounded-xl bg-card-dark border border-primary-light">
              <span className="text-sm font-medium text-slate-300">Dark Mode</span>
              <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg bg-primary-light text-accent hover:text-white transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </li>
            
            {user.email === 'admin@fuzzy.com' && (
              <li>
                <a 
                  href="http://localhost:3001/admin" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-card-dark border border-transparent hover:border-primary-light transition-all"
                >
                  <ClipboardList size={18} className="text-accent" />
                  <span>Admin Dashboard</span>
                </a>
              </li>
            )}
          </ul>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-200 rounded-xl text-sm font-semibold transition-all mt-auto"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main App Bar / Header */}
      <header className="sticky top-0 bg-bg-dark/95 backdrop-blur-md border-b border-primary-light/40 py-4 px-6 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <img 
              src={user.avatar || 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png'} 
              alt="profile" 
              className="w-8 h-8 rounded-full border border-primary-light object-cover"
            />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">Hello</span>
              <span className="text-sm font-bold text-accent block leading-none">{user.name}</span>
            </div>
          </div>
        </div>

        <Link to="/orders" className="relative p-1.5 text-slate-300 hover:text-white active:scale-95 transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </Link>
      </header>

      {/* Nested App Pages Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Persistent Bottom Tab Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] px-6">
        <ul className="flex items-center justify-between max-w-md mx-auto h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isCart = item.badge;
            const count = getCartItemsCount();
            
            return (
              <li key={item.path} className="relative h-full flex items-center justify-center flex-1">
                {/* Active top line */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.75 bg-slate-900 rounded-b" />
                )}

                <Link 
                  to={item.path}
                  className={`flex flex-col items-center justify-center relative py-2 transition-all duration-200 ${
                    isActive ? 'text-slate-950 scale-105' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                  
                  {isCart && count > 0 && (
                    <span className="absolute -top-0.5 -right-1.5 bg-accent text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm shadow-accent/25">
                      {count}
                    </span>
                  )}

                  {item.wishlistBadge && wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-1.5 bg-accent text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm shadow-accent/25">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
