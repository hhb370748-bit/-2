import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Wrench,
  Cpu,
  BatteryCharging,
  Droplets,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import repairLabImage from '../assets/images/phone_repair_lab_1790283219078.jpg';

export const MaintenanceSection: React.FC = () => {
  const { setIsRequestMaintenanceOpen, setIsTrackerOpen, settings } = useStore();
  const [quickTicketSearch, setQuickTicketSearch] = useState('');

  const services = [
    {
      icon: Cpu,
      title: 'تبديل الشاشات الأصلية OLED',
      description:
        'شاشات وكالة معتمدة تدعم نقل ميزة True Tone ومعدل 120Hz ProMotion بدون أي رسائل تنبيه، مع ضمان اللمس والألوان.',
      time: '30 - 45 دقيقة',
    },
    {
      icon: BatteryCharging,
      title: 'استبدال البطاريات الأصلية',
      description:
        'بطاريات صحة 100% مع نقل شريحة BMS الأصلية وتفعيل قراءة النسبة في النظام، وضمان استبدال فوري 6 أشهر.',
      time: '20 دقيقة',
    },
    {
      icon: Wrench,
      title: 'صيانة الماذر بورد والآيسيات المجهرية',
      description:
        'تصليح أعطال الباور، آي سي الشحن (U2 / Tristar)، مشاكل الإشارة والشبكة والواي فاي تحت الميكروسكوب بدقة متناهية.',
      time: 'نفس اليوم / 24 ساعة',
    },
    {
      icon: Droplets,
      title: 'صيانة الأجهزة الساقطة بالماء',
      description:
        'فك فوري وتنظيف كيميائي بحوض الألتراسونيك وإزالة الصدأ والأملاح لمنع شورت البورد وحفظ بيانات الهاتف كاملة.',
      time: 'فحص فوري خلال ساعتين',
    },
  ];

  return (
    <section id="maintenance-lab" className="py-14 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header & Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Right info */}
          <div className="lg:col-span-6 space-y-4 text-right">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>مختبر وورشة مصطفى كطان لصيانة الهواتف المتقدمة</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              صيانة مجهرية متخصصة لجميع هواتف{' '}
              <span className="text-amber-400">آبل وسامسونج وشاومي</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              نوفر في ورشتنا أحدث معدات التفكيك بالحرارة المضبوطة، ليزر فك الظهر الزجاجي، وأجهزة فحص
              الدوائر الإلكترونية ومخططات الماذر بورد الأصلية لضمان عودة هاتفك للعمل كما خرج من المصنع.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsRequestMaintenanceOpen(true)}
                className="px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>طلب حجز فحص أو صيانة</span>
              </button>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="px-5 py-3 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>تتبع حالة جهازك في الورشة</span>
              </button>
            </div>
          </div>

          {/* Left Visual: Repair Lab */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src={repairLabImage}
                alt="مختبر صيانة مصطفى كطان"
                className="w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 right-4 left-4 p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between text-right">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>ضمان الصيانة والقطع</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    جميع الشاشات والبطاريات وقطع الغيار مشمولة بكفالة رسمية
                  </div>
                </div>
                <div className="text-left font-mono text-xs text-amber-400 font-bold">
                  مصطفى كطان
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{srv.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono">{srv.time}</span>
                  </span>
                  <button
                    onClick={() => setIsRequestMaintenanceOpen(true)}
                    className="text-amber-400 hover:underline text-xs font-semibold"
                  >
                    حجز صيانة ←
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Ticket Lookup Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>هل جهازك قيد التصليح في ورشة مصطفى كطان حالياً؟</span>
            </h3>
            <p className="text-xs text-slate-400">
              أدخل رقم التذكرة المستلمة (مثل MK-1048) أو رقم هاتفك لمعرفة حالة الفحص والصيانة مباشرة
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="w-full md:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              فتح نظام التتبع المباشر
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
