import React from 'react';
import { useStore } from '../context/StoreContext';
import { Smartphone, Wrench, ShieldCheck, Zap, ArrowLeft, Search } from 'lucide-react';
import heroImage from '../assets/images/hero_mustafa_mobile_1790283206648.jpg';

export const Hero: React.FC = () => {
  const { setActiveTab, setIsRequestMaintenanceOpen, setIsTrackerOpen, settings } = useStore();

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-6 pb-12 lg:pt-10 lg:pb-16 border-b border-slate-900">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Right Column: Hero Content (RTL Leading) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Subtle Text Kicker (No pill box) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>مركز {settings.storeName} • {settings.city}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">هواتف • شاشات • شواحن • صيانة</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight lg:leading-tight">
              بيع أحدث الهواتف الذكية،{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-400 via-amber-200 to-amber-500">
                صيانة الشاشات وقطع الغيار
              </span>{' '}
              بأعلى درجات الدقة
            </h1>

            {/* Body Prose */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              وجهتكم الأولى لشراء أجهزة آبل وسامسونج وشاومي الأصلية، مع أوسع تشكيلة شواحن سريعة
              وسوارات وكفرات حماية. نقدم في ورشة {settings.ownerName} المتخصصة صيانة فورية مجهرية لتبديل الشاشات
              والبطاريات والآيسيات مع إصدار فواتير رسمية مطبوعة (A4 وحراري) وضمان حقيقي معتمد.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTab('store');
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 group cursor-pointer"
              >
                <span>تصفح الهواتف والإكسسوارات</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsRequestMaintenanceOpen(true)}
                className="px-5 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>طلب حجز صيانة جهاز</span>
              </button>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>تتبع حالة فحص جهازك</span>
              </button>
            </div>

            {/* Proof Metrics (Claim to proof adjacency) */}
            <div className="pt-4 border-t border-slate-900 grid grid-cols-3 gap-4 text-slate-300">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
                  100%
                </div>
                <div className="text-xs text-slate-400 mt-0.5">قطع أصلية وكفالة معتمدة</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                  30 دقيقة
                </div>
                <div className="text-xs text-slate-400 mt-0.5">صيانة سريعة للشاشات</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">
                  +3,200
                </div>
                <div className="text-xs text-slate-400 mt-0.5">زبون وجهاز مصلح بثقة</div>
              </div>
            </div>
          </div>

          {/* Left Column: Visual Showcase Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={heroImage}
                alt="معرض مصطفى كطان للهواتف والصيانة"
                className="w-full aspect-[4/3] object-cover group-hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Overlay card info */}
              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    فحص مخبري ومجهري دقيق
                  </span>
                  <span className="text-xs text-amber-400 font-bold">مصطفى كطان</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5">
                  أجهزة كشف الأعطال الحديثة، مكائن إزالة الفقاعات، وأفران فصل الشاشات بالليزر
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
