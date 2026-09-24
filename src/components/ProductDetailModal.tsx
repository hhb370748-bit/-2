import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShoppingBag, PhoneCall, ShieldCheck, CheckCircle2, PackageCheck } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, formatPrice, addToCart, settings, categories } =
    useStore();
  const [quantity, setQuantity] = useState<number>(1);

  if (!selectedProduct) return null;

  const category = categories.find((c) => c.id === selectedProduct.categoryId);

  const handleWhatsAppBuy = () => {
    const total = selectedProduct.price * quantity;
    const message = `مرحباً مصطفى كطان، أود طلب:\n*${selectedProduct.title}*\nالكمية: ${quantity}\nالإجمالي: ${formatPrice(
      total
    )}\nالحالة: ${selectedProduct.condition}\nالضمان: ${selectedProduct.warranty}\nيرجى تأكيد التوفر والتسليم.`;
    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleAddAndClose = () => {
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-amber-400 font-bold">{selectedProduct.brand}</span>
            <span>•</span>
            <span>{category?.name}</span>
          </div>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Preview */}
            <div className="md:col-span-5 bg-slate-950 rounded-2xl p-6 flex items-center justify-center border border-slate-800/80">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="max-h-72 object-contain w-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info and Specs */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {selectedProduct.condition}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {selectedProduct.title}
              </h2>

              {/* Price display */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.originalPrice &&
                  selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-sm text-slate-500 line-through font-mono tabular-nums">
                      {formatPrice(selectedProduct.originalPrice)}
                    </span>
                  )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Warranty and Stock */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">الكفالة والضمان</div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {selectedProduct.warranty}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">حالة المخزون</div>
                    <div className="text-[11px] text-emerald-400">
                      متوفر في المحل ({selectedProduct.stock} قطعة)
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-300 mb-2">أبرز المواصفات والميزات:</h4>
                  <ul className="space-y-1.5">
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              +
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleWhatsAppBuy}
              className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>طلب مباشر واتساب</span>
            </button>

            <button
              onClick={handleAddAndClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>إضافة للسلة ({formatPrice(selectedProduct.price * quantity)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
