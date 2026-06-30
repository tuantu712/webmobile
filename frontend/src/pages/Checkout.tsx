import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, Check, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import apiClient from '../api/axios';

export default function Checkout() {
  const { user, addAddress } = useAuthStore();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  
  const navigate = useNavigate();

  // Step state: 1 = Address Confirmation, 2 = Payment Method & Final Review
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses.find(a => a.isDefault)?.id || user?.addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Bank Transfer' | 'Momo' | 'VNPay'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick address addition modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newAddrReceiver, setNewAddrReceiver] = useState(user?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrDetail, setNewAddrDetail] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');

  const total = getCartTotal();
  const delivery = total > 100 ? 0 : 15;
  const grandTotal = total + delivery;

  const currentAddress = user?.addresses.find(a => a.id === selectedAddressId);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle || !newAddrReceiver || !newAddrPhone || !newAddrDetail || !newAddrCity) {
      alert('Please fill out all address fields');
      return;
    }
    const success = await addAddress({
      title: newAddrTitle,
      receiver: newAddrReceiver,
      phone: newAddrPhone,
      detail: newAddrDetail,
      city: newAddrCity,
      isDefault: user?.addresses.length === 0
    });
    
    if (success) {
      setShowAddAddress(false);
      // Auto-select the newly added address (it will be the last one added)
      setTimeout(() => {
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser && updatedUser.addresses.length > 0) {
          setSelectedAddressId(updatedUser.addresses[updatedUser.addresses.length - 1].id);
        }
      }, 200);
    } else {
      alert('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!currentAddress) {
      setErrorMsg('Please select a shipping address');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const response = await apiClient.post('/api/orders', {
        address: currentAddress,
        paymentMethod,
        total: grandTotal,
        items: orderItems
      });

      const { order } = response.data;
      
      // Clear local cart
      clearCart();
      
      // Redirect to success screen (Step 3)
      navigate(`/order-success?code=${order.code}&total=${grandTotal}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to place order. Please review stock inventory.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-4">No items to checkout.</p>
        <Link to="/" className="bg-accent text-white px-6 py-2.5 rounded-xl text-xs font-semibold">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-20 select-none animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
          className="p-1 text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-white">
          {step === 1 ? 'Shipping Address' : 'Payment Method'}
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl flex items-start gap-2">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Address Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Delivery Location</span>
            <button 
              onClick={() => setShowAddAddress(true)}
              className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              <span>Add New</span>
            </button>
          </div>

          {/* Address List */}
          {user?.addresses.length === 0 ? (
            <div className="bg-card-dark border border-dashed border-primary-light p-6 text-center rounded-2xl">
              <MapPin className="mx-auto text-slate-500 mb-3" size={24} />
              <p className="text-xs text-slate-400">No delivery address saved yet.</p>
              <button 
                onClick={() => setShowAddAddress(true)}
                className="mt-3 bg-accent text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Create Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {user?.addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`w-full text-left p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                    selectedAddressId === addr.id 
                      ? 'border-accent bg-accent/5' 
                      : 'border-primary-light/50 bg-card-dark'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedAddressId === addr.id ? 'border-accent bg-accent text-white' : 'border-slate-600'
                  }`}>
                    {selectedAddressId === addr.id && <Check size={12} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-primary-light text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold">Default</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mt-1">{addr.receiver} — {addr.phone}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{addr.detail}, {addr.city}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CTA Proceed to Payment */}
          <button
            onClick={() => {
              if (!selectedAddressId) {
                alert('Please select an address before proceeding.');
                return;
              }
              setStep(2);
            }}
            disabled={!selectedAddressId}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2 mt-8"
          >
            <span>Proceed to Payment</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 2: Payment & Final Review */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Selected Address Card */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Shipping To</span>
            {currentAddress && (
              <div className="bg-card-dark border border-primary-light/40 rounded-2xl p-4 flex gap-3">
                <MapPin className="text-accent flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-white">{currentAddress.title} ({currentAddress.receiver})</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{currentAddress.detail}, {currentAddress.city}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentAddress.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Payment Method</span>
            <div className="space-y-3">
              {[
                { id: 'COD', label: 'Cash On Delivery (COD)', desc: 'Pay when items arrive' },
                { id: 'Bank Transfer', label: 'Bank Transfer', desc: 'Chuyển khoản ngân hàng' },
                { id: 'Momo', label: 'MoMo Wallet', desc: 'Mock electronic wallet payment' },
                { id: 'VNPay', label: 'VNPay', desc: 'Mock VNPay portal link' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    paymentMethod === opt.id 
                      ? 'border-accent bg-accent/5' 
                      : 'border-primary-light/50 bg-card-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      paymentMethod === opt.id ? 'bg-accent/15 text-accent' : 'bg-primary-light text-slate-400'
                    }`}>
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">{opt.label}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === opt.id ? 'border-accent bg-accent text-white' : 'border-slate-600'
                  }`}>
                    {paymentMethod === opt.id && <Check size={12} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Item Review */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Items Summary</span>
            <div className="bg-card-dark border border-primary-light/40 rounded-2xl p-4 divide-y divide-primary-light/30">
              {cartItems.map(item => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[200px]">
                    <span className="text-white font-semibold">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.color} | {item.size} × {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-slate-300">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Card */}
          <div className="bg-card-dark border border-primary-light/40 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Items Total</span>
              <span className="font-semibold text-white">${total}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Shipping</span>
              <span className="font-semibold text-white">
                {delivery === 0 ? <strong className="text-green-400 font-normal">Free</strong> : `$${delivery}`}
              </span>
            </div>
            <div className="h-px bg-primary-light/30 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-base font-extrabold text-accent">${grandTotal}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-accent/25 transition-all active:scale-98"
          >
            {isSubmitting ? 'Processing Order...' : 'Place Order'}
          </button>
        </div>
      )}

      {/* QUICK ADD ADDRESS DIALOG MODAL */}
      {showAddAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 animate-fade-in">
          <div className="bg-primary-dark border border-primary-light w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <h3 className="text-sm font-bold text-white mb-4">Add Shipping Address</h3>
            
            <form onSubmit={handleAddAddress} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Label (e.g. Home, Office)</label>
                <input 
                  type="text" 
                  value={newAddrTitle}
                  onChange={e => setNewAddrTitle(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Home"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Receiver Name</label>
                <input 
                  type="text" 
                  value={newAddrReceiver}
                  onChange={e => setNewAddrReceiver(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Enter receiver's name"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={newAddrPhone}
                  onChange={e => setNewAddrPhone(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Address Details</label>
                <input 
                  type="text" 
                  value={newAddrDetail}
                  onChange={e => setNewAddrDetail(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Street, District"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">City</label>
                <input 
                  type="text" 
                  value={newAddrCity}
                  onChange={e => setNewAddrCity(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="e.g. Ho Chi Minh City"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="flex-1 py-2.5 bg-card-dark border border-primary-light rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
