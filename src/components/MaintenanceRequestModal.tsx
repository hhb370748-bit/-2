import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MaintenanceRequest } from '../types/store';
import { X, Wrench, PhoneCall, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const MaintenanceRequestModal: React.FC = () => {
  const {
    isRequestMaintenanceOpen,
    setIsRequestMaintenanceOpen,
    addMaintenanceRequest,
    settings,
  } = useStore();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    issueCategory: 'شاشة مكسورة / عرض' as MaintenanceRequest['issueCategory'],
    issueDetails: '',
    priority: 'عادي' as MaintenanceRequest['priority'],
    estimatedCost: 35000,
  });

  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  if (!isRequestMaintenanceOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.deviceModel) {
      alert('يرجى ملء الاسم ورقم الهاتف وموديل الهاتف');
      return;
    }

    const ticketId = addMaintenanceRequest({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deviceBrand: formData.deviceBrand,
      deviceModel: formData.deviceModel,
      issueCategory: formData.issueCategory,
      issueDetails: formData.issueDetails || 'فحص شامل في الورشة',
      priority: formData.priority,
      estimatedCost: formData.estimatedCost,
      technicianNotes: 'تم حجز الطلب عبر الموقع الإلكتروني، بانتظار استلام الهاتف في الورشة.',
    });

    setCreatedTicketId(ticketId);
  };

  const handleSendToWhatsApp = () => {
    if (!createdTicketId) return;
    const msg = `مرحباً ورشة مصطفى كطان للصيانة،\nلقد قمت بحجز طلب صيانة لجهازي عبر الموقع:\n- رقم التذكرة: *${createdTicketId}*\n- العميل: ${formData.customerName}\n- الهاتف: ${formData.customerPhone}\n- الجهاز: ${formData.deviceBrand} ${formData.deviceModel}\n- نوع العطل: ${formData.issueCategory}\n- الأولوية: ${formData.priority}\n- تفاصيل العطل: ${formData.issueDetails}\nيرجى تأكيد موعد الاستلام في المحل.`;
    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const handleClose = () => {
    setIsRequestMaintenanceOpen(false);
    setCreatedTicketId(null);
    setFormData({
      customerName: '',
      customerPhone: '',
      deviceBrand: 'Apple',
      deviceModel: '',
      issueCategory: 'شاشة مكسورة / عرض',
      issueDetails: '',
      priority: 'عادي',
      estimatedCost: 35000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">حجز طلب فحص وصيانة هاتف</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!createdTicketId ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                🛠️ سيتم تسجيل طلبك فوراً وتوليد رقم تذكرة لمتابعة حالة الفحص خطوة بخطوة في ورشة
                مصطفى كطان.
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد علي"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
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
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">ماركة الهاتف</label>
                  <select
                    value={formData.deviceBrand}
                    onChange={(e) => setFormData({ ...formData, deviceBrand: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Apple">آبل (iPhone / iPad)</option>
                    <option value="Samsung">سامسونج (Samsung Galaxy)</option>
                    <option value="Xiaomi">شاومي (Xiaomi / Redmi / POCO)</option>
                    <option value="Huawei">هواوي و هونر (Huawei / Honor)</option>
                    <option value="Google">جوجل بكسل (Google Pixel)</option>
                    <option value="أخرى">ماركة أخرى</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    موديل الجهاز بالتحديد *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: iPhone 15 Pro أو S24 Ultra"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Issue Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">نوع المشكلة أو القطعة</label>
                  <select
                    value={formData.issueCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        issueCategory: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="شاشة مكسورة / عرض">شاشة مكسورة / تبديل شاشة أصلية</option>
                    <option value="تبديل بطارية">تبديل بطارية / صحة البطارية</option>
                    <option value="مدخل الشحن والمايك">مدخل الشحن / عطل الشاحن / المايك</option>
                    <option value="صيانة ماذر بورد وآي سي">صيانة ماذر بورد / آيسي باور / شورت</option>
                    <option value="سقوط بالماء ورطوبة">سقوط بالماء ورطوبة / تنظيف كيميائي</option>
                    <option value="كاميرا وعدسات">عدسات وكاميرات مكسورة أو ضبابية</option>
                    <option value="سوفت وير وفك قفل">سوفت وير / فك قفل / استرجاع نظام</option>
                    <option value="أخرى">عطل آخر</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">درجة الاستعجال</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="عادي">صيانة اعتيادية (خلال 24-48 ساعة)</option>
                    <option value="مستعجل (نفس اليوم)">مستعجل فوري (نفس اليوم خلال ساعات)</option>
                  </select>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  شرح مبسط للمشكلة والأعراض (اختياري)
                </label>
                <textarea
                  rows={3}
                  placeholder="مثال: الشاشة انكسرت بعد السقوط ولا تضيء، أو الهاتف يسخن عند الشحن..."
                  value={formData.issueDetails}
                  onChange={(e) => setFormData({ ...formData, issueDetails: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>تسجيل طلب الصيانة وتوليد التذكرة</span>
              </button>
            </form>
          ) : (
            /* Success confirmation screen */
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">تم استلام طلبك وتوليد التذكرة!</h4>
                <p className="text-xs text-slate-300">
                  يرجى الاحتفاظ برقم التذكرة أدناه لتتبع صيانة هاتفك أو إبرازها عند الحضور للمحل:
                </p>
              </div>

              {/* Generated ticket badge */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/40 inline-block px-8">
                <div className="text-xs text-slate-400">رقم تذكرة الصيانة الخاصة بك</div>
                <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-wider mt-1">
                  {createdTicketId}
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يمكنك التوجه مباشرة لفرعنا في {settings.address} أو إرسال تفاصيل التذكرة عبر الواتساب لتأكيد الاستلام فوراً.
              </p>

              {/* WhatsApp direct dispatch */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleSendToWhatsApp}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>إرسال تفاصيل التذكرة عبر الواتساب</span>
                </button>

                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  إغلاق ومتابعة التصفح
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
