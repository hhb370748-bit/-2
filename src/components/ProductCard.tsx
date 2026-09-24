import React from 'react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Eye, PhoneCall, ShieldCheck, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { categories, formatPrice, addToCart, setSelectedProduct, settings } = useStore();

  const category = categories.find((c) => c.id === product.categoryId);

  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `مرحباً مصطفى كطان، أود شراء:\n*${product.title}*\nالسعر: ${formatPrice(
      product.price
    )}\nالحالة: ${product.condition}\nهل هو متوفر حالياً للاستلام أو التوصيل؟`;
    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
    >
      {/* Visual Slot */}
      <div className="relative aspect-[4/3] bg-slate-950/80 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Elegant fallback
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />

        {/* Condition Tag (Quiet subtle text, no huge pill) */}
        <div className="absolute top-3 right-3 text-[11px] font-semibold text-slate-300 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800">
          {product.condition}
        </div>

        {/* Quick Preview Hover Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(product);
          }}
          className="absolute inset-x-4 bottom-3 py-2 px-3 bg-slate-950/90 hover:bg-slate-900 text-slate-200 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 border border-slate-700 backdrop-blur-sm"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>معاينة التفاصيل والمواصفات</span>
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-right">
        <div>
          {/* Metadata line: Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span className="text-amber-400/90 font-semibold">{product.brand}</span>
            <span>{category?.name || 'إلكترونيات'}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 group-hover:text-amber-300 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Warranty note */}
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{product.warranty}</span>
          </div>
        </div>

        {/* Price and Action Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Price area */}
          <div className="flex flex-col">
            <div className="text-base sm:text-lg font-bold text-amber-400 font-mono tabular-nums">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleWhatsAppBuy}
              title="شراء أو حجز فوري عبر واتساب"
              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              title="إضافة إلى السلة"
              className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>إضافة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
