import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Smartphone,
  Wrench,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  PhoneCall,
  Clock,
  User,
  Receipt,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    settings,
    activeTab,
    setActiveTab,
    cart,
    setIsCartOpen,
    setIsTrackerOpen,
    setIsRequestMaintenanceOpen,
    setIsAuthModalOpen,
    setIsInvoiceCreatorOpen,
    setAuthMode,
    currentCustomer,
    updateSettings,
  } = useStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('ar-IQ', {
          weekday: 'short',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleCurrency = () => {
    updateSettings({ currency: settings.currency === 'IQD' ? 'USD' : 'IQD' });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>الورشة مفتوحة يومياً من 10:00 صباحاً حتى 11:00 ليلاً • صيانة فورية وفواتير معتمدة</span>
            {/* Live Clock with Date and Time */}
            {currentDate && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{currentDate} • {currentTime}</span>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
            <span>📞 هاتف: {settings.phone}</span>
            <span>📍 {settings.city} - {settings.address}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Title with Logo Support */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('store')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-10 h-10 rounded-xl object-contain bg-slate-900 border border-slate-800 p-0.5 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>{settings.storeName}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate max-w-xs">
                {settings.tagline || 'بيع الهواتف الذكية • صيانة الشاشات • إكسسوارات وكوابل'}
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all ${
              activeTab === 'store'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            المنتجات والأقسام
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>ورشة الصيانة والشاشات</span>
          </button>

          <button
            onClick={() => setIsTrackerOpen(true)}
            className="px-3 py-2 text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>تتبع جهازك</span>
          </button>

          {/* Quick Invoice Creator Button */}
          <button
            onClick={() => setIsInvoiceCreatorOpen(true)}
            className="px-3 py-2 text-xs lg:text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="إنشاء فاتورة يدوية سريعة مع تحديد المواد والتوصيل"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>كاشير وفاتورة سريعة</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>لوحة التحكم والإدارة</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Customer Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Customer Account Button */}
          <button
            onClick={() => {
              if (currentCustomer) {
                setIsAuthModalOpen(true);
              } else {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 text-xs transition-colors"
            title={currentCustomer ? `حساب: ${currentCustomer.name}` : 'تسجيل دخول أو إنشاء حساب جديد'}
          >
            <User className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-medium">
              {currentCustomer ? currentCustomer.name.split(' ')[0] : 'حساب الزبون'}
            </span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            title="تبديل العملة بين الدينار والدولار"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 transition-colors"
          >
            <span className="text-amber-400 font-bold">{settings.currency}</span>
            <span className="text-slate-500 text-[10px]">
              {settings.currency === 'IQD' ? 'عراقي' : 'USD'}
            </span>
          </button>

          {/* Quick Repair Button */}
          <button
            onClick={() => setIsRequestMaintenanceOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>طلب صيانة</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors focus:outline-none cursor-pointer"
            aria-label="سلة التسوق"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* WhatsApp Direct Connect */}
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
              `السلام عليكم ${settings.storeName}، أود الاستفسار عن الهواتف أو الشاشات أو خدمات الصيانة والإكسسوارات.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">واتساب</span>
          </a>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 px-2 py-2 bg-slate-950 overflow-x-auto gap-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'store'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400'
          }`}
        >
          المنتجات
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400'
          }`}
        >
          مركز الصيانة
        </button>
        <button
          onClick={() => setIsTrackerOpen(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 whitespace-nowrap"
        >
          تتبع جهازك
        </button>
        <button
          onClick={() => setIsRequestMaintenanceOpen(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-400 whitespace-nowrap"
        >
          + طلب صيانة
        </button>
        <button
          onClick={() => setIsInvoiceCreatorOpen(true)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 whitespace-nowrap"
        >
          🧾 كاشير وفاتورة
        </button>
        <button
          onClick={() => {
            if (currentCustomer) setIsAuthModalOpen(true);
            else {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 whitespace-nowrap"
        >
          {currentCustomer ? currentCustomer.name.split(' ')[0] : 'حسابي'}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'admin'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 border border-slate-800'
          }`}
        >
          لوحة الإدارة
        </button>
      </div>
    </header>
  );
};
