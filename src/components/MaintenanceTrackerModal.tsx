import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MaintenanceRequest, MaintenanceStatus } from '../types/store';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  PackageCheck,
  AlertCircle,
  PhoneCall,
  Smartphone,
  Printer,
  FileText,
  Receipt,
} from 'lucide-react';

export const MaintenanceTrackerModal: React.FC = () => {
  const {
    isTrackerOpen,
    setIsTrackerOpen,
    maintenanceRequests,
    formatPrice,
    settings,
    openInvoice,
  } = useStore();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<MaintenanceRequest | null>(null);

  if (!isTrackerOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearched(true);
    const cleanQ = query.trim().toLowerCase();

    // Match by ID (case-insensitive) or phone number
    const found = maintenanceRequests.find(
      (r) =>
        r.id.toLowerCase() === cleanQ ||
        r.customerPhone.includes(cleanQ) ||
        r.customerName.toLowerCase().includes(cleanQ)
    );

    setResult(found || null);
  };

  const steps: { key: MaintenanceStatus; label: string; desc: string }[] = [
    { key: 'received', label: 'تم الاستلام', desc: 'تم استلام الهاتف وتسجيله في النظام' },
    { key: 'diagnosing', label: 'قيد الفحص', desc: 'فحص مجهري للدوائر والشاشة والبطارية' },
    { key: 'repairing', label: 'جاري الصيانة', desc: 'استبدال القطع الأصلية والتجميع' },
    { key: 'ready', label: 'جاهز للاستلام', desc: 'تم الاختبار بنجاح، يمكنك الحضور للمحل' },
    { key: 'delivered', label: 'تم التسليم', desc: 'تم تسليم الجهاز مع شهادة الضمان' },
  ];

  const getStatusIndex = (st: MaintenanceStatus): number => {
    return steps.findIndex((s) => s.key === st);
  };

  const currentIdx = result ? getStatusIndex(result.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">تتبع صيانة الهاتف المباشر</h3>
          </div>
          <button
            onClick={() => {
              setIsTrackerOpen(false);
              setResult(null);
              setSearched(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              أدخل رقم التذكرة أو رقم الهاتف المسجل:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="مثال: MK-1048 أو رقم الهاتف 0780..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>بحث</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>تذاكر تجريبية سريعة:</span>
              <button
                type="button"
                onClick={() => setQuery('MK-1048')}
                className="text-amber-400 underline font-mono"
              >
                MK-1048
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setQuery('MK-1049')}
                className="text-amber-400 underline font-mono"
              >
                MK-1049
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setQuery('MK-1050')}
                className="text-amber-400 underline font-mono"
              >
                MK-1050
              </button>
            </div>
          </form>

          {/* Results Display */}
          {result && (
            <div className="space-y-6 border-t border-slate-800/80 pt-6">
              {/* Ticket Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">رقم التذكرة:</span>
                    <span className="text-sm font-mono font-bold text-amber-400">{result.id}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {result.priority}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <span>
                      {result.deviceBrand} {result.deviceModel}
                    </span>
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    العميل: {result.customerName} • تاريخ الاستلام: {result.receivedDate}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs text-slate-400">التكلفة التقديرية</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {formatPrice(result.estimatedCost)}
                  </div>
                </div>
              </div>

              {/* Visual Progress Stepper */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300">المراحل التنفيذية للصيانة:</h5>
                <div className="relative border-r-2 border-slate-800 pr-5 space-y-6 mr-3">
                  {steps.map((st, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={st.key} className="relative group">
                        {/* Circle dot on line */}
                        <div
                          className={`absolute -right-[27px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : isCurrent
                              ? 'bg-amber-400 border-amber-400 animate-pulse text-slate-950'
                              : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-amber-400'
                                : isCompleted
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {st.label} {isCurrent && '(المرحلة الحالية)'}
                          </div>
                          <div className="text-[11px] text-slate-400">{st.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technician Notes */}
              {result.technicianNotes && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>تقرير الفني المختص (مصطفى كطان):</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.technicianNotes}
                  </p>
                </div>
              )}

              {/* Print Ticket & Share Actions */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>طباعة وصل الاستلام والفحص:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openInvoice({ type: 'maintenance', data: result }, 'a4')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>وصل A4 رسمي</span>
                  </button>

                  <button
                    onClick={() => openInvoice({ type: 'maintenance', data: result }, 'thermal')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>وصل حراري (كاشير)</span>
                  </button>
                </div>
              </div>

              {/* Ready notice CTA if status is ready */}
              {result.status === 'ready' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
                  <span>
                    🎉 هاتفك جاهز للاستلام الآن! يمكنك التفضل للمحل لاستلام جهازك بعد اجتياز فحص الجودة.
                  </span>
                  <a
                    href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                      `مرحباً مصطفى كطان، أنا العميل ${result.customerName} بخصوص جهاز ${result.deviceModel} تذكرة رقم ${result.id}. أنا قادم لاستلامه.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>تأكيد الموعد</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Not Found */}
          {searched && !result && (
            <div className="py-8 text-center space-y-3 border-t border-slate-800">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-sm font-bold text-white">لم يتم العثور على تذكرة بهذا الرقم</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                يرجى التأكد من كتابة الرقم بشكل صحيح (مثل MK-1048) أو تواصل معنا عبر الواتساب للتحقق
                من سجلات الورشة يدوياً.
              </p>
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  `مرحباً مصطفى كطان، أود الاستعلام عن صيانة جهازي ولكن لم أجد التذكرة: ${query}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>الاستفسار عبر واتساب</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
