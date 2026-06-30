import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Safe checks to prevent runtime TypeError if sizes/colors are undefined
    const selectedSize = (item.sizes && item.sizes.length > 0) ? item.sizes[0] : 'Standard';
    const selectedColor = (item.colors && item.colors.length > 0) ? item.colors[0] : 'Default';

    addItem({
      productId: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      prev_price: item.prev_price ? Number(item.prev_price) : undefined,
      image: item.image,
      size: selectedSize,
      color: selectedColor,
      stock: item.stock || 99
    }, 1);

    alert(`Successfully added "${item.name}" to cart!`);
  };

  const items = Array.isArray(wishlistItems) ? wishlistItems : [];

  return (
    <div className="px-5 pt-4 pb-24 select-none animate-fade-in min-h-screen bg-bg-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="w-10 h-10 bg-card-dark/80 border border-primary-light/60 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-white tracking-wide">Sản phẩm yêu thích</h2>
        </div>
        <span className="text-[10px] text-accent font-black bg-accent/15 px-3 py-1.5 border border-accent/25 rounded-xl uppercase tracking-wider">
          {items.length} items
        </span>
      </div>

      {/* Wishlist Items List */}
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center px-4"
        >
          <div className="w-20 h-20 bg-card-dark border border-primary-light/35 rounded-full flex items-center justify-center text-slate-500 mb-6 shadow-xl relative">
            <Heart size={32} className="stroke-[1.5] text-slate-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-2 tracking-wide">Chưa có sản phẩm yêu thích</h3>
          <p className="text-[11px] text-slate-400 max-w-[220px] mb-8 leading-relaxed">
            Danh sách yêu thích của bạn đang trống. Hãy quay lại cửa hàng để chọn những mẫu ghế đẹp nhất!
          </p>
          <Link 
            to="/shop" 
            className="bg-accent hover:bg-accent-hover text-white text-xs font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-95 uppercase tracking-wider"
          >
            Mua sắm ngay
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                key={item.id}
                className="bg-card-dark/80 backdrop-blur-md border border-primary-light/45 rounded-3xl overflow-hidden p-3.5 flex flex-col justify-between relative group hover:border-accent/35 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {/* Remove from wishlist button (Heart Icon) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(item);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-primary-dark/80 backdrop-blur-md flex items-center justify-center hover:bg-primary-dark transition-all active:scale-75 shadow-sm"
                >
                  <Heart size={14} className="fill-accent text-accent animate-pulse" />
                </button>

                {/* Product image container */}
                <Link to={`/product/${item.id}`} className="h-28 flex items-center justify-center mb-4 relative overflow-hidden rounded-2xl bg-primary-dark/20 p-2">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)]"
                  />
                </Link>

                {/* Info block */}
                <div>
                  <h4 className="text-xs font-bold text-white truncate pr-2 tracking-wide">{item.name}</h4>
                  
                  {/* Price and Cart */}
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-accent">${(Number(item.price) || 0).toFixed(2)}</span>
                      {item.prev_price && (
                        <span className="text-[9px] text-slate-500 line-through">${(Number(item.prev_price) || 0).toFixed(2)}</span>
                      )}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className="bg-accent hover:bg-accent-hover text-white p-2.5 rounded-xl transition-all shadow-md shadow-accent/10 active:scale-90"
                      title="Add to bag"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
