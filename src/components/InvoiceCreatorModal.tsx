import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderItem, Order, Product } from '../types/store';
import {
  X,
  FilePlus,
  Printer,
  FileText,
  Receipt,
  Plus,
  Trash2,
  PhoneCall,
  User,
  Truck,
  MapPin,
  Calculator,
  Search,
  ChevronDown,
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  CornerDownLeft,
  Clock,
  PauseCircle,
  Play,
} from 'lucide-react';

interface InvoiceRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  notes: string;
  selectedProductId?: string;
  isComboOpen?: boolean;
  highlightedIndex: number;
}

export const InvoiceCreatorModal: React.FC = () => {
  const {
    isInvoiceCreatorOpen,
    setIsInvoiceCreatorOpen,
    products,
    categories,
    customers,
    currentCustomer,
    settings,
    orders,
    formatPrice,
    addOrder,
    updateOrder,
    deleteOrder,
    suspendedInvoices,
    suspendInvoice,
    resumeSuspendedInvoice,
    deleteSuspendedInvoice,
    openInvoice,
    showToast,
  } = useStore();

  // Navigation index in recorded orders
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Suspended Invoices Modal
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);

  // Live Date and Time
  const [liveClock, setLiveClock] = useState<{ date: string; time: string }>({
    date: '',
    time: '',
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveClock({
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('ar-IQ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Compact Header Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.defaultDeliveryFee || 5000);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Items List
  const [rows, setRows] = useState<InvoiceRow[]>([
    {
      id: 'row-1',
      title: products[0]?.title || 'شاشة آيفون أصلية',
      price: products[0]?.price || 50000,
      quantity: 1,
      notes: products[0]?.warranty || 'ضمان فحص وتركيب معتمد',
      selectedProductId: products[0]?.id || 'custom',
      isComboOpen: false,
      highlightedIndex: 0,
    },
  ]);

  // Direct element references per row for complete keyboard navigation
  const inputRefs = useRef<{
    [rowId: string]: {
      title: HTMLInputElement | null;
      quantity: HTMLInputElement | null;
      price: HTMLInputElement | null;
      notes: HTMLInputElement | null;
    };
  }>({});

  const [pendingFocusRowId, setPendingFocusRowId] = useState<string | null>(null);

  // Auto-focus title input when a new row is requested
  useEffect(() => {
    if (pendingFocusRowId && inputRefs.current[pendingFocusRowId]?.title) {
      inputRefs.current[pendingFocusRowId].title?.focus();
      inputRefs.current[pendingFocusRowId].title?.select();
      setPendingFocusRowId(null);
    }
  }, [pendingFocusRowId, rows]);

  // Autofill customer on initial open if available
  useEffect(() => {
    if (currentCustomer && !customerName && currentOrderIndex === null) {
      setCustomerName(currentCustomer.name);
      setCustomerPhone(currentCustomer.phone);
      if (currentCustomer.address) setCustomerAddress(currentCustomer.address);
    }
  }, [currentCustomer, currentOrderIndex]);

  // Global Keyboard Shortcuts (F2 / Ctrl+Enter = A4 print, F4 = Thermal print)
  useEffect(() => {
    if (!isInvoiceCreatorOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F2 or Ctrl+Enter -> Print A4
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleSaveOrUpdate('a4');
      }
      // F4 -> Print Thermal
      if (e.key === 'F4') {
        e.preventDefault();
        handleSaveOrUpdate('thermal');
      }
      // Esc -> Close if no dropdown is active
      if (e.key === 'Escape') {
        const hasOpenCombo = rows.some((r) => r.isComboOpen);
        if (hasOpenCombo) {
          setRows((prev) => prev.map((r) => ({ ...r, isComboOpen: false })));
        } else {
          setIsInvoiceCreatorOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isInvoiceCreatorOpen, rows, customerName, customerPhone, deliveryFee, deliveryMethod, editingOrderId]);

  if (!isInvoiceCreatorOpen) return null;

  // Filter products for a specific row
  const getFilteredProducts = (query: string): Product[] => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return products.slice(0, 10);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
      .slice(0, 8);
  };

  // Select product into row and move keyboard focus to Quantity input
  const handleSelectProduct = (rowId: string, product: Product | 'custom', customTitle?: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          if (product === 'custom') {
            return {
              ...r,
              selectedProductId: 'custom',
              title: customTitle || r.title,
              isComboOpen: false,
              highlightedIndex: 0,
            };
          }
          return {
            ...r,
            selectedProductId: product.id,
            title: product.title,
            price: product.price,
            notes: product.warranty ? `${product.warranty} - ${product.condition}` : product.condition,
            isComboOpen: false,
            highlightedIndex: 0,
          };
        }
        return r;
      })
    );

    // Focus Quantity input immediately
    setTimeout(() => {
      inputRefs.current[rowId]?.quantity?.focus();
      inputRefs.current[rowId]?.quantity?.select();
    }, 40);
  };

  // Keyboard navigation inside Title ComboBox input
  const handleTitleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: InvoiceRow,
    filtered: Product[]
  ) => {
    // Arrow Down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!row.isComboOpen) {
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, isComboOpen: true, highlightedIndex: 0 } : r))
        );
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  highlightedIndex: Math.min(r.highlightedIndex + 1, filtered.length),
                }
              : r
          )
        );
      }
      return;
    }

    // Arrow Up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (row.isComboOpen) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  highlightedIndex: Math.max(r.highlightedIndex - 1, 0),
                }
              : r
          )
        );
      }
      return;
    }

    // Enter Key
    if (e.key === 'Enter') {
      e.preventDefault();
      if (row.isComboOpen && filtered.length > 0) {
        if (row.highlightedIndex < filtered.length) {
          // Select highlighted product
          handleSelectProduct(row.id, filtered[row.highlightedIndex]);
          return;
        } else {
          // Select custom item
          handleSelectProduct(row.id, 'custom');
          return;
        }
      }

      // If combo is closed or no results, close and jump to Quantity
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, isComboOpen: false } : r))
      );
      inputRefs.current[row.id]?.quantity?.focus();
      inputRefs.current[row.id]?.quantity?.select();
      return;
    }

    // Escape closes combo
    if (e.key === 'Escape') {
      e.preventDefault();
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, isComboOpen: false } : r))
      );
    }
  };

  // Keyboard navigation inside Quantity input -> Enter moves to Price
  const handleQuantityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRefs.current[rowId]?.price?.focus();
      inputRefs.current[rowId]?.price?.select();
    }
  };

  // Keyboard navigation inside Price input -> Enter moves to Notes
  const handlePriceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRefs.current[rowId]?.notes?.focus();
      inputRefs.current[rowId]?.notes?.select();
    }
  };

  // Keyboard navigation inside Notes input -> Enter adds NEW ROW and focuses its Title input!
  const handleNotesKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentRowIndex: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newRowId = 'row-' + Date.now();
      const newRow: InvoiceRow = {
        id: newRowId,
        title: '',
        price: 0,
        quantity: 1,
        notes: '',
        selectedProductId: 'custom',
        isComboOpen: true,
        highlightedIndex: 0,
      };

      setRows((prev) => {
        const copy = [...prev];
        copy.splice(currentRowIndex + 1, 0, newRow);
        return copy;
      });

      setPendingFocusRowId(newRowId);
    }
  };

  // Add row via button
  const handleAddRow = () => {
    const newRowId = 'row-' + Date.now();
    const newRow: InvoiceRow = {
      id: newRowId,
      title: '',
      price: 0,
      quantity: 1,
      notes: '',
      selectedProductId: 'custom',
      isComboOpen: true,
      highlightedIndex: 0,
    };
    setRows((prev) => [...prev, newRow]);
    setPendingFocusRowId(newRowId);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      showToast('يجب أن تحتوي الفاتورة على مادة واحدة على الأقل', 'error');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (
    rowId: string,
    field: keyof InvoiceRow,
    value: any
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const updated = {
            ...r,
            [field]:
              field === 'price' || field === 'quantity'
                ? Number(value) >= 0
                  ? Number(value)
                  : 0
                : value,
          };
          // If title changed, keep combo open and reset highlight
          if (field === 'title') {
            updated.isComboOpen = true;
            updated.highlightedIndex = 0;
          }
          return updated;
        }
        return r;
      })
    );
  };

  // Orders Navigation (الأول / السابق / التالي / الأخير)
  const loadOrderIntoForm = (order: Order, index: number) => {
    setCurrentOrderIndex(index);
    setEditingOrderId(order.id);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCustomerAddress(order.customerAddress || '');
    setDeliveryCompany(order.deliveryCompany || '');
    setDeliveryFee(order.deliveryFee);
    setDeliveryMethod(order.deliveryMethod);
    setInvoiceNotes(order.notes || '');

    if (order.items && order.items.length > 0) {
      setRows(
        order.items.map((i, idx) => ({
          id: `row-${idx}-${Date.now()}`,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes || i.condition || '',
          selectedProductId: i.id,
          isComboOpen: false,
          highlightedIndex: 0,
        }))
      );
    } else {
      setRows([
        {
          id: `row-${Date.now()}`,
          title: '',
          price: 0,
          quantity: 1,
          notes: '',
          selectedProductId: 'custom',
          isComboOpen: false,
          highlightedIndex: 0,
        },
      ]);
    }
    showToast(`فاتورة #${order.id}`);
  };

  const handleGoFirst = () => {
    if (orders.length === 0) return;
    loadOrderIntoForm(orders[0], 0);
  };

  const handleGoPrev = () => {
    if (orders.length === 0) return;
    if (currentOrderIndex === null) {
      loadOrderIntoForm(orders[orders.length - 1], orders.length - 1);
      return;
    }
    if (currentOrderIndex > 0) {
      const nextIdx = currentOrderIndex - 1;
      loadOrderIntoForm(orders[nextIdx], nextIdx);
    }
  };

  const handleGoNext = () => {
    if (orders.length === 0 || currentOrderIndex === null) return;
    if (currentOrderIndex < orders.length - 1) {
      const nextIdx = currentOrderIndex + 1;
      loadOrderIntoForm(orders[nextIdx], nextIdx);
    }
  };

  const handleGoLast = () => {
    if (orders.length === 0) return;
    loadOrderIntoForm(orders[orders.length - 1], orders.length - 1);
  };

  const handleStartNewInvoice = () => {
    setCurrentOrderIndex(null);
    setEditingOrderId(null);
    setCustomerName(currentCustomer ? currentCustomer.name : '');
    setCustomerPhone(currentCustomer ? currentCustomer.phone : '');
    setCustomerAddress(currentCustomer?.address || '');
    setDeliveryCompany('');
    setDeliveryFee(settings.defaultDeliveryFee || 5000);
    setDeliveryMethod('delivery');
    setInvoiceNotes('');
    const newId = 'row-' + Date.now();
    setRows([
      {
        id: newId,
        title: '',
        price: 0,
        quantity: 1,
        notes: '',
        selectedProductId: 'custom',
        isComboOpen: false,
        highlightedIndex: 0,
      },
    ]);
    setPendingFocusRowId(newId);
    showToast('فاتورة جديدة فارغة');
  };

  // Delete invoice (moves to trash)
  const handleDeleteInvoice = () => {
    if (!editingOrderId) return;
    const confirmMsg = `هل أنت متأكد من حذف الفاتورة رقم #${editingOrderId}؟\nسيتم نقلها إلى سلة المحذوفات وسيمكنك استرجاعها في أي وقت من لوحة الإدارة.`;
    if (window.confirm(confirmMsg)) {
      deleteOrder(editingOrderId);
      handleStartNewInvoice();
    }
  };

  // Hold / Suspend Invoice (تعليق الفاتورة)
  const handleHoldInvoice = () => {
    const validRows = rows.filter((r) => r.title.trim().length > 0);
    if (validRows.length === 0 && !customerName.trim()) {
      showToast('يرجى إدخال اسم مادة أو اسم زبون لتعليق الفاتورة', 'error');
      return;
    }

    const orderItems: OrderItem[] = validRows.map((r, idx) => ({
      id: r.selectedProductId && r.selectedProductId !== 'custom' ? r.selectedProductId : `item-${idx}-${Date.now()}`,
      title: r.title,
      price: r.price,
      quantity: r.quantity,
      notes: r.notes.trim() || undefined,
      totalPrice: r.price * r.quantity,
      condition: 'أصلي معتمد',
      type: 'custom',
    }));

    suspendInvoice({
      customerName: customerName.trim() || 'زبون عام (بدون اسم)',
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      deliveryCompany: deliveryCompany.trim(),
      deliveryFee: activeDeliveryFee,
      deliveryMethod,
      items: orderItems,
      subtotal,
      total: grandTotal,
      notes: invoiceNotes.trim(),
    });

    handleStartNewInvoice();
  };

  // Resume Suspended Invoice (استرجاع الفاتورة المعلقة)
  const handleResumeSuspended = (suspendedId: string) => {
    const held = resumeSuspendedInvoice(suspendedId);
    if (held) {
      setCurrentOrderIndex(null);
      setEditingOrderId(null);
      setCustomerName(held.customerName || '');
      setCustomerPhone(held.customerPhone || '');
      setCustomerAddress(held.customerAddress || '');
      setDeliveryCompany(held.deliveryCompany || '');
      setDeliveryFee(held.deliveryFee || 0);
      setDeliveryMethod(held.deliveryMethod || 'delivery');
      setInvoiceNotes(held.notes || '');

      if (held.items && held.items.length > 0) {
        setRows(
          held.items.map((i, idx) => ({
            id: `row-${idx}-${Date.now()}`,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            notes: i.notes || i.condition || '',
            selectedProductId: i.id,
            isComboOpen: false,
            highlightedIndex: 0,
          }))
        );
      }
      setIsSuspendedModalOpen(false);
    }
  };

  // Calculations
  const subtotal = rows.reduce((sum, r) => sum + r.price * r.quantity, 0);
  const activeDeliveryFee = deliveryMethod === 'delivery' ? Number(deliveryFee) || 0 : 0;
  const grandTotal = subtotal + activeDeliveryFee;

  // Save / Print
  const handleSaveOrUpdate = (printFormat?: 'a4' | 'thermal') => {
    if (!customerName.trim()) {
      showToast('يرجى كتابة اسم الزبون', 'error');
      return;
    }

    const validRows = rows.filter((r) => r.title.trim().length > 0);
    if (validRows.length === 0) {
      showToast('يرجى كتابة أو اختيار اسم مادة واحدة على الأقل', 'error');
      return;
    }

    const orderItems: OrderItem[] = validRows.map((r, idx) => ({
      id: r.selectedProductId && r.selectedProductId !== 'custom' ? r.selectedProductId : `item-${idx}-${Date.now()}`,
      title: r.title,
      price: r.price,
      quantity: r.quantity,
      notes: r.notes.trim() || undefined,
      totalPrice: r.price * r.quantity,
      condition: 'أصلي معتمد',
      type: 'custom',
    }));

    if (editingOrderId) {
      updateOrder(editingOrderId, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || '07700000000',
        customerAddress: customerAddress.trim() || 'استلام مباشر',
        deliveryCompany: deliveryCompany || (deliveryMethod === 'delivery' ? 'شركة التوصيل السريع' : 'استلام من المحل'),
        deliveryFee: activeDeliveryFee,
        deliveryMethod,
        subtotal,
        total: grandTotal,
        items: orderItems,
        notes: invoiceNotes.trim() || undefined,
      });

      const updatedOrder: Order = {
        id: editingOrderId,
        orderType: 'custom_invoice',
        items: orderItems,
        subtotal,
        deliveryFee: activeDeliveryFee,
        total: grandTotal,
        deliveryMethod,
        deliveryCompany: deliveryCompany || 'شركة التوصيل',
        customerName,
        customerPhone,
        customerAddress,
        notes: invoiceNotes,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'completed',
      };

      if (printFormat) {
        setIsInvoiceCreatorOpen(false);
        openInvoice({ type: 'order', data: updatedOrder }, printFormat);
      } else {
        showToast(`تم حفظ تعديلات الفاتورة #${editingOrderId}`);
      }
      return;
    }

    const newOrder = addOrder({
      orderType: 'custom_invoice',
      items: orderItems,
      subtotal,
      deliveryFee: activeDeliveryFee,
      total: grandTotal,
      deliveryMethod,
      deliveryCompany:
        deliveryCompany ||
        (deliveryMethod === 'delivery' ? 'شركة التوصيل السريع' : 'استلام من المحل'),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '07700000000',
      customerAddress:
        customerAddress.trim() ||
        (deliveryMethod === 'delivery' ? 'بغداد' : 'استلام مباشر من الفرع'),
      notes: invoiceNotes.trim() || undefined,
    });

    setIsInvoiceCreatorOpen(false);

    if (printFormat) {
      openInvoice({ type: 'order', data: newOrder }, printFormat);
    } else {
      openInvoice({ type: 'order', data: newOrder }, 'a4');
    }

    showToast(`تم حفظ وإصدار الفاتورة رقم #${newOrder.id}`);
  };

  const handleSendWhatsApp = () => {
    if (!customerName.trim()) {
      showToast('يرجى إدخال اسم الزبون', 'error');
      return;
    }

    const itemsText = rows
      .map(
        (r, idx) =>
          `${idx + 1}. *${r.title}*\n   - الكمية: ${r.quantity}\n   - سعر المفرد: ${formatPrice(
            r.price
          )}\n   - السعر الكلي: ${formatPrice(r.price * r.quantity)}${
            r.notes ? `\n   - الملاحظات: ${r.notes}` : ''
          }`
      )
      .join('\n\n');

    const msg = `📄 *فاتورة مبيعات - ${settings.storeName}*\n${
      editingOrderId ? `رقم الفاتورة: *#${editingOrderId}*\n` : ''
    }\n👤 *بيانات الزبون:*\n- اسم الزبون: *${customerName}*\n- رقم الهاتف: *${customerPhone}*\n- العنوان: *${
      customerAddress || 'بغداد'
    }*\n${
      deliveryCompany ? `- اسم التوصيل: *${deliveryCompany}*\n` : ''
    }- أجور التوصيل: *${formatPrice(
      activeDeliveryFee
    )}*\n\n📦 *المواد والبنود:*\n${itemsText}\n\n━━━━━━━━━━━━━━━━━━━━\n💰 *المبلغ الكلي للفاتورة:* *${formatPrice(
      grandTotal
    )}*\n━━━━━━━━━━━━━━━━━━━━${
      invoiceNotes ? `\n\n📝 *ملاحظات:* ${invoiceNotes}` : ''
    }\n\n📍 ${settings.city} - ${settings.address}\n📞 هاتف: ${settings.phone}`;

    const targetPhone = customerPhone.replace(/\D/g, '') || settings.whatsapp;
    window.open(
      `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-h-[96vh] flex flex-col text-right"
        onClick={(e) => {
          e.stopPropagation();
          setRows((prev) => prev.map((r) => ({ ...r, isComboOpen: false })));
        }}
      >
        {/* ========================================================================= */}
        {/* TOP BAR: Title + Record Navigation + Keyboard Guide */}
        {/* ========================================================================= */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/95 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>كاشير الفواتير والمبيعات السريع</span>
                {editingOrderId ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    فاتورة #{editingOrderId}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    فاتورة جديدة
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* RECORD NAVIGATION: الأول / السابق / التالي / الأخير */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={handleGoFirst}
              disabled={orders.length === 0}
              className="px-2 py-1 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
              title="الانتقال إلى أول فاتورة"
            >
              <ChevronsRight className="w-3.5 h-3.5 text-amber-400" />
              <span>الأول</span>
            </button>

            <button
              type="button"
              onClick={handleGoPrev}
              disabled={orders.length === 0 || currentOrderIndex === 0}
              className="px-2 py-1 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
              title="الفاتورة السابقة"
            >
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              <span>السابق</span>
            </button>

            <div className="px-2 text-[11px] font-mono font-bold text-amber-300">
              {currentOrderIndex !== null ? (
                <span>
                  {currentOrderIndex + 1} / {orders.length}
                </span>
              ) : (
                <span>جديدة</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoNext}
              disabled={
                orders.length === 0 ||
                currentOrderIndex === null ||
                currentOrderIndex === orders.length - 1
              }
              className="px-2 py-1 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
              title="الفاتورة التالية"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleGoLast}
              disabled={orders.length === 0}
              className="px-2 py-1 text-xs font-bold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
              title="الانتقال إلى آخر فاتورة"
            >
              <span>الأخير</span>
              <ChevronsLeft className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleStartNewInvoice}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1 transition-colors cursor-pointer mr-1"
              title="فاتورة جديدة فارغة"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>فاتورة جديدة</span>
            </button>
          </div>

          {/* ACTIONS: تعليق الفاتورة + الفواتير المعلقة + حذف الفاتورة */}
          <div className="flex items-center gap-1.5">
            {/* Button: تعليق الفاتورة (Hold) */}
            <button
              type="button"
              onClick={handleHoldInvoice}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/50 flex items-center gap-1 transition-colors cursor-pointer"
              title="تعليق هذه الفاتورة مؤقتاً لخدمة زبون آخر"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تعليق الفاتورة</span>
            </button>

            {/* Button: الفواتير المعلقة */}
            <button
              type="button"
              onClick={() => setIsSuspendedModalOpen(true)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1 transition-colors cursor-pointer"
              title="عرض واسترجاع الفواتير المعلقة"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>المعلقات ({suspendedInvoices.length})</span>
            </button>

            {/* Button: حذف الفاتورة (if editing an existing recorded invoice) */}
            {editingOrderId && (
              <button
                type="button"
                onClick={handleDeleteInvoice}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                title="حذف هذه الفاتورة ونقلها إلى سلة المحذوفات"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">حذف الفاتورة</span>
              </button>
            )}
          </div>

          {/* Live Date and Time Clock */}
          {liveClock.date && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{liveClock.date} • {liveClock.time}</span>
            </div>
          )}

          <button
            onClick={() => setIsInvoiceCreatorOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {/* ========================================================================= */}
          {/* COMPACT HEADER SECTION: بيانات رأس الفاتورة المصغرة */}
          {/* ========================================================================= */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-right">
              {/* 1. اسم الزبون */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-amber-400 truncate">
                  اسم الزبون *
                </label>
                <input
                  type="text"
                  required
                  placeholder="اسم العميل..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 2. رقم الهاتف */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-slate-300 truncate">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="0770..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono text-left"
                />
              </div>

              {/* 3. العنوان */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-slate-300 truncate">
                  العنوان (النوان)
                </label>
                <input
                  type="text"
                  placeholder="المنطقة - الشارع..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4. اسم التوصيل */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-slate-300 truncate">
                  اسم التوصيل / المندوب
                </label>
                <input
                  type="text"
                  placeholder="شركة الشحن..."
                  value={deliveryCompany}
                  onChange={(e) => setDeliveryCompany(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 5. مبلغ التوصيل */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-slate-300 truncate">
                  مبلغ التوصيل ({settings.currency === 'USD' ? '$' : 'د.ع'})
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  disabled={deliveryMethod === 'pickup'}
                  value={deliveryMethod === 'pickup' ? 0 : deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs font-mono font-bold bg-slate-900 border border-slate-700/80 rounded-lg text-amber-400 text-left focus:outline-none focus:border-amber-400 disabled:opacity-40"
                />
              </div>

              {/* 6. طريقة الاستلام */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-slate-300 truncate">
                  طريقة الاستلام
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white cursor-pointer focus:outline-none focus:border-amber-400"
                >
                  <option value="delivery">توصيل دليفري</option>
                  <option value="pickup">استلام محل (0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: ITEMS TABLE - DIRECT TYPING COMBOBOX + KEYBOARD NAVIGATION */}
          {/* تسلسل: اسم المادة (اكتب مباشرة وتظهر) -> الكمية -> سعر الفرد -> السعر الكلي -> الملاحظات */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  جدول المواد (اكتب مباشرة وتظهر الخيارات تلقائياً، والأسهم للتحديد):
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة مادة</span>
              </button>
            </div>

            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-400 text-right">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">1. اسم المادة (كوبو بوكس تفاعلي مباشر)</div>
              <div className="col-span-2 text-center">2. الكمية</div>
              <div className="col-span-2 text-left">3. سعر الفرد</div>
              <div className="col-span-1 text-left">4. السعر الكلي</div>
              <div className="col-span-2">5. الملاحظات (Enter يفتح بند جديد)</div>
            </div>

            {/* Rows List */}
            <div className="space-y-2">
              {rows.map((row, idx) => {
                const rowTotal = row.price * row.quantity;
                const filteredProducts = getFilteredProducts(row.title);

                return (
                  <div
                    key={row.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-colors"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
                      {/* Row Index & Mobile Delete */}
                      <div className="lg:col-span-1 flex items-center justify-between lg:justify-center gap-1">
                        <span className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="lg:hidden p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                          title="حذف البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 1. DIRECT-TYPING COMBOBOX FOR MATERIAL NAME */}
                      <div className="lg:col-span-4 relative">
                        <label className="lg:hidden block text-[10px] font-bold text-amber-400 mb-0.5">
                          1. اسم المادة (اكتب مباشرة وتظهر الخيارات):
                        </label>

                        <div className="relative">
                          {/* Direct Input */}
                          <input
                            type="text"
                            ref={(el) => {
                              if (!inputRefs.current[row.id]) {
                                inputRefs.current[row.id] = {
                                  title: null,
                                  quantity: null,
                                  price: null,
                                  notes: null,
                                };
                              }
                              inputRefs.current[row.id].title = el;
                            }}
                            placeholder="اكتب اسم المادة، الشاشة، الشاحن، أو القطعة..."
                            value={row.title}
                            onFocus={() => {
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === row.id
                                    ? { ...r, isComboOpen: true, highlightedIndex: 0 }
                                    : { ...r, isComboOpen: false }
                                )
                              );
                            }}
                            onChange={(e) => handleRowChange(row.id, 'title', e.target.value)}
                            onKeyDown={(e) => handleTitleKeyDown(e, row, filteredProducts)}
                            className="w-full pr-2.5 pl-7 py-1 text-xs bg-slate-900 border border-amber-500/50 hover:border-amber-400 focus:border-amber-400 rounded-lg text-white font-medium placeholder:text-slate-500 focus:outline-none shadow-inner"
                          />

                          {/* Quick open icon indicator */}
                          <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer pointer-events-none"
                            title="اكتب أو استخدم الأسهم"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                          </div>

                          {/* LIVE AUTOCOMPLETE DROPDOWN POPOVER */}
                          {row.isComboOpen && (
                            <div
                              className="absolute top-full right-0 left-0 mt-1 z-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col text-right animate-in fade-in duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-1.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1 font-semibold text-amber-400">
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  <span>الخيارات المطابقة لما كتبت:</span>
                                </span>
                                <span>استخدم الأسهم ثم اضغط Enter</span>
                              </div>

                              <div className="overflow-y-auto p-1 space-y-0.5 flex-1 max-h-48">
                                {/* Option to use custom typed text */}
                                {row.title.trim().length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectProduct(row.id, 'custom')}
                                    className={`w-full p-1.5 rounded-lg text-right text-xs transition-colors flex items-center justify-between cursor-pointer border border-dashed border-amber-500/30 ${
                                      row.highlightedIndex === filteredProducts.length
                                        ? 'bg-amber-400/20 text-amber-300 font-bold'
                                        : 'text-amber-300 hover:bg-amber-400/10'
                                    }`}
                                  >
                                    <span>➕ اعتماد المادة المخصصة: &quot;{row.title}&quot;</span>
                                    <span className="text-[10px] text-slate-400 font-mono">يدوي</span>
                                  </button>
                                )}

                                {/* Matching Products */}
                                {filteredProducts.map((p, pIdx) => {
                                  const cat = categories.find((c) => c.id === p.categoryId);
                                  const isHighlighted = row.highlightedIndex === pIdx;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => handleSelectProduct(row.id, p)}
                                      className={`w-full p-1.5 rounded-lg text-right text-xs transition-colors flex items-center justify-between gap-1 cursor-pointer ${
                                        isHighlighted
                                          ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                                          : 'hover:bg-slate-800 text-slate-200'
                                      }`}
                                    >
                                      <div className="truncate text-right">
                                        <div className="font-semibold truncate">{p.title}</div>
                                        <div
                                          className={`text-[9px] ${
                                            isHighlighted ? 'text-slate-900 font-medium' : 'text-slate-400'
                                          }`}
                                        >
                                          {cat?.name || 'عام'} • {p.brand} • {p.condition}
                                        </div>
                                      </div>
                                      <span
                                        className={`font-mono font-bold text-xs shrink-0 ${
                                          isHighlighted ? 'text-slate-950' : 'text-amber-400'
                                        }`}
                                      >
                                        {formatPrice(p.price)}
                                      </span>
                                    </button>
                                  );
                                })}

                                {filteredProducts.length === 0 && (
                                  <div className="p-2 text-center text-xs text-slate-400">
                                    لا توجد مادة بهذا الاسم في المتجر، اضغط Enter لاعتمادها كمادة جديدة يدوياً.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. الكمية (Quantity) */}
                      <div className="lg:col-span-2 space-y-0.5">
                        <label className="lg:hidden block text-[10px] font-bold text-slate-300">
                          2. الكمية:
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleRowChange(
                                row.id,
                                'quantity',
                                Math.max(1, row.quantity - 1)
                              )
                            }
                            className="w-7 h-7 rounded-r-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            ref={(el) => {
                              if (!inputRefs.current[row.id]) {
                                inputRefs.current[row.id] = {
                                  title: null,
                                  quantity: null,
                                  price: null,
                                  notes: null,
                                };
                              }
                              inputRefs.current[row.id].quantity = el;
                            }}
                            value={row.quantity}
                            onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                            onKeyDown={(e) => handleQuantityKeyDown(e, row.id)}
                            className="w-full h-7 text-center font-mono font-bold text-xs bg-slate-900 border-y border-slate-700 text-white focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRowChange(row.id, 'quantity', row.quantity + 1)
                            }
                            className="w-7 h-7 rounded-l-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 3. سعر الفرد (Unit Price) */}
                      <div className="lg:col-span-2 space-y-0.5">
                        <label className="lg:hidden block text-[10px] font-bold text-slate-300">
                          3. سعر الفرد:
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          ref={(el) => {
                            if (!inputRefs.current[row.id]) {
                              inputRefs.current[row.id] = {
                                title: null,
                                quantity: null,
                                price: null,
                                notes: null,
                              };
                            }
                            inputRefs.current[row.id].price = el;
                          }}
                          value={row.price}
                          onChange={(e) => handleRowChange(row.id, 'price', e.target.value)}
                          onKeyDown={(e) => handlePriceKeyDown(e, row.id)}
                          className="w-full h-7 px-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-amber-400 text-left focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* 4. السعر الكلي (Total Line Price = Quantity * Price) */}
                      <div className="lg:col-span-1 space-y-0.5">
                        <label className="lg:hidden block text-[10px] font-bold text-slate-300">
                          4. السعر الكلي:
                        </label>
                        <div className="h-7 px-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                          {formatPrice(rowTotal)}
                        </div>
                      </div>

                      {/* 5. الملاحظات (Item Notes with Enter to Add Next Row) */}
                      <div className="lg:col-span-2 space-y-0.5 flex items-center gap-1">
                        <div className="flex-1">
                          <label className="lg:hidden block text-[10px] font-bold text-slate-300">
                            5. الملاحظات (اضغط Enter لفتح بند جديد):
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              ref={(el) => {
                                if (!inputRefs.current[row.id]) {
                                inputRefs.current[row.id] = {
                                  title: null,
                                  quantity: null,
                                  price: null,
                                  notes: null,
                                };
                              }
                              inputRefs.current[row.id].notes = el;
                            }}
                            placeholder="ضمان، لون... (Enter ⏎)"
                            value={row.notes}
                            onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                            onKeyDown={(e) => handleNotesKeyDown(e, idx)}
                            className="w-full h-7 pl-6 pr-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                          <CornerDownLeft className="w-3 h-3 text-slate-500 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Desktop Delete Row Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0 cursor-pointer"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: INVOICE SUMMARY & GENERAL NOTES */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start pt-1">
          {/* General Invoice Notes */}
          <div className="md:col-span-6 space-y-1">
            <label className="block text-xs font-bold text-slate-300">
              ملاحظات عامة وشروط الفاتورة (تظهر أسفل الوصل المطبوع):
            </label>
            <textarea
              rows={2}
              placeholder="مثال: تم فحص الجهاز والشاشة أمام الزبون في ورشة مصطفى كطان، ضمان 6 أشهر..."
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Financial Summary Card */}
          <div className="md:col-span-6 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>مجموع المواد ({rows.length} مواد):</span>
              <span className="font-mono text-slate-200 font-bold">{formatPrice(subtotal)}</span>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="flex justify-between text-slate-400">
                <span>مبلغ التوصيل ({deliveryCompany || 'توصيل'}):</span>
                <span className="font-mono text-slate-200 font-bold">
                  {formatPrice(activeDeliveryFee)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1.5 border-t border-amber-500/30">
              <span>المبلغ الكلي للفاتورة:</span>
              <span className="font-mono text-amber-400 text-base sm:text-lg font-black">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/95 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>إرسال واتساب</span>
        </button>

        <div className="flex items-center gap-2">
          {editingOrderId && (
            <button
              type="button"
              onClick={() => handleSaveOrUpdate()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer border border-slate-700"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>حفظ التعديلات</span>
            </button>
          )}

          {/* Print A4 */}
          <button
            type="button"
            onClick={() => handleSaveOrUpdate('a4')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            title="حفظ وطباعة A4 (أو اضغط F2)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{editingOrderId ? 'طباعة A4' : 'حفظ وطباعة A4 (F2)'}</span>
          </button>

          {/* Print Thermal */}
          <button
            type="button"
            onClick={() => handleSaveOrUpdate('thermal')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
            title="حفظ وطباعة وصل حراري 80mm (أو اضغط F4)"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{editingOrderId ? 'طباعة حرارية (80mm)' : 'حفظ وطباعة حرارية (F4)'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
