import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Printer,
  FileText,
  Receipt,
  PhoneCall,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Wrench,
  Download,
} from 'lucide-react';
import { printElement } from '../utils/print';

export const InvoiceModal: React.FC = () => {
  const {
    activeInvoice,
    closeInvoice,
    invoicePrintFormat,
    setInvoicePrintFormat,
    settings,
    formatPrice,
  } = useStore();

  if (!activeInvoice) return null;

  const isOrder = activeInvoice.type === 'order';
  const order = isOrder ? activeInvoice.data : null;
  const maintenance = !isOrder ? activeInvoice.data : null;

  const handlePrint = () => {
    const printed = printElement(
      invoicePrintFormat === 'a4' ? 'printable-invoice' : 'printable-thermal',
      `فاتورة ${invoiceNumber || ''}`,
      invoicePrintFormat
    );
    if (!printed) {
      window.alert('يرجى السماح بفتح نافذة الطباعة من المتصفح.');
    }
  };

  const invoiceNumber = isOrder ? order?.id : maintenance?.id;
  const invoiceDate = isOrder ? order?.createdAt : maintenance?.receivedDate;
  const customerName = isOrder ? order?.customerName : maintenance?.customerName;
  const customerPhone = isOrder ? order?.customerPhone : maintenance?.customerPhone;
  const customerAddress = isOrder ? order?.customerAddress : 'استلام في ورشة مصطفى كطان';

  const subtotal = isOrder ? order?.subtotal || 0 : maintenance?.estimatedCost || 0;
  const deliveryFee = isOrder ? order?.deliveryFee || 0 : 0;
  const total = isOrder ? order?.total || 0 : maintenance?.estimatedCost || 0;

  const handleShareWhatsApp = () => {
    const text = isOrder
      ? `📄 *فاتورة شراء - ${settings.storeName}*\nرقم الفاتورة: *${invoiceNumber}*\nالعميل: ${customerName}\nالهاتف: ${customerPhone}\nالمجموع الإجمالي: ${formatPrice(
          total
        )}\nطريقة الاستلام: ${
          order?.deliveryMethod === 'delivery' ? 'توصيل للمنزل' : 'استلام من المحل'
        }\nشكراً لتعاملكم معنا!`
      : `📄 *وصل صيانة هاتف - ${settings.storeName}*\nرقم التذكرة: *${invoiceNumber}*\nالعميل: ${customerName}\nالجهاز: ${maintenance?.deviceBrand} ${maintenance?.deviceModel}\nالعطل: ${maintenance?.issueCategory}\nالحالة: ${maintenance?.status}\nالتكلفة التقديرية: ${formatPrice(
          total
        )}\nورشة مصطفى كطان`;

    window.open(
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container */}
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col text-right print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-none print:max-w-none print:w-full print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isOrder ? 'فاتورة شراء وتجهيز' : 'وصل فحص وتصليح هاتف'} (#{invoiceNumber})
            </h3>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setInvoicePrintFormat('a4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  invoicePrintFormat === 'a4'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ورق قياسي A4</span>
              </button>

              <button
                onClick={() => setInvoicePrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  invoicePrintFormat === 'thermal'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>طباعة حرارية (80mm)</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1 transition-colors"
              title="مشاركة الفاتورة عبر واتساب"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">واتساب</span>
            </button>

            <button
              onClick={closeInvoice}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div id="printable-invoice-container" className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-950/40 print:p-0 print:bg-white print:overflow-visible">
          {/* FORMAT 1: A4 Standard Document */}
          {invoicePrintFormat === 'a4' && (
            <div
              id="printable-invoice"
              className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200 space-y-6 print:border-none print:shadow-none print:rounded-none print:p-6 print:max-w-none print:w-full"
            >
              {/* Header: Company & Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-500 pb-6">
                <div className="flex items-center gap-3">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.storeName}
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                      <Smartphone className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                      {settings.storeName}
                    </h1>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {settings.tagline || 'بيع الهواتف، صيانة الشاشات، وقطع الغيار والإكسسوارات'}
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                      <span>📍 {settings.city} - {settings.address}</span>
                      <span>📞 {settings.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-left">
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold font-mono">
                    {isOrder ? 'فاتورة مبيعات' : 'وصل صيانة وضمان'}
                  </div>
                  <div className="text-sm font-extrabold text-slate-950 font-mono mt-1">
                    #{invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    التاريخ: {invoiceDate}
                  </div>
                </div>
              </div>

              {/* Customer & Order Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-500 font-medium">بيانات العميل:</div>
                  <div className="font-bold text-slate-900 text-sm">{customerName}</div>
                  <div className="font-mono text-slate-700">هاتف: {customerPhone}</div>
                  {order?.customerEmail && (
                    <div className="font-mono text-slate-600">بريد: {order.customerEmail}</div>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <div className="text-slate-500 font-medium">تفاصيل الاستلام والخدمة:</div>
                  <div className="font-semibold text-slate-800">
                    {isOrder
                      ? order?.deliveryMethod === 'delivery'
                        ? 'توصيل بالدليفري للمنزل'
                        : 'استلام مباشر من فرع المحل'
                      : `صيانة جهاز: ${maintenance?.deviceBrand} ${maintenance?.deviceModel}`}
                  </div>
                  {isOrder && order?.deliveryCompany && (
                    <div className="text-amber-800 font-semibold text-[11px]">
                      شركة / اسم التوصيل: {order.deliveryCompany}
                    </div>
                  )}
                  <div className="text-slate-600 truncate max-w-xs">{customerAddress}</div>
                  {!isOrder && (
                    <div className="text-amber-700 font-semibold">
                      الحالة: {maintenance?.status === 'ready' ? 'جاهز للاستلام ✅' : 'قيد الصيانة 🛠️'}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">البيان / القطعة أو الخدمة</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-left">السعر المفرد</th>
                      <th className="p-3 text-left">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {isOrder && order?.items ? (
                      order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {item.condition && (
                                <span className="text-[11px] text-slate-500">حالة: {item.condition}</span>
                              )}
                              {item.notes && (
                                <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  ملاحظة: {item.notes}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="p-3 text-left font-mono text-slate-700">
                            {formatPrice(item.price)}
                          </td>
                          <td className="p-3 text-left font-mono font-bold text-slate-900">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-slate-400 font-mono">1</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">
                            فحص وصيانة: {maintenance?.deviceBrand} {maintenance?.deviceModel}
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            نوع العطل: {maintenance?.issueCategory}
                          </div>
                          {maintenance?.technicianNotes && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              تقرير الورشة: {maintenance?.technicianNotes}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold">1</td>
                        <td className="p-3 text-left font-mono text-slate-700">
                          {formatPrice(maintenance?.estimatedCost || 0)}
                        </td>
                        <td className="p-3 text-left font-mono font-bold text-slate-900">
                          {formatPrice(maintenance?.estimatedCost || 0)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
                <div className="w-64 flex justify-between text-slate-600">
                  <span>مجموع البنود:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>

                {isOrder && deliveryFee > 0 && (
                  <div className="w-64 flex justify-between text-slate-600">
                    <span>أجور التوصيل المحددة:</span>
                    <span className="font-mono font-bold text-slate-900">{formatPrice(deliveryFee)}</span>
                  </div>
                )}

                <div className="w-64 flex justify-between text-sm font-black text-slate-950 border-t-2 border-slate-900 pt-2 mt-1">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="font-mono text-amber-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Notes display if available */}
              {isOrder && order?.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-800">
                  <span className="font-bold text-amber-900">ملاحظات الفاتورة:</span> {order.notes}
                </div>
              )}

              {/* Terms and Signatures */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-[11px] text-slate-500">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">شروط الضمان وسياسة المحل:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                    <li>القطع والشاشات مشمولة بضمان الفحص وفق المدة المحددة.</li>
                    <li>لا يشمل الضمان الكسر أو السقوط بالماء بعد الاستلام.</li>
                    <li>الرجاء إبراز هذا الوصل عند المراجعة أو استلام الجهاز.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-center justify-end text-center space-y-2">
                  <div className="w-32 border-b border-slate-400 pb-1 font-bold text-slate-800 text-xs">
                    ختم وتوقيع الإدارة
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {settings.ownerName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 2: Thermal Receipt (80mm) */}
          {invoicePrintFormat === 'thermal' && (
            <div
              id="printable-thermal"
              className="w-[340px] bg-white text-slate-950 rounded-xl shadow-xl p-5 border border-slate-300 font-mono text-xs space-y-3 print:border-none print:shadow-none print:p-2 print:w-[80mm]"
            >
              {/* Thermal Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                <div className="font-black text-base tracking-tight">{settings.storeName}</div>
                <div className="text-[11px] text-slate-600">
                  {settings.tagline || 'صيانة هواتف • شاشات • إكسسوارات'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {settings.city} - {settings.address}
                </div>
                <div className="text-[11px] font-bold">هاتف: {settings.phone}</div>
              </div>

              {/* Receipt Info */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>الرقم: #{invoiceNumber}</span>
                  <span>{invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>العميل: {customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>الهاتف: {customerPhone}</span>
                </div>
                {isOrder && (
                  <>
                    <div className="flex justify-between">
                      <span>
                        طريقة: {order?.deliveryMethod === 'delivery' ? 'توصيل منزلي' : 'استلام محل'}
                      </span>
                    </div>
                    {order?.deliveryCompany && (
                      <div className="flex justify-between">
                        <span>التوصيل: {order.deliveryCompany}</span>
                      </div>
                    )}
                    {order?.notes && (
                      <div className="text-[10px] text-slate-600 border-t border-dotted border-slate-300 pt-1 mt-1">
                        ملاحظات: {order.notes}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3">
                <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
                  <span>البند</span>
                  <span>العدد x السعر</span>
                  <span>المجموع</span>
                </div>

                {isOrder && order?.items ? (
                  order.items.map((i, idx) => (
                    <div key={idx} className="space-y-0.5 text-[11px]">
                      <div className="font-bold truncate">{i.title}</div>
                      <div className="flex justify-between text-slate-600">
                        <span>{i.condition || 'أصلي'}</span>
                        <span>
                          {i.quantity} x {formatPrice(i.price)}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatPrice(i.price * i.quantity)}
                        </span>
                      </div>
                      {i.notes && (
                        <div className="text-[10px] text-slate-700 italic">
                          ملاحظة: {i.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <div className="font-bold">
                      {maintenance?.deviceBrand} {maintenance?.deviceModel}
                    </div>
                    <div className="text-[10px] text-slate-600">{maintenance?.issueCategory}</div>
                    <div className="flex justify-between">
                      <span>أجور فحص وقطع غيار:</span>
                      <span className="font-bold">
                        {formatPrice(maintenance?.estimatedCost || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {isOrder && deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>أجور التوصيل:</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300">
                  <span>الإجمالي النهائي:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Thermal Footer & Barcode Art */}
              <div className="text-center pt-2 space-y-1">
                <div className="tracking-widest font-mono text-sm py-1 bg-slate-100 rounded">
                  ||||| | |||| ||| |||| | |||||
                </div>
                <div className="text-[10px] font-bold text-slate-800">
                  شكراً لثقتكم في مركز {settings.storeName}!
                </div>
                <div className="text-[9px] text-slate-500">
                  يرجى الاحتفاظ بهذا الإيصال للاستلام والضمان
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
