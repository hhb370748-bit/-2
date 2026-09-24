import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  PhoneCall,
  CheckCircle2,
  Truck,
  Store,
  Printer,
  Receipt,
  FileText,
  Wrench,
  User,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { Order, OrderItem } from '../types/store';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    settings,
    showToast,
    currentCustomer,
    setIsAuthModalOpen,
    addOrder,
    openInvoice,
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [orderKind, setOrderKind] = useState<'purchase' | 'part_installation'>('purchase');
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(false);
  const [installationFee, setInstallationFee] = useState<number>(15000);

  // Editable delivery fee by user/admin
  const [customDeliveryFee, setCustomDeliveryFee] = useState<number>(settings.defaultDeliveryFee || 5000);

  // Customer Details Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Completed Order State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Pre-fill if customer is logged in
  useEffect(() => {
    if (currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name);
      if (!customerPhone) setCustomerPhone(currentCustomer.phone);
      if (!customerEmail) setCustomerEmail(currentCustomer.email);
      if (!customerAddress && currentCustomer.address) setCustomerAddress(currentCustomer.address);
    }
  }, [currentCustomer]);

  // Sync default fee when settings change
  useEffect(() => {
    if (settings.defaultDeliveryFee !== undefined) {
      setCustomDeliveryFee(settings.defaultDeliveryFee);
    }
  }, [settings.defaultDeliveryFee]);

  if (!isCartOpen) return null;

  const itemsSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const activeInstallFee = includeInstallation ? installationFee : 0;
  const subtotal = itemsSubtotal + activeInstallFee;
  const effectiveDeliveryFee = deliveryType === 'delivery' ? Number(customDeliveryFee) || 0 : 0;
  const grandTotal = subtotal + effectiveDeliveryFee;

  // Process checkout & create order
  const handleProcessOrder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف لإصدار الفاتورة وتأكيد الطلب');
      return;
    }

    const orderItems: OrderItem[] = cart.map((c) => ({
      id: c.product.id,
      title: c.product.title,
      price: c.product.price,
      quantity: c.quantity,
      condition: c.product.condition,
      type: c.product.categoryId === 'cat-screens' ? 'part' : 'product',
    }));

    if (includeInstallation) {
      orderItems.push({
        id: 'srv-install-fee',
        title: 'أجور فحص وتركيب وبرمجة الشاشة/القطعة بالورشة',
        price: installationFee,
        quantity: 1,
        type: 'repair_service',
      });
    }

    const newOrder = addOrder({
      orderType: includeInstallation ? 'part_installation' : 'purchase',
      items: orderItems,
      subtotal,
      deliveryFee: effectiveDeliveryFee,
      total: grandTotal,
      deliveryMethod: deliveryType,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      customerAddress: deliveryType === 'delivery' ? customerAddress : 'استلام من المحل',
      notes: orderNotes,
    });

    setCreatedOrder(newOrder);
    clearCart();
    showToast(`تم إصدار الفاتورة رقم #${newOrder.id} بنجاح!`);
  };

  const handleWhatsAppSend = () => {
    if (!createdOrder) return;
    const itemsList = createdOrder.items
      .map(
        (i, idx) =>
          `${idx + 1}. *${i.title}*\n   الكمية: ${i.quantity} | السعر: ${formatPrice(
            i.price * i.quantity
          )}`
      )
      .join('\n\n');

    const msg = `🛍️ *فاتورة طلب جديدة - ${settings.storeName}*\nرقم الفاتورة: *${
      createdOrder.id
    }*\n\n*بيانات الزبون:*\n- الاسم: ${createdOrder.customerName}\n- الهاتف: ${
      createdOrder.customerPhone
    }\n${createdOrder.customerEmail ? `- البريد: ${createdOrder.customerEmail}\n` : ''}- طريقة الاستلام: ${
      createdOrder.deliveryMethod === 'delivery' ? 'توصيل للمنزل' : 'استلام من المحل'
    }${
      createdOrder.deliveryMethod === 'delivery'
        ? `\n- العنوان: ${createdOrder.customerAddress}\n- أجور التوصيل المحددة: ${formatPrice(
            createdOrder.deliveryFee
          )}`
        : ''
    }\n\n*المنتجات والقطع المطلوبة:*\n${itemsList}\n\n💰 *المجموع النهائي للفاتورة:* ${formatPrice(
      createdOrder.total
    )}\n\nيرجى تأكيد الاستلام والتجهيز.`;

    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setCreatedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-lg bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col text-right">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                سلة الشراء والفاتورة ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {createdOrder ? (
              /* Order Completed & Invoice Action Screen */
              <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white">تم إصدار فاتورتك بنجاح!</h4>
                  <p className="text-xs text-slate-300">
                    رقم الفاتورة المعتمدة في متجر وورشة {settings.storeName}:
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 font-mono text-amber-400 font-extrabold text-2xl tracking-wider">
                  {createdOrder.id}
                </div>

                {/* Print Options */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-right">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>طباعة الفاتورة للزبون:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openInvoice({ type: 'order', data: createdOrder }, 'a4')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>فاتورة قياسية A4</span>
                    </button>

                    <button
                      onClick={() => openInvoice({ type: 'order', data: createdOrder }, 'thermal')}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <span>طباعة حرارية 80mm</span>
                    </button>
                  </div>
                </div>

                {/* WhatsApp Dispatch */}
                <button
                  onClick={handleWhatsAppSend}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>إرسال تفاصيل الفاتورة عبر واتساب</span>
                </button>

                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                >
                  العودة لتصفح المتجر
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* Empty Cart */
              <div className="py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="text-sm font-bold text-white">سلة التسوق فارغة حالياً</div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  تصفح الهواتف والشاشات والشواحن والإكسسوارات واضغط "إضافة" لطلبها مع فاتورة فورية
                </p>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4">
                {/* Customer Account Status Banner */}
                {currentCustomer ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 font-bold">
                        الزبون المسجل: {currentCustomer.name}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {currentCustomer.phone}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span>هل لديك حساب زبون مسجل؟</span>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      تسجيل الدخول / إنشاء حساب
                    </button>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-14 h-14 object-contain rounded-lg bg-slate-900 p-1 shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.title}
                        </h4>
                        <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                          {formatPrice(item.product.price)}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Screen / Part Installation Toggle (If user is buying screen or part) */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        طلب تركيب وفحص القطعة / الشاشة في الورشة
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      id="install-check"
                      checked={includeInstallation}
                      onChange={(e) => setIncludeInstallation(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                  </div>

                  {includeInstallation && (
                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">أجور التركيب ونقل True Tone:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={installationFee}
                            onChange={(e) => setInstallationFee(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-emerald-400 text-left"
                          />
                          <span className="text-[11px] text-slate-400">د.ع</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-400">
                        يشمل فحص الشاشة والكاميرات وتثبيت اللصق المقاوم للماء وضمان التركيب.
                      </p>
                    </div>
                  )}
                </div>

                {/* Delivery Type & Custom Delivery Fee */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    طريقة الاستلام والتوصيل:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>توصيل للمنزل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        deliveryType === 'pickup'
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>استلام من المحل</span>
                    </button>
                  </div>

                  {/* CUSTOM DELIVERY FEE (Editable) */}
                  {deliveryType === 'delivery' && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        تحديد مبلغ التوصيل في الفاتورة:
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={customDeliveryFee}
                          onChange={(e) => setCustomDeliveryFee(Number(e.target.value))}
                          placeholder="5000"
                          className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 text-left focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[11px] text-slate-400">د.ع</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Checkout Form */}
                <form id="cart-form" onSubmit={handleProcessOrder} className="space-y-3">
                  <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">
                    بيانات إصدار الفاتورة:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="اسم المشتري"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        رقم الهاتف / الواتساب *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0770XXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      البريد الإلكتروني للزبون (اختياري)
                    </label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {deliveryType === 'delivery' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        عنوان التوصيل بالتفصيل *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="المحافظة - المنطقة - أقرب نقطة دالة"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      ملاحظات خاصة بالفاتورة (اختياري)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: يرجى فحص الكرتون قبل الشحن..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {!createdOrder && cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>مجموع المنتجات:</span>
                  <span className="font-mono text-slate-200">{formatPrice(itemsSubtotal)}</span>
                </div>

                {includeInstallation && (
                  <div className="flex justify-between text-amber-300">
                    <span>أجور التركيب بالورشة:</span>
                    <span className="font-mono">{formatPrice(installationFee)}</span>
                  </div>
                )}

                {deliveryType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>أجور التوصيل المحددة:</span>
                    <span className="font-mono text-slate-200">{formatPrice(effectiveDeliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>المجموع الإجمالي للفاتورة:</span>
                  <span className="font-mono text-amber-400">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Action: Generate invoice & proceed */}
              <button
                type="submit"
                form="cart-form"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>إصدار الفاتورة وتأكيد الطلب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
