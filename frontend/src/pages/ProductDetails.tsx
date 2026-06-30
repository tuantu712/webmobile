import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import apiClient from '../api/axios';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

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
  stock: number;
  rating: number;
  save_amount: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${id}`);
        const prod = response.data.product;
        setProduct(prod);
        
        // Auto select defaults
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        }
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        }
      } catch (e) {
        console.error('Failed to load product details:', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  const handleAddToBag = () => {
    if (!product) return;

    if (product.stock <= 0) {
      alert('This product is currently out of stock.');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      prev_price: product.prev_price,
      image: product.image,
      size: selectedSize || 'Standard',
      color: selectedColor || 'Default',
      stock: product.stock
    }, 1);

    alert(`Successfully added "${product.name}" (${selectedSize}, ${selectedColor}) to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-4">Product details not found.</p>
        <Link to="/" className="bg-accent text-white px-6 py-2.5 rounded-xl text-xs font-semibold">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pb-32 select-none animate-fade-in relative min-h-screen">
      
      {/* Top Floating actions */}
      <div className="absolute top-4 left-6 right-6 z-10 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary-dark/80 backdrop-blur-md border border-primary-light/40 flex items-center justify-center text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <button 
          onClick={() => toggleWishlist(product)}
          className="w-10 h-10 rounded-full bg-primary-dark/80 backdrop-blur-md border border-primary-light/40 flex items-center justify-center"
        >
          <Heart size={18} className={isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-slate-300'} />
        </button>
      </div>

      {/* Image Swiper / Gallery Carousel */}
      <div className="bg-primary-dark/30 border-b border-primary-light/30 pt-16 pb-6 relative">
        <div className="h-64 flex items-center justify-center px-10">
          <img 
            src={product.images[activeImageIndex] || product.image} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] animate-fade-in"
          />
        </div>

        {/* Thumbnail indicators */}
        {product.images.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-6">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-12 h-12 rounded-xl bg-card-dark border overflow-hidden p-1 flex items-center justify-center transition-all ${
                  idx === activeImageIndex ? 'border-accent scale-105 shadow-md shadow-accent/15' : 'border-primary-light'
                }`}
              >
                <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="px-6 pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-xl font-bold text-white mb-1.5">{product.name}</h1>
            <div className="flex items-center gap-1.5 text-gold">
              <Star size={14} className="fill-gold" />
              <span className="text-xs font-bold text-white">{product.rating}</span>
              <span className="text-xs text-slate-500">(15 Reviews)</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-extrabold text-accent">${product.price}</div>
            {product.prev_price && (
              <div className="text-xs text-slate-500 line-through mt-0.5">${product.prev_price}</div>
            )}
            {product.save_amount > 0 && (
              <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded block mt-1">
                Save ${product.save_amount}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mt-4 mb-6">
          {product.description}
        </p>

        {/* Brand policies */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary-light/40 mb-6 text-slate-300">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-accent" />
            <span className="text-[10px] font-semibold">Free Express Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-[10px] font-semibold">2-Year Shop Warranty</span>
          </div>
        </div>

        {/* Color Selector */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-6">
            <span className="block text-xs font-semibold text-slate-300 mb-2.5">Colors</span>
            <div className="flex gap-3">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedColor === color 
                      ? 'border-accent bg-accent text-white shadow-md shadow-accent/15' 
                      : 'border-primary-light bg-card-dark text-slate-400 hover:text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-6">
            <span className="block text-xs font-semibold text-slate-300 mb-2.5">Sizes</span>
            <div className="flex gap-3">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedSize === size 
                      ? 'border-accent bg-accent text-white shadow-md shadow-accent/15' 
                      : 'border-primary-light bg-card-dark text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Alert */}
        <div className="text-xs">
          <span className="text-slate-400">Availability: </span>
          {product.stock > 5 ? (
            <span className="text-green-400 font-semibold">{product.stock} items in stock</span>
          ) : product.stock > 0 ? (
            <span className="text-gold font-semibold">Only {product.stock} items left!</span>
          ) : (
            <span className="text-red-500 font-semibold">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Sticky Add to Cart Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary-dark/95 backdrop-blur-md border-t border-primary-light/60 p-4 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <span className="block text-[10px] text-slate-500 uppercase font-bold">Total Price</span>
            <span className="text-base font-extrabold text-white">${product.price}</span>
          </div>
          
          <button
            onClick={handleAddToBag}
            disabled={product.stock <= 0}
            className="flex-grow bg-accent hover:bg-accent-hover disabled:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-98"
          >
            <ShoppingBag size={16} />
            <span>{product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
