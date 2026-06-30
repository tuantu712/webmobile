import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sliders, Star, ShoppingBag, Heart } from 'lucide-react';
import apiClient from '../api/axios';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

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
  category_slug?: string;
  category_name?: string;
  stock: number;
  rating: number;
  save_amount: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggleWishlist, wishlistItems } = useWishlistStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/api/categories'),
          apiClient.get('/api/products?limit=20')
        ]);
        setCategories(catRes.data.categories || []);
        setProducts(prodRes.data.products || []);
      } catch (e: any) {
        console.error('Failed to load home page data:', e);
        setError(e.response?.data?.error || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleLike = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      prev_price: product.prev_price,
      image: product.image,
      rating: product.rating,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors
    });
  };

  const handleAddToBag = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      prev_price: product.prev_price,
      image: product.image,
      size: product.sizes[0] || 'Standard',
      color: product.colors[0] || 'Default',
      stock: product.stock
    }, 1);
    
    alert(`Added "${product.name}" to cart!`);
  };

  // Group or filter products
  const newArrivals = products.slice(0, 4);
  const trendingProducts = products.filter(p => p.rating >= 4.5).slice(0, 4);
  const offerProducts = products.filter(p => p.prev_price && p.prev_price > p.price).slice(0, 4);


  return (
    <div className="px-5 pt-4 pb-12 select-none animate-fade-in">
      {/* Brand Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black tracking-wider text-white">
            FUZZY<span className="text-accent">.</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Mobile E-Commerce</p>
        </div>
      </div>

      {/* Search Input bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <div className="relative flex-grow">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card-dark border border-primary-light/80 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
            placeholder="Search here..."
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <Search size={18} />
          </button>
        </div>
        <button 
          type="button" 
          onClick={() => navigate('/shop')}
          className="bg-accent hover:bg-accent-hover text-white p-3 rounded-2xl flex items-center justify-center transition-colors shadow-md shadow-accent/20"
        >
          <Sliders size={20} />
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-center animate-fade-in">
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Sliding Banner */}
      <div className="relative rounded-3xl overflow-hidden h-40 mb-6 group">
        <img 
          src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/banner/banner-1.jpg" 
          alt="banner-1" 
          className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/80 via-bg-dark/20 to-transparent p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-accent">Best Selling</span>
            <h3 className="text-lg font-bold text-white max-w-[180px] leading-snug mt-1">Comforts & Modern life Stylish Sofa</h3>
          </div>
          <Link 
            to="/shop" 
            className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-accent w-fit mt-2 transition-colors"
          >
            <span>View More</span>
            <Star size={12} className="fill-accent text-accent animate-spin" style={{ animationDuration: '3s' }} />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Categories */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">Categories</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex-shrink-0 flex flex-col items-center justify-center bg-card-dark border border-primary-light/60 w-20 h-20 rounded-2xl active:scale-95 transition-all hover:border-accent hover:bg-primary-light"
            >
              <span className="capitalize text-xs font-semibold text-white tracking-wide">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* New Arrivals list (Grid 2-column) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-white">New Arrivals</h2>
          <Link to="/shop" className="text-xs font-semibold text-accent hover:underline">View All</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(n => (
              <div key={n} className="bg-card-dark rounded-3xl h-60 animate-pulse border border-primary-light/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {newArrivals.map((product) => (
              <Link 
                to={`/product/${product.id}`}
                key={product.id}
                className="bg-card-dark border border-primary-light/50 rounded-3xl overflow-hidden p-3.5 flex flex-col justify-between relative hover:border-accent/40 transition-all active:scale-98 duration-200"
              >
                {/* Like / Wishlist Button */}
                <button
                  onClick={(e) => toggleLike(product, e)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-primary-dark/80 backdrop-blur-md flex items-center justify-center hover:bg-primary-dark transition-colors"
                >
                  <Heart 
                    size={15} 
                    className={wishlistItems.some(i => i.id === product.id) ? 'fill-accent text-accent' : 'text-slate-400'} 
                  />
                </button>

                {/* Product image */}
                <div className="h-32 flex items-center justify-center mb-3">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]"
                  />
                </div>

                {/* Info block */}
                <div>
                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-accent">${product.price}</span>
                      {product.prev_price && (
                        <span className="text-[10px] text-slate-500 line-through">${product.prev_price}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToBag(product, e)}
                      className="w-7 h-7 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors shadow-md shadow-accent/15"
                    >
                      <ShoppingBag size={12} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Furniture */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-white">Trending Furniture</h2>
          <Link to="/shop" className="text-xs font-semibold text-accent hover:underline">View All</Link>
        </div>

        <div className="space-y-4">
          {trendingProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="bg-card-dark border border-primary-light/50 rounded-2xl p-3 flex items-center gap-4 hover:border-accent/40 transition-all"
            >
              <div className="w-20 h-20 bg-primary-dark/40 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                  <div className="flex items-center gap-0.5 text-gold">
                    <Star size={10} className="fill-gold" />
                    <span className="text-[10px] font-bold text-slate-300">{product.rating}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{product.description}</p>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">${product.price}</span>
                    {product.save_amount > 0 && (
                      <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium">Save ${product.save_amount}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToBag(product, e)}
                    className="w-7 h-7 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-colors"
                  >
                    <ShoppingBag size={12} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Offer Zone Banner */}
      {offerProducts.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white">Offer Zone</h2>
            <Link to="/shop" className="text-xs font-semibold text-accent hover:underline">View All</Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {offerProducts.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="flex-shrink-0 bg-card-dark border border-primary-light/50 rounded-2xl p-3 w-64 flex items-center gap-3 hover:border-accent/40 transition-all"
              >
                <div className="w-16 h-16 bg-primary-dark/40 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-accent">${product.price}</span>
                    <span className="text-[10px] text-slate-500 line-through">${product.prev_price}</span>
                  </div>
                  <span className="text-[9px] text-green-400 font-semibold block mt-0.5">Special Offer Discount!</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
