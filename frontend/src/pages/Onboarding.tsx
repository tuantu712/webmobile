import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'Office Furniture',
    desc: 'The best payment method connects your money to friends, family, brands, and experiences.',
    image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/onboarding/1.png',
    bg: '#0a1721',
  },
  {
    title: 'Relaxing Furniture',
    desc: 'Upholstered cozy items selected for maximum tranquility and ergonomics in your home.',
    image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/onboarding/2.png',
    bg: '#0a1721',
  },
  {
    title: 'Home Decor',
    desc: 'Decor elements, side tables, lamps, and cupboards that turn your house into a cozy home.',
    image: 'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/onboarding/3.png',
    bg: '#0a1721',
  }
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('fuzzy_onboarded', 'true');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between px-6 py-10 relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <img 
          src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/logo/logo.png" 
          alt="fuzzy logo" 
          className="h-7 object-contain"
        />
        <button 
          onClick={handleComplete}
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Image Slider with Framer Motion */}
      <div className="my-auto flex flex-col items-center justify-center relative w-full h-[60%]">
        {/* Background designs */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-40">
          <img 
            src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/onboarding/design1.png" 
            alt="bg design" 
            className="w-[85%] object-contain"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="flex flex-col items-center z-10 w-full"
          >
            <img 
              src={slides[current].image} 
              alt={slides[current].title} 
              className="h-64 object-contain mb-8 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]"
            />
            
            <h1 className="text-2xl font-bold text-white text-center mb-3">
              {slides[current].title}
            </h1>
            <p className="text-sm text-slate-300 text-center max-w-xs leading-relaxed">
              {slides[current].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-between items-center mt-auto z-10">
        {/* Slide Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current ? 'w-6 bg-accent' : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={nextSlide}
          className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/30 transition-all duration-200 active:scale-95"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
