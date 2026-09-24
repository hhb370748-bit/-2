import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  LogOut,
  ShoppingBag,
  Wrench,
  CheckCircle2,
  Receipt,
} from 'lucide-react';

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    currentCustomer,
    loginCustomer,
    signupCustomer,
    logoutCustomer,
    orders,
    maintenanceRequests,
    openInvoice,
    formatPrice,
  } = useStore();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  if (!isAuthModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;
    const ok = loginCustomer(emailOrPhone);
    if (ok) {
      setIsAuthModalOpen(false);
      setEmailOrPhone('');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name.trim() || !signupForm.phone.trim()) {
      alert('يرجى كتابة الاسم ورقم الهاتف على الأقل');
      return;
    }
    signupCustomer(
      signupForm.name,
      signupForm.email,
      signupForm.phone,
      signupForm.address
    );
    setIsAuthModalOpen(false);
  };

  // Find customer's activity
  const myOrders = currentCustomer
    ? orders.filter(
        (o) =>
          o.customerPhone === currentCustomer.phone ||
          (o.customerEmail && o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase())
      )
    : [];

  const myMaintenance = currentCustomer
    ? maintenanceRequests.filter(
        (m) =>
          m.customerPhone === currentCustomer.phone ||
          m.customerName.toLowerCase().includes(currentCustomer.name.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {currentCustomer ? 'الملف الشخصي للزبون' : authMode === 'login' ? 'تسجيل دخول الزبون' : 'إنشاء حساب جديد'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {currentCustomer ? (
            /* Logged in Profile & Activity */
            <div className="space-y-6">
              {/* User info card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-400/30">
                    {currentCustomer.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{currentCustomer.name}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>{currentCustomer.phone}</span>
                      <span>•</span>
                      <span>{currentCustomer.email}</span>
                    </div>
                    {currentCustomer.address && (
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{currentCustomer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={logoutCustomer}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-rose-400 transition-colors text-xs flex items-center gap-1"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>

              {/* Past Orders */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>طلبات الشراء وفواتيري ({myOrders.length}):</span>
                </h5>

                {myOrders.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {myOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white font-mono">{ord.id}</div>
                          <div className="text-slate-400 text-[11px]">
                            {ord.createdAt} • {ord.items.length} منتجات
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-400">
                            {formatPrice(ord.total)}
                          </span>
                          <button
                            onClick={() => openInvoice({ type: 'order', data: ord })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-amber-400" />
                            <span>فاتورة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    لا توجد فواتير شراء سابقة مسجلة بهذا الحساب بعد.
                  </div>
                )}
              </div>

              {/* Maintenance Tickets */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  <span>تذاكر وأجهزة الصيانة الخاصة بي ({myMaintenance.length}):</span>
                </h5>

                {myMaintenance.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {myMaintenance.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-amber-300 font-mono">
                            {req.id} - {req.deviceBrand} {req.deviceModel}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {req.issueCategory} • {req.receivedDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                            {req.status === 'ready'
                              ? 'جاهز للاستلام'
                              : req.status === 'repairing'
                              ? 'قيد التصليح'
                              : 'تم الاستلام'}
                          </span>
                          <button
                            onClick={() => openInvoice({ type: 'maintenance', data: req })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-amber-400" />
                            <span>وصل</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    لا توجد تذاكر صيانة سابقة مسجلة.
                  </div>
                )}
              </div>
            </div>
          ) : authMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                أهلاً بك! يمكنك تسجيل الدخول بالبريد الإلكتروني أو رقم الهاتف لمتابعة فواتيرك وتتبع
                صيانة أجهزتك بسهولة.
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  البريد الإلكتروني أو رقم الهاتف المسجل:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: 0770XXXXXXX أو name@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                تسجيل الدخول
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="اسمك الكريم"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  رقم الهاتف / الواتساب *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0770XXXXXXX"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  عنوان السكن / التوصيل المفضل (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="المحافظة - المنطقة - أقرب نقطة دالة"
                  value={signupForm.address}
                  onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md mt-2 cursor-pointer"
              >
                إنشاء الحساب وتفعيله فوراً
              </button>

              <div className="text-center pt-2 text-xs text-slate-400">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  تسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
