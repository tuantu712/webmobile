import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import apiClient from '../api/axios';

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: number;
  code: string;
  total: number;
  payment_method: string;
  status: string; // 'Pending', 'Preparing', 'Shipping', 'Completed', 'Cancelled'
  items: OrderItem[];
  address: any;
  created_at: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/orders');
        setOrders(response.data.orders || []);
        // Auto-expand the first order if available
        if (response.data.orders && response.data.orders.length > 0) {
          setExpandedOrderId(response.data.orders[0].id);
        }
      } catch (e) {
        console.error('Failed to load orders:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xác nhận';
      case 'Preparing': return 'Đang chuẩn bị';
      case 'Shipping': return 'Đang giao hàng';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-gold bg-gold/10 border-gold/20';
      case 'Preparing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Shipping': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Render a vertical timeline for order tracking
  const renderTimeline = (status: string) => {
    const statuses = ['Pending', 'Preparing', 'Shipping', 'Completed'];
    if (status === 'Cancelled') {
      return (
        <div className="flex items-center gap-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10 text-red-200 text-xs">
          <XCircle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <h5 className="font-bold">Đơn hàng đã bị hủy</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Mọi giao dịch liên quan sẽ hoàn lại hoặc hủy bỏ.</p>
          </div>
        </div>
      );
    }

    const currentIndex = statuses.indexOf(status);

    const steps = [
      { key: 'Pending', label: 'Đặt hàng thành công', desc: 'Đơn hàng của bạn đã được ghi nhận hệ thống.', icon: Clock },
      { key: 'Preparing', label: 'Đang chuẩn bị hàng', desc: 'Đội ngũ Fuzzy đang chuẩn bị và đóng gói sản phẩm.', icon: Package },
      { key: 'Shipping', label: 'Đang giao hàng', desc: 'Đối tác vận chuyển đang giao hàng tới bạn.', icon: Truck },
      { key: 'Completed', label: 'Giao hàng thành công', desc: 'Sản phẩm đã được bàn giao cho bạn.', icon: CheckCircle }
    ];

    return (
      <div className="relative pl-6 space-y-5 border-l border-primary-light/50 ml-3 py-1">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          
          return (
            <div key={step.key} className="relative">
              {/* Timeline marker node */}
              <div className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 ${
                isDone 
                  ? 'border-accent bg-bg-dark text-accent' 
                  : 'border-slate-700 bg-bg-dark text-slate-500'
              }`}>
                <StepIcon size={12} className={isCurrent ? 'animate-pulse' : ''} />
              </div>
              
              <div>
                <h5 className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                  {step.label}
                </h5>
                <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-6 pt-4 pb-12 select-none animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="p-1 text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-base font-bold text-white">Order Tracking</h2>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-card-dark flex items-center justify-center text-slate-500 mb-4 border border-primary-light/40">
            <Clock size={28} />
          </div>
          <p className="text-slate-400 text-sm">No orders found.</p>
          <Link to="/shop" className="mt-4 px-6 py-2.5 bg-accent text-white rounded-xl text-xs font-semibold">
            Explore Furniture
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            
            return (
              <div 
                key={order.id} 
                className="bg-card-dark border border-primary-light/40 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Header Row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full text-left p-4 flex justify-between items-center bg-card-dark/60"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold block bg-primary-dark/80 px-2 py-0.5 rounded w-fit">
                      {order.code}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(order.created_at).toLocaleDateString('vi-VN', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-4 border-t border-primary-light/30 space-y-5 bg-card-dark/25">
                    
                    {/* Items List */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="truncate max-w-[200px]">
                            <span className="text-slate-300 font-semibold">{item.name}</span>
                            <span className="text-[9px] text-slate-500 block mt-0.5">{item.color} | {item.size} × {item.quantity}</span>
                          </div>
                          <span className="font-bold text-slate-400">${item.price * item.quantity}</span>
                        </div>
                      ))}
                      
                      <div className="h-px bg-primary-light/20 pt-1" />
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-400">Payment: <strong className="text-slate-300 font-normal">{order.payment_method}</strong></span>
                        <span className="font-extrabold text-accent text-sm">${order.total}</span>
                      </div>
                    </div>

                    {/* Address Block */}
                    <div className="bg-primary-dark/30 rounded-xl p-3 border border-primary-light/20 flex gap-2">
                      <MapPin size={14} className="text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-[10px] text-slate-400">
                        <h6 className="font-bold text-slate-300">{order.address?.receiver} — {order.address?.phone}</h6>
                        <p className="mt-0.5">{order.address?.detail}, {order.address?.city}</p>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="pt-2">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-3.5">Delivery Timeline</span>
                      {renderTimeline(order.status)}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
