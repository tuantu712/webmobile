import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, X, Star, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Category {
  id: number;
  slug: string;
  name: string;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCartStore();

  // Search query & category slug from URL
  const queryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const { toggleWishlist, wishlistItems } = useWishlistStore();

  const toggleLike = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };
  
  // Filter settings inside bottom sheet
  const [tempSort, setTempSort] = useState(searchParams.get('sort') || 'default');
  const [tempColor, setTempColor] = useState(searchParams.get('color') || '');
  const [tempCategory, setTempCategory] = useState(categoryParam);

  const limit = 6; // Load 6 products at a time for smooth infinite scroll demonstration
  const isFetchingRef = useRef(false);

  // Fetch Categories
  useEffect(() => {
    async function getCategories() {
      try {
        const response = await apiClient.get('/api/categories');
        setCategories(response.data.categories || []);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    }
    getCategories();
  }, []);

  // Fetch initial list or on filter change
  const fetchProducts = useCallback(async (currentOffset: number, append: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const activeSort = searchParams.get('sort') || 'default';
      const activeColor = searchParams.get('color') || '';
      const activeCategory = searchParams.get('category') || '';
      const activeSearch = searchParams.get('search') || '';

      let url = `/api/products?limit=${limit}&offset=${currentOffset}`;
      if (activeSort !== 'default') url += `&sort=${activeSort}`;
      if (activeColor) url += `&color=${encodeURIComponent(activeColor)}`;
      if (activeCategory) url += `&category=${activeCategory}`;
      if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;

      const response = await apiClient.get(url);
      const { products: newProducts, pagination } = response.data;

      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setHasMore(pagination.hasMore);
      setOffset(currentOffset);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [searchParams]);

  // Trigger load when filters or search URL changes
  useEffect(() => {
    setProducts([]);
    setOffset(0);
    fetchProducts(0, false);
    
    // Sync filters inside panel
    setTempSort(searchParams.get('sort') || 'default');
    setTempColor(searchParams.get('color') || '');
    setTempCategory(searchParams.get('category') || '');
  }, [searchParams, fetchProducts]);

  // Infinite Scroll scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      
      const threshold = 150; // trigger distance from bottom
      const totalHeight = document.documentElement.scrollHeight;
      const scrolled = window.innerHeight + window.scrollY;

      if (totalHeight - scrolled <= threshold) {
        const nextOffset = offset + limit;
        fetchProducts(nextOffset, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, offset, fetchProducts]);

  // Apply filters from bottom sheet
  const handleApplyFilters = () => {
    const params: Record<string, string> = {};
    if (queryParam) params.search = queryParam;
    if (tempSort !== 'default') params.sort = tempSort;
    if (tempColor) params.color = tempColor;
    if (tempCategory) params.category = tempCategory;

    setSearchParams(params);
    setIsFilterOpen(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setTempSort('default');
    setTempColor('');
    setTempCategory('');
    
    const params: Record<string, string> = {};
    if (queryParam) params.search = queryParam;
    setSearchParams(params);
    setIsFilterOpen(false);
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

  return (
    <div className="px-5 pt-4 pb-12 select-none animate-fade-in relative min-h-screen">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-base font-bold text-white">
            {categoryParam ? `Category: ${categoryParam}` : queryParam ? `Results for "${queryParam}"` : 'All Products'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGridView(!isGridView)}
            className="p-2 bg-card-dark border border-primary-light/60 rounded-xl text-slate-300 hover:text-white"
          >
            {isGridView ? <List size={16} /> : <Grid size={16} />}
          </button>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="p-2 bg-card-dark border border-primary-light/60 rounded-xl text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Products Grid / List */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-sm">No products found matching filters.</p>
          <button 
            onClick={handleClearFilters}
            className="text-accent underline text-xs font-semibold mt-2 block mx-auto"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className={isGridView ? "grid grid-cols-2 gap-4" : "space-y-4"}>
          {products.map((product) => {
            if (isGridView) {
              return (
                <Link 
                  to={`/product/${product.id}`}
                  key={product.id}
                  className="bg-card-dark border border-primary-light/50 rounded-3xl p-3.5 flex flex-col justify-between relative hover:border-accent/40 transition-all duration-200"
                >
                  <button
                    onClick={(e) => toggleLike(product, e)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart 
                      size={15} 
                      className={wishlistItems.some(i => i.id === product.id) ? 'fill-accent text-accent' : 'text-slate-400'} 
                    />
                  </button>

                  <div className="h-32 flex items-center justify-center mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-accent">${product.price}</span>
                        {product.prev_price && (
                          <span className="text-[9px] text-slate-500 line-through">${product.prev_price}</span>
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
              );
            } else {
              return (
                <Link
                  to={`/product/${product.id}`}
                  key={product.id}
                  className="bg-card-dark border border-primary-light/50 rounded-2xl p-3 flex items-center gap-4 hover:border-accent/40 transition-all"
                >
                  <div className="w-20 h-20 bg-primary-dark/40 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                    
                    <button
                      onClick={(e) => toggleLike(product, e)}
                      className="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Heart 
                        size={12} 
                        className={wishlistItems.some(i => i.id === product.id) ? 'fill-accent text-accent' : 'text-slate-400'} 
                      />
                    </button>
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
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-accent">${product.price}</span>
                        {product.prev_price && (
                          <span className="text-[10px] text-slate-500 line-through">${product.prev_price}</span>
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
              );
            }
          })}
        </div>
      )}

      {/* Infinite Scroll loading indicators */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-6 text-xs text-slate-500 font-medium">
          You've viewed all products.
        </div>
      )}

      {/* Premium Filters Sliding Bottom Sheet */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Dark Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Bottom Sheet Panel */}
            <motion.div 
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-primary-dark border-t border-primary-light rounded-t-3xl z-50 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-primary-light flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Filter & Sort</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow max-h-[55vh]">
                
                {/* Sorting options */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sort By</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { val: 'default', label: 'Relevance' },
                      { val: 'price_asc', label: 'Price: Low to High' },
                      { val: 'price_desc', label: 'Price: High to Low' },
                      { val: 'rating_desc', label: 'Highest Rating' },
                      { val: 'newest', label: 'New Arrivals' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setTempSort(opt.val)}
                        className={`text-left text-xs p-3 rounded-xl border font-medium transition-all ${
                          tempSort === opt.val 
                            ? 'border-accent bg-accent/10 text-white' 
                            : 'border-primary-light bg-card-dark text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color filters */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Black', 'Gray', 'Blue', 'Yellow', 'Green', 'Red'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTempColor(tempColor === color ? '' : color)}
                        className={`px-4 py-2 rounded-xl text-xs border font-medium transition-all ${
                          tempColor === color 
                            ? 'border-accent bg-accent text-white' 
                            : 'border-primary-light bg-card-dark text-slate-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filters */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categories</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTempCategory('')}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] border font-medium truncate transition-all ${
                        tempCategory === '' 
                          ? 'border-accent bg-accent/10 text-white' 
                          : 'border-primary-light bg-card-dark text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setTempCategory(cat.slug)}
                        className={`py-2 px-1 text-center rounded-xl text-[11px] border font-medium truncate transition-all ${
                          tempCategory === cat.slug 
                            ? 'border-accent bg-accent/10 text-white' 
                            : 'border-primary-light bg-card-dark text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action buttons footer */}
              <div className="p-5 border-t border-primary-light/80 flex gap-4 bg-primary-dark">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3.5 bg-card-dark hover:bg-primary-light border border-primary-light rounded-2xl text-xs font-bold tracking-wide transition-all"
                >
                  Clear Filter
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-2xl text-xs font-bold tracking-wide shadow-md shadow-accent/20 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
