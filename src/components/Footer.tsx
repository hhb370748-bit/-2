import React from 'react';
import { useStore } from '../context/StoreContext';
import { Smartphone, Wrench, PhoneCall, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, setSelectedCategory, categories } = useStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-right pt-12 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-base font-extrabold text-white">{settings.storeName}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              معرض ومركز متخصص لبيع الهواتف الذكية الأصلية، صيانة الشاشات المجهرية بالليزر، استبدال
              البطاريات، وتوفير كافة مستلزمات وإكسسوارات الهواتف والشواحن السريعة والسوارات في بغداد.
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {settings.mapUrl ? (
                  <a
                    href={settings.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 transition-colors"
                  >
                    {settings.city} - {settings.address} (فتح الخريطة)
                  </a>
                ) : (
                  <span>{settings.city} - {settings.address}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono">هاتف / واتساب: {settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>أوقات الدوام: يومياً من 10:00 صباحاً وحتى 11:00 مساءً</span>
              </div>
            </div>
          </div>

          {/* Categories Col */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">أقسام المتجر</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveTab('store');
                      setSelectedCategory(cat.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Maintenance Col */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider">خدمات الورشة والصيانة</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>تبديل شاشات آيفون وسامسونج أصلية وكالة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>برمجة بطاريات ونقل نسبة الشحن 100%</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>صيانة آيسيات الباور والشحن والشبكة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>فك أقفال وتحديث وبرمجة سوفت وير</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>استشارة فنية فورية عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} • متجر وورشة مصطفى كطان لبيع وصيانة الهواتف
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('admin')}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              دخول لوحة الإدارة
            </button>
            <span>•</span>
            <span>قطع أصلية 100% مع ضمان رسمي</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
