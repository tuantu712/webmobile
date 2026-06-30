import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/useCartStore';
import type { CartItem } from '../store/useCartStore';

function CartItemRow({ item, onUpdateQty, onRemove }: { 
  item: CartItem; 
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl bg-card-dark border border-primary-light/50 select-none">
      
      {/* Hidden Red Background with Trash Icon revealed on swipe */}
      <div className="absolute inset-0 bg-red-600 flex items-center justify-end px-6 z-0">
        <div className="flex flex-col items-center gap-1 text-white">
          <Trash2 size={20} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Delete</span>
        </div>
      </div>

      {/* Swipeable Card (Drags Left) */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        onDragEnd={(_, info) => {
          // If swiped left past the threshold, delete
          if (info.offset.x < -60) {
            onRemove(item.id);
          }
        }}
        className="relative bg-card-dark p-4 flex items-center gap-4 z-10 cursor-grab active:cursor-grabbing border-b border-primary-light/10"
      >
        {/* Product image */}
        <div className="w-16 h-16 bg-primary-dark/40 rounded-xl flex items-center justify-center flex-shrink-0">
          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
        </div>

        {/* Product details */}
        <div className="flex-grow min-w-0">
          <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
          
          <div className="flex gap-2.5 mt-1 text-[10px] text-slate-400">
            <span>Size: <strong className="text-slate-200">{item.size}</strong></span>
            <span>Color: <strong className="text-slate-200">{item.color}</strong></span>
          </div>

          <div className="flex justify-between items-center mt-2.5">
            <span className="text-xs font-bold text-accent">${item.price}</span>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-1 bg-primary-dark/60 rounded-lg p-0.5 border border-primary-light/40">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQty(item.id, item.quantity - 1); }}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white"
              >
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold text-white px-2.5">{item.quantity}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateQty(item.id, item.quantity + 1); }}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = getCartTotal();
  const delivery = total > 100 ? 0 : 15; // Free shipping over $100
  const grandTotal = total + delivery;

  return (
    <div className="px-6 pt-4 pb-12 select-none animate-fade-in min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="p-1 text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-base font-bold text-white">Your Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-card-dark flex items-center justify-center text-slate-500 mb-4 border border-primary-light/40">
            <ShoppingBag size={28} />
          </div>
          <p className="text-slate-400 text-sm">Your cart is empty.</p>
          <Link 
            to="/shop" 
            className="mt-4 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold tracking-wider transition-colors shadow-md shadow-accent/20"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col justify-between min-h-[75vh]">
          {/* Cart list */}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">
              Swipe left on items to delete
            </span>
            
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CartItemRow 
                    item={item} 
                    onUpdateQty={updateQuantity} 
                    onRemove={removeItem} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pricing summary */}
          <div className="mt-8 border-t border-primary-light/40 pt-6">
            <div className="bg-card-dark border border-primary-light/40 rounded-2xl p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold text-white">${total}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Delivery Fee</span>
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

            <button
              onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-accent/25 transition-all active:scale-98"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
