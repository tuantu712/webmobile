"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Eye,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  prev_price?: number;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  category_id: number;
  category_name?: string;
  stock: number;
  rating: number;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: number;
  code: string;
  user_name: string;
  user_email: string;
  address: any;
  payment_method: string;
  status: string;
  total: number;
  items: OrderItem[];
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  
  // Data states
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication state (Admin uses a default password or mock token)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Product Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPrevPrice, setProdPrevPrice] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodColors, setProdColors] = useState('Black, Gray, Blue');
  const [prodSizes, setProdSizes] = useState('Standard');

  // Load admin token from local storage
  useEffect(() => {
    const token = localStorage.getItem('fuzzy_admin_token');
    if (token) {
      setAdminToken(token);
    }
  }, []);

  // Fetch admin dashboard details
  const fetchAdminData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      const [statsRes, prodRes, orderRes, catRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/categories')
      ]);

      if (statsRes.status === 403 || prodRes.status === 403) {
        // Token expired or invalid
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const catData = await catRes.json();

      setStats(statsData.stats);
      setRecentOrders(statsData.recentOrders || []);
      setProducts(prodData.products || []);
      setOrders(orderData.orders || []);
      setCategories(catData.categories || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.error || 'Login failed');
        return;
      }

      if (data.user.email !== 'admin@fuzzy.com') {
        setAuthError('Forbidden. Admin permissions required');
        return;
      }

      localStorage.setItem('fuzzy_admin_token', data.token);
      setAdminToken(data.token);
    } catch (e) {
      setAuthError('Server error connecting to API');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fuzzy_admin_token');
    setAdminToken(null);
  };

  // Product CRUD handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdPrevPrice('');
    setProdImage('https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/product/1.png');
    setProdCategory(categories[0]?.id.toString() || '');
    setProdStock('10');
    setProdColors('Black, Gray, Blue');
    setProdSizes('Standard');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description || '');
    setProdPrice(product.price.toString());
    setProdPrevPrice(product.prev_price?.toString() || '');
    setProdImage(product.image);
    setProdCategory(product.category_id.toString());
    setProdStock(product.stock.toString());
    setProdColors(product.colors.join(', '));
    setProdSizes(product.sizes.join(', '));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodImage || !prodCategory) {
      alert('Name, price, image URL and category are required');
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      prev_price: prodPrevPrice ? parseFloat(prodPrevPrice) : null,
      image: prodImage,
      category_id: parseInt(prodCategory, 10),
      stock: parseInt(prodStock, 10),
      colors: prodColors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: prodSizes.split(',').map(s => s.trim()).filter(Boolean),
      images: [prodImage]
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsProductModalOpen(false);
        fetchAdminData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save product');
      }
    } catch (e) {
      alert('Error saving product data');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        fetchAdminData();
      } else {
        alert('Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchAdminData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to update order status');
      }
    } catch (e) {
      alert('Error updating order status');
    }
  };

  // If not logged in as Admin, render Login Page
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-white">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide text-orange-500">FUZZY ADMIN</h1>
            <p className="text-slate-400 text-xs mt-1">Management Portal for Fuzzy E-Commerce</p>
          </div>

          {authError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Admin Email</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="admin@fuzzy.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Password</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="Enter password (default: 123456)"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-500/20"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
            Default credentials:<br />
            Email: <strong className="text-slate-400">admin@fuzzy.com</strong> / Pass: <strong className="text-slate-400">123456</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-widest text-orange-500">FUZZY ADMIN</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Production API</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchAdminData}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 py-1.5 px-3 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main container */}
      <div className="flex-grow flex">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={16} />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package size={16} />
            <span>Manage Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingCart size={16} />
            <span>Manage Orders</span>
          </button>
        </aside>

        {/* Contents area */}
        <main className="flex-grow p-8 bg-slate-950 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <h2 className="text-xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                        <BarChart3 size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Revenue</span>
                        <h3 className="text-xl font-extrabold text-white mt-0.5">${stats.totalRevenue}</h3>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                        <ShoppingCart size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Orders</span>
                        <h3 className="text-xl font-extrabold text-white mt-0.5">{stats.totalOrders}</h3>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Users Count</span>
                        <h3 className="text-xl font-extrabold text-white mt-0.5">{stats.totalUsers}</h3>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Low Stock Warning</span>
                        <h3 className="text-xl font-extrabold text-white mt-0.5">{stats.lowStockCount}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Recent Orders (Top 5)</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Code</th>
                            <th className="pb-3 font-semibold">Customer</th>
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Amount</th>
                            <th className="pb-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {recentOrders.map((ord) => (
                            <tr key={ord.id}>
                              <td className="py-3 font-bold font-mono text-orange-400">{ord.code}</td>
                              <td className="py-3">{ord.user_name}</td>
                              <td className="py-3">{new Date(ord.created_at).toLocaleDateString()}</td>
                              <td className="py-3 font-bold">${ord.total}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                                  ord.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                  'bg-orange-500/10 text-orange-400'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {recentOrders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-slate-500">No orders received yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS CRUD */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-tight text-white">Manage Products</h2>
                    <button
                      onClick={handleOpenAddProduct}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Products list table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Product</th>
                            <th className="pb-3 font-semibold">Category</th>
                            <th className="pb-3 font-semibold">Price</th>
                            <th className="pb-3 font-semibold">Stock</th>
                            <th className="pb-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {products.map((prod) => (
                            <tr key={prod.id}>
                              <td className="py-3 flex items-center gap-3">
                                <img src={prod.image} alt={prod.name} className="w-8 h-8 object-contain bg-slate-800/40 rounded p-0.5" />
                                <span className="font-semibold text-white">{prod.name}</span>
                              </td>
                              <td className="py-3 capitalize">{prod.category_name}</td>
                              <td className="py-3 font-bold">${prod.price}</td>
                              <td className="py-3">
                                <span className={`font-bold ${prod.stock <= 5 ? 'text-red-400 font-extrabold' : 'text-slate-300'}`}>
                                  {prod.stock}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                                    title="Edit Product"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                                    title="Delete Product"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDER WORKFLOW */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold tracking-tight text-white">Manage Orders</h2>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-3 font-semibold">Order Info</th>
                            <th className="pb-3 font-semibold">Recipient details</th>
                            <th className="pb-3 font-semibold">Items</th>
                            <th className="pb-3 font-semibold">Total</th>
                            <th className="pb-3 font-semibold">Status Update</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {orders.map((ord) => (
                            <tr key={ord.id} className="align-top">
                              <td className="py-4">
                                <span className="font-bold font-mono text-orange-400 text-sm block">{ord.code}</span>
                                <span className="text-[10px] text-slate-500 block mt-1">ID: #{ord.id}</span>
                                <span className="text-[10px] text-slate-500 block">{new Date(ord.created_at).toLocaleDateString()}</span>
                              </td>
                              <td className="py-4">
                                <div className="font-bold text-white">{ord.address?.receiver}</div>
                                <div className="text-slate-400 text-[10px] mt-0.5">{ord.address?.phone}</div>
                                <div className="text-slate-400 text-[10px] mt-0.5">{ord.address?.detail}, {ord.address?.city}</div>
                                <div className="text-[9px] bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded w-fit mt-1.5 uppercase font-semibold border border-slate-700">
                                  {ord.payment_method}
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="space-y-1">
                                  {ord.items.map((item, idx) => (
                                    <div key={idx} className="text-slate-300 text-[10px]">
                                      • <strong className="text-white font-normal">{item.name}</strong> ({item.color} | {item.size}) × {item.quantity}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 font-black text-white text-sm">${ord.total}</td>
                              <td className="py-4">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-orange-500"
                                >
                                  <option value="Pending">Pending (Chờ xác nhận)</option>
                                  <option value="Preparing">Preparing (Đang chuẩn bị)</option>
                                  <option value="Shipping">Shipping (Đang giao)</option>
                                  <option value="Completed">Completed (Hoàn thành)</option>
                                  <option value="Cancelled">Cancelled (Đã hủy)</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-500">No orders placed on the system yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* PRODUCT CREATION/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500">
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Create New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Name *</label>
                  <input 
                    type="text"
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none"
                    placeholder="e.g. Buddy Chair"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea 
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none h-20 resize-none"
                  placeholder="Enter details..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    placeholder="25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Original Price ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={prodPrevPrice}
                    onChange={e => setProdPrevPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    placeholder="35"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Inventory Stock *</label>
                  <input 
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Main Image URL *</label>
                <input 
                  type="text"
                  value={prodImage}
                  onChange={e => setProdImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Colors (comma separated)</label>
                  <input 
                    type="text"
                    value={prodColors}
                    onChange={e => setProdColors(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    placeholder="Black, Gray, Blue"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sizes (comma separated)</label>
                  <input 
                    type="text"
                    value={prodSizes}
                    onChange={e => setProdSizes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white focus:outline-none"
                    placeholder="Standard, Large"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold uppercase transition-colors shadow-lg shadow-orange-500/15"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
