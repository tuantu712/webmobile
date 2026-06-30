import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || 'FZ-XXXXXX';
  const total = searchParams.get('total') || '0';

  return (
    <div className="min-h-[85vh] px-6 flex flex-col items-center justify-center text-center select-none animate-fade-in">
      
      {/* Checkmark Animation */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
          <CheckCircle2 size={56} className="stroke-[2px]" />
        </div>
      </div>

      <h1 className="text-xl font-bold text-white mb-2">Order Placed Successfully!</h1>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-8">
        Your payment has been processed and your furniture order is being prepared.
      </p>

      {/* Details Box */}
      <div className="w-full bg-card-dark border border-primary-light/50 rounded-3xl p-5 mb-8 space-y-4 max-w-sm">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Order Code</span>
          <span className="font-bold text-white tracking-wider font-mono bg-primary-dark/80 px-3 py-1 rounded-lg border border-primary-light/30">
            {code}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Amount Paid</span>
          <span className="font-extrabold text-accent text-sm">${total}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Status</span>
          <span className="text-gold font-bold bg-gold/10 px-2.5 py-0.5 rounded text-[10px]">Pending Confirmation</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          to="/orders"
          className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-accent/25 transition-all flex items-center justify-center gap-2"
        >
          <span>Track Order</span>
          <ArrowRight size={14} />
        </Link>
        
        <Link
          to="/"
          className="w-full bg-card-dark hover:bg-primary-light border border-primary-light text-slate-300 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
}
