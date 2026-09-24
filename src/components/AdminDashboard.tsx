import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, MaintenanceRequest, MaintenanceStatus, Order } from '../types/store';
import { readImageFileAsDataUrl } from '../utils/imageUpload';
import {
  Package,
  Layers,
  Wrench,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  Clock,
  PhoneCall,
  Save,
  RotateCcw,
  Receipt,
  Printer,
  Upload,
  Image as ImageIcon,
  Building,
  Truck,
  Mail,
  User,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  Eye,
  DollarSign,
  Archive,
} from 'lucide-react';
import { printElement } from '../utils/print';
import heroImage from '../assets/images/hero_mustafa_mobile_1790283206648.jpg';
import repairLabImage from '../assets/images/phone_repair_lab_1790283219078.jpg';
import accessoriesImage from '../assets/images/accessories_screens_1790283229255.jpg';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    maintenanceRequests,
    orders,
    customers,
    settings,
    visitorCount,
    trashRecords,
    restoreFromTrash,
    permanentlyDeleteTrash,
    emptyTrash,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addMaintenanceRequest,
    updateMaintenanceStatus,
    deleteMaintenanceRequest,
    deleteOrder,
    updateOrderStatus,
    updateSettings,
    formatPrice,
    openInvoice,
    setIsInvoiceCreatorOpen,
    resetToDefaults,
    showToast,
  } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'products' | 'categories' | 'maintenance' | 'orders' | 'reports' | 'settings' | 'trash'
  >('products');

  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');

  // File input refs for uploading from device
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    title: '',
    categoryId: categories[0]?.id || 'cat-phones',
    brand: 'Apple',
    price: 50000,
    originalPrice: 0,
    stock: 10,
    image: accessoriesImage,
    description: '',
    warranty: 'ضمان سنة كاملة',
    condition: 'جديد بالكرتون',
    features: ['مواصفات ممتازة', 'ضمان وكالة معتمد'],
  });

  // Category modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    iconName: 'Smartphone',
  });

  // Maintenance walk-in modal
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    issueCategory: 'شاشة مكسورة / عرض' as MaintenanceRequest['issueCategory'],
    issueDetails: '',
    priority: 'عادي' as MaintenanceRequest['priority'],
    estimatedCost: 50000,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // Search filters inside admin
  const [prodSearch, setProdSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Handle uploading product image directly from device
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('جاري قراءة وضبط حجم الصورة من جهازك...', 'info');
      const dataUrl = await readImageFileAsDataUrl(file, 1000, 1000, 0.85);
      setProductForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('تم رفع صورة المنتج من جهازك بنجاح!');
    } catch (err: any) {
      showToast(err?.message || 'فشل رفع الصورة', 'error');
    }
  };

  // Handle uploading store company logo from device
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('جاري رفع شعار الشركة من جهازك...', 'info');
      const dataUrl = await readImageFileAsDataUrl(file, 600, 600, 0.9);
      setSettingsForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      updateSettings({ logoUrl: dataUrl });
      showToast('تم تحديث شعار وصورة الشركة بنجاح!');
    } catch (err: any) {
      showToast(err?.message || 'فشل رفع الشعار', 'error');
    }
  };

  // Sample preset images for quick selection
  const presetImages = [
    { label: 'صورة المعرض والهواتف', url: heroImage },
    { label: 'شاشات ومختبر الصيانة', url: repairLabImage },
    { label: 'شواحن وكوابل وإكسسوارات', url: accessoriesImage },
    {
      label: 'آيفون 15 برو ماكس',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'سامسونج S24 ألترا',
      url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Open product modal for add
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      categoryId: categories[0]?.id || 'cat-phones',
      brand: 'Apple',
      price: 50000,
      originalPrice: 0,
      stock: 10,
      image: accessoriesImage,
      description: 'وصف ومواصفات المنتج الأصلي...',
      warranty: 'ضمان وكالة رسمي',
      condition: 'جديد بالكرتون',
      features: ['كفالة حقيقية', 'فحص واختبار كامل'],
    });
    setIsProductModalOpen(true);
  };

  // Open product modal for edit
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title,
      categoryId: prod.categoryId,
      brand: prod.brand,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      stock: prod.stock,
      image: prod.image,
      description: prod.description,
      warranty: prod.warranty,
      condition: prod.condition,
      features: prod.features || [],
    });
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      alert('يرجى إدخال عنوان المنتج');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    const slug = catForm.name.toLowerCase().replace(/\s+/g, '-');
    addCategory({
      name: catForm.name,
      slug,
      iconName: catForm.iconName,
      description: catForm.description || 'قسم مميز لمنتجات وقطع وإكسسوارات المتجر',
    });
    setCatForm({ name: '', description: '', iconName: 'Smartphone' });
    setIsCatModalOpen(false);
  };

  // Save walk-in maintenance
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceForm.customerName || !maintenanceForm.customerPhone || !maintenanceForm.deviceModel) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    addMaintenanceRequest({
      ...maintenanceForm,
      issueDetails: maintenanceForm.issueDetails || 'استلام مباشر في ورشة مصطفى كطان',
      technicianNotes: 'تم استلام الجهاز يدوياً داخل المحل والبدء بإجراءات الفحص المخبري.',
    });
    setIsMaintenanceModalOpen(false);
  };

  // Save store settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  const filteredAdminProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredAdminTickets = maintenanceRequests.filter(
    (t) =>
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.customerPhone.includes(ticketSearch) ||
      t.deviceModel.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch)
  );

  // Helper to filter dates for reports (اليومي / الأسبوعي / الشهري / الكل)
  const isDateInPeriod = (dateStr?: string, period: 'daily' | 'weekly' | 'monthly' | 'all' = 'daily') => {
    if (period === 'all') return true;
    if (!dateStr) return true;

    const today = new Date();
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return true;

    if (period === 'daily') {
      const todayIso = today.toISOString().split('T')[0];
      return dateStr === todayIso || target.toDateString() === today.toDateString();
    }

    if (period === 'weekly') {
      const diffMs = today.getTime() - target.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= -1 && diffDays <= 7;
    }

    if (period === 'monthly') {
      return (
        target.getMonth() === today.getMonth() &&
        target.getFullYear() === today.getFullYear()
      );
    }

    return true;
  };

  const reportOrders = orders.filter((o) => isDateInPeriod(o.createdAt, reportPeriod));
  const reportTickets = maintenanceRequests.filter((t) => isDateInPeriod(t.receivedDate, reportPeriod));

  const totalPeriodRevenue = reportOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPeriodMaintenanceValue = reportTickets.reduce((sum, t) => sum + t.estimatedCost, 0);
  const totalPeriodInvoices = reportOrders.length;
  const avgOrderValue = totalPeriodInvoices > 0 ? Math.round(totalPeriodRevenue / totalPeriodInvoices) : 0;

  // Approximate visitors count for selected period
  const periodVisitorCount =
    reportPeriod === 'daily'
      ? Math.max(34, Math.round(visitorCount * 0.12))
      : reportPeriod === 'weekly'
      ? Math.max(180, Math.round(visitorCount * 0.48))
      : visitorCount;

  // Top sold items for this period
  const itemSalesMap: { [title: string]: { count: number; revenue: number } } = {};
  reportOrders.forEach((o) => {
    o.items?.forEach((it) => {
      if (!itemSalesMap[it.title]) {
        itemSalesMap[it.title] = { count: 0, revenue: 0 };
      }
      itemSalesMap[it.title].count += it.quantity;
      itemSalesMap[it.title].revenue += it.price * it.quantity;
    });
  });

  const topSoldItems = Object.entries(itemSalesMap)
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="py-8 bg-slate-950 min-h-screen text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            {settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-14 h-14 object-contain rounded-2xl bg-slate-900 border border-slate-800 p-1 shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>لوحة الإدارة والتحكم الشاملة</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                إدارة {settings.storeName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                تعديل اسم وشعار الشركة، إضافة الأقسام والمنتجات، رفع الصور من الجهاز، وطباعة الفواتير
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>زوار الموقع</span>
              </div>
              <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                {visitorCount.toLocaleString()}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">المنتجات</div>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {products.length}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">الفواتير والمبيعات</div>
              <div className="text-base font-bold text-blue-400 font-mono tabular-nums">
                {orders.length}
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">طلبات الصيانة</div>
              <div className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                {maintenanceRequests.length}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'reports'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-amber-500/30 bg-amber-500/10'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>📊 التقارير والإحصائيات (يومي / أسبوعي / شهري)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('products')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'products'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والقطع ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('categories')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'categories'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام (إضافة قسم جديد) ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>الفواتير والطباعة (A4 / حراري) ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('maintenance')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'maintenance'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>سجل وتذاكر الصيانة ({maintenanceRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'settings'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>اسم وشعار الشركة والتوصيل</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('trash')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminTab === 'trash'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>المحذوفات ({trashRecords.length})</span>
          </button>

        </div>

        {/* ========================================================================= */}
        {/* TAB 0: COMPREHENSIVE REPORTS & ANALYTICS (DAILY / WEEKLY / MONTHLY)        */}
        {/* ========================================================================= */}
        {activeAdminTab === 'reports' && (
          <div id="financial-report" className="space-y-6">
            {/* Top Period Selector Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white">اختر فترة التقرير:</span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReportPeriod('daily')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reportPeriod === 'daily'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📅 تقرير اليوم (Daily)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPeriod('weekly')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reportPeriod === 'weekly'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📊 هذا الأسبوع (Weekly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPeriod('monthly')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reportPeriod === 'monthly'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗓️ هذا الشهر (Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPeriod('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reportPeriod === 'all'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 جميع الفترات
                  </button>
                </div>
              </div>

              {/* Print Report Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!printElement('financial-report', 'التقرير المالي والإحصائي')) {
                      showToast('يرجى السماح بفتح نافذة الطباعة من المتصفح.', 'error');
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>طباعة التقرير المالي والإحصائي</span>
                </button>
              </div>
            </div>

            {/* Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* 1. إجمالي المبيعات */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>إجمالي المبيعات</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-black text-amber-400 font-mono tabular-nums">
                  {formatPrice(totalPeriodRevenue)}
                </div>
                <p className="text-[10px] text-slate-500">
                  {reportPeriod === 'daily'
                    ? 'مبيعات وفواتير اليوم'
                    : reportPeriod === 'weekly'
                    ? 'إجمالي الـ 7 أيام الأخيرة'
                    : 'إجمالي الشهر الحالي'}
                </p>
              </div>

              {/* 2. عدد الفواتير */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>عدد الفواتير</span>
                  <Receipt className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-black text-white font-mono tabular-nums">
                  {totalPeriodInvoices} فاتورة
                </div>
                <p className="text-[10px] text-slate-500">طلبات شراء وقطع غيار</p>
              </div>

              {/* 3. طلبات الصيانة */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>طلبات الصيانة والشاشات</span>
                  <Wrench className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                  {reportTickets.length} أجهزة
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  بقيمة تقديرية: {formatPrice(totalPeriodMaintenanceValue)}
                </p>
              </div>

              {/* 4. زوار الموقع */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>زوار الموقع للمدة</span>
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-black text-purple-300 font-mono tabular-nums">
                  {periodVisitorCount.toLocaleString()} زائر
                </div>
                <p className="text-[10px] text-slate-500">تفاعل وتصفح المنتجات</p>
              </div>

              {/* 5. متوسط الفاتورة */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>متوسط قيمة الفاتورة</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-black text-cyan-300 font-mono tabular-nums">
                  {formatPrice(avgOrderValue)}
                </div>
                <p className="text-[10px] text-slate-500">لكل زبون / معاملة</p>
              </div>
            </div>

            {/* Split Section: Top Selling Items + Maintenance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Selling Items & Parts */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>المواد والشاشات والقطع الأكثر طلباً ومبيعاً ({reportPeriod})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">مرتبة حسب الإيراد والعدد</span>
                </div>

                {topSoldItems.length > 0 ? (
                  <div className="space-y-2.5">
                    {topSoldItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white truncate max-w-xs">{item.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              تم بيع وتجهيز: <span className="text-amber-300 font-mono font-bold">{item.count}</span> قطع
                            </div>
                          </div>
                        </div>

                        <div className="text-left font-mono font-bold text-emerald-400 text-sm">
                          {formatPrice(item.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    لا توجد مبيعات مسجلة في هذه الفترة المحددة، يمكنك إنشاء فواتير من الكاشير السريع.
                  </div>
                )}
              </div>

              {/* Maintenance Status Breakdown */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>حالة طلبات الصيانة والفحص المخبري</span>
                  </h4>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'جاهز للاستلام والتسليم',
                      status: 'ready',
                      color: 'bg-emerald-500',
                      textColor: 'text-emerald-400',
                    },
                    {
                      label: 'جاري الصيانة والتبديل',
                      status: 'repairing',
                      color: 'bg-amber-500',
                      textColor: 'text-amber-400',
                    },
                    {
                      label: 'قيد الفحص المخبري',
                      status: 'diagnosing',
                      color: 'bg-blue-500',
                      textColor: 'text-blue-400',
                    },
                    {
                      label: 'تم التسليم للزبون',
                      status: 'delivered',
                      color: 'bg-purple-500',
                      textColor: 'text-purple-400',
                    },
                  ].map((st) => {
                    const count = reportTickets.filter((t) => t.status === st.status).length;
                    const percent =
                      reportTickets.length > 0 ? Math.round((count / reportTickets.length) * 100) : 0;
                    return (
                      <div key={st.status} className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-300">{st.label}</span>
                          <span className={`font-mono font-bold ${st.textColor}`}>
                            {count} جهاز ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full ${st.color} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Invoices Detailed Log for the Selected Period */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>تفاصيل فواتير الفترة ({reportOrders.length} فاتورة)</span>
                </h4>
                <div className="text-xs font-mono font-bold text-amber-400">
                  المجموع: {formatPrice(totalPeriodRevenue)}
                </div>
              </div>

              {reportOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">الزبون</th>
                        <th className="p-3">المواد والقطع</th>
                        <th className="p-3">التوصيل</th>
                        <th className="p-3 text-left">المبلغ الإجمالي</th>
                        <th className="p-3 text-center">الطباعة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reportOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-400">#{ord.id}</td>
                          <td className="p-3 font-mono text-slate-400">{ord.createdAt}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{ord.customerName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{ord.customerPhone}</div>
                          </td>
                          <td className="p-3">
                            <div className="truncate max-w-xs text-slate-300">
                              {ord.items?.map((i) => `${i.title} (${i.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {ord.deliveryFee > 0 ? formatPrice(ord.deliveryFee) : 'استلام محل'}
                          </td>
                          <td className="p-3 text-left font-mono font-bold text-amber-400 text-sm">
                            {formatPrice(ord.total)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openInvoice({ type: 'order', data: ord }, 'a4')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                              >
                                A4
                              </button>
                              <button
                                type="button"
                                onClick={() => openInvoice({ type: 'order', data: ord }, 'thermal')}
                                className="px-2 py-1 rounded bg-amber-400 text-slate-950 text-[10px] font-black"
                              >
                                حراري
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  لا توجد فواتير صادرة في هذه الفترة المحددة.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeAdminTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في المنتجات..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج أو قطعة جديدة</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-right">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3.5">المنتج والصورة</th>
                      <th className="p-3.5">القسم</th>
                      <th className="p-3.5">الماركة</th>
                      <th className="p-3.5">السعر</th>
                      <th className="p-3.5">المخزون</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAdminProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.categoryId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1 border border-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-xs">
                              <div className="font-bold text-white truncate">{p.title}</div>
                              <div className="text-[11px] text-slate-400 truncate">{p.warranty}</div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{cat?.name || 'عام'}</td>
                          <td className="p-3.5 text-amber-400 font-semibold">{p.brand}</td>
                          <td className="p-3.5 font-mono font-bold text-white tabular-nums">
                            {formatPrice(p.price)}
                          </td>
                          <td className="p-3.5 text-slate-300 font-mono">{p.stock} قطعة</td>
                          <td className="p-3.5">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {p.condition}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                                title="تعديل المنتج"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف المنتج: "${p.title}"؟`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors cursor-pointer"
                                title="حذف المنتج"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeAdminTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">إضافة وإدارة أقسام المتجر</h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك إنشاء أي قسم ترغب به فوراً (مثل: إكسسوارات، شاشات، شواحن، كوابل، سوارات، كفرات حماية...)
                </p>
              </div>

              <button
                onClick={() => setIsCatModalOpen(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة قسم جديد الآن</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {count} منتجات مرتبطة
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`هل تريد بالتأكيد حذف قسم "${cat.name}"؟`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="حذف القسم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-white mt-2">{cat.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                      <span>الرمز التعريفي: {cat.id}</span>
                      <span className="text-emerald-400 text-xs font-semibold">قسم نشط</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INVOICES & ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeAdminTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم الفاتورة أو اسم الزبون أو الهاتف..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsInvoiceCreatorOpen(true)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-400/20 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Receipt className="w-4 h-4" />
                  <span>+ إنشاء فاتورة مخصصة (كاشير يدوي)</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-right">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3.5">رقم الفاتورة</th>
                      <th className="p-3.5">الزبون</th>
                      <th className="p-3.5">البنود والقطع</th>
                      <th className="p-3.5">أجور التوصيل</th>
                      <th className="p-3.5">الإجمالي</th>
                      <th className="p-3.5">طريقة الاستلام</th>
                      <th className="p-3.5 text-center">الطباعة والإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {ord.id}
                          <div className="text-[10px] text-slate-500 font-mono">{ord.createdAt}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{ord.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{ord.customerPhone}</div>
                          {ord.customerEmail && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">
                              {ord.customerEmail}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs text-slate-300 font-medium">
                            {ord.items.length} بنود
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {ord.items.map((i) => i.title).join(', ')}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          {ord.deliveryFee > 0 ? formatPrice(ord.deliveryFee) : 'استلام محل (0)'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-amber-400 tabular-nums">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                              ord.deliveryMethod === 'delivery'
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {ord.deliveryMethod === 'delivery' ? 'توصيل للمنزل' : 'استلام محل'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Print A4 */}
                            <button
                              onClick={() => openInvoice({ type: 'order', data: ord }, 'a4')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="طباعة فاتورة A4"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400" />
                              <span>A4</span>
                            </button>

                            {/* Print Thermal */}
                            <button
                              onClick={() => openInvoice({ type: 'order', data: ord }, 'thermal')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="طباعة وصل حراري 80mm"
                            >
                              <Receipt className="w-3.5 h-3.5 text-amber-400" />
                              <span>حراري</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`حذف الفاتورة #${ord.id} نهائياً؟`)) {
                                  deleteOrder(ord.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MAINTENANCE TICKETS */}
        {/* ========================================================================= */}
        {activeAdminTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم التذكرة أو العميل أو الهاتف..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل جهاز صيانة جديد (استلام يدوي)</span>
              </button>
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAdminTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold font-mono text-amber-400">
                        {ticket.id}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ticket.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Print Ticket (A4 / Thermal) */}
                      <button
                        onClick={() => openInvoice({ type: 'maintenance', data: ticket }, 'a4')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="طباعة وصل استلام A4"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>A4</span>
                      </button>

                      <button
                        onClick={() => openInvoice({ type: 'maintenance', data: ticket }, 'thermal')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="طباعة وصل حراري 80mm"
                      >
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        <span>حراري</span>
                      </button>

                      {/* WhatsApp connect with customer */}
                      <a
                        href={`https://wa.me/964${ticket.customerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(
                          `مرحباً ${ticket.customerName}، بخصوص جهازك (${ticket.deviceBrand} ${ticket.deviceModel}) في ورشة ${settings.storeName} - تذكرة #${ticket.id}:\nحالة الجهاز الحالية: ${
                            ticket.status === 'ready'
                              ? 'جاهز للاستلام ✅'
                              : ticket.status === 'repairing'
                              ? 'قيد التبديل والصيانة 🛠️'
                              : 'قيد الفحص المخبري 🔍'
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="مراسلة العميل عبر واتساب"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف تذكرة ${ticket.id}؟`)) {
                            deleteMaintenanceRequest(ticket.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors cursor-pointer"
                        title="حذف التذكرة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device and Customer info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">العميل:</span>{' '}
                      <span className="font-bold text-white">{ticket.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">الهاتف:</span>{' '}
                      <span className="font-mono text-slate-200">{ticket.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">الجهاز:</span>{' '}
                      <span className="font-bold text-amber-300">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">تاريخ الاستلام:</span>{' '}
                      <span className="font-mono text-slate-300">{ticket.receivedDate}</span>
                    </div>
                  </div>

                  {/* Issue note */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <span className="font-bold text-slate-300">{ticket.issueCategory}:</span>{' '}
                    <span className="text-slate-400">{ticket.issueDetails}</span>
                  </div>

                  {/* Status Dropdown Controller */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">حالة الصيانة:</span>
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          updateMaintenanceStatus(
                            ticket.id,
                            e.target.value as MaintenanceStatus
                          )
                        }
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950 border border-slate-700 text-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="received">تم الاستلام</option>
                        <option value="diagnosing">قيد الفحص المخبري</option>
                        <option value="repairing">جاري الصيانة والتبديل</option>
                        <option value="ready">جاهز للاستلام والتسليم</option>
                        <option value="delivered">تم التسليم للزبون</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400">التكلفة:</span>
                      <input
                        type="number"
                        value={ticket.estimatedCost}
                        onChange={(e) =>
                          updateMaintenanceStatus(
                            ticket.id,
                            ticket.status,
                            ticket.technicianNotes,
                            Number(e.target.value)
                          )
                        }
                        className="w-24 px-2 py-1 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 text-left"
                      />
                    </div>
                  </div>

                  {/* Technician Notes input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      ملاحظات وتقرير الفني (تظهر للزبون في التتبع والوصل):
                    </label>
                    <input
                      type="text"
                      defaultValue={ticket.technicianNotes || ''}
                      onBlur={(e) =>
                        updateMaintenanceStatus(
                          ticket.id,
                          ticket.status,
                          e.target.value,
                          ticket.estimatedCost
                        )
                      }
                      placeholder="اكتب تقرير الفحص أو التبديل هنا..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DELETED ITEMS */}
        {/* ========================================================================= */}
        {activeAdminTab === 'trash' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/20 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Archive className="w-5 h-5 text-rose-400" />
                  المحذوفات ({trashRecords.length})
                </h3>
                <p className="text-xs text-slate-400 mt-1">العناصر المحذوفة محفوظة هنا حتى تسترجعها أو تحذفها نهائيًا.</p>
              </div>
              <button
                type="button"
                disabled={trashRecords.length === 0}
                onClick={() => {
                  if (confirm('إفراغ المحذوفات نهائيًا؟')) emptyTrash();
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold disabled:opacity-40"
              >
                إفراغ المحذوفات
              </button>
            </div>

            {trashRecords.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/70 border border-slate-800 text-center text-sm text-slate-500">
                لا توجد عناصر محذوفة حاليًا.
              </div>
            ) : (
              <div className="space-y-3">
                {trashRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{record.title}</div>
                      <div className="text-xs text-slate-400 truncate mt-1">{record.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">{record.deletedAtDate} - {record.deletedAtTime}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => restoreFromTrash(record.id)} className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
                        استرجاع
                      </button>
                      <button type="button" onClick={() => { if (confirm('حذف هذا العنصر نهائيًا؟')) permanentlyDeleteTrash(record.id); }} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-rose-300 text-xs font-bold">
                        حذف نهائي
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: COMPANY NAME, LOGO & STORE SETTINGS */}
        {/* ========================================================================= */}
        {activeAdminTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <form
              onSubmit={handleSaveSettings}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5"
            >
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  <span>تعديل اسم الشركة، الشعار، ومبلغ التوصيل</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك تغيير اسم المتجر، رفع شعار أو صورة من جهازك، وتحديد أجور التوصيل الافتراضية
                </p>
              </div>

              {/* LOGO UPLOAD SECTION */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-white">
                  شعار الشركة / صورة المتجر (تظهر في الموقع والفواتير):
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {settingsForm.logoUrl ? (
                    <img
                      src={settingsForm.logoUrl}
                      alt="Company Logo Preview"
                      className="w-20 h-20 object-contain rounded-2xl bg-slate-900 border border-amber-500/40 p-1"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span>بدون شعار</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>اختيار ورفع الشعار من جهازك</span>
                      </button>

                      {settingsForm.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsForm((prev) => ({ ...prev, logoUrl: '' }));
                            updateSettings({ logoUrl: '' });
                          }}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-900/30 text-rose-400 text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          إزالة الشعار
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      يدعم الصور بصيغة PNG أو JPG أو WebP من هاتفك أو جهاز الكمبيوتر مباشرة.
                    </p>
                  </div>
                </div>
              </div>

              {/* STORE NAME & TAGLINE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    اسم الشركة / المتجر *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    اسم صاحب المحل / المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.ownerName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ownerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* TAGLINE */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  شعار الشركة اللفظي (Tagline)
                </label>
                <input
                  type="text"
                  placeholder="مثال: بيع الهواتف الذكية • صيانة الشاشات • إكسسوارات أصلية"
                  value={settingsForm.tagline || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* CONTACTS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    رقم الهاتف للاتصال المباشر
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    رقم الواتساب (مع المفتاح الدولي)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    البريد الإلكتروني للشركة
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* ADDRESS & CITY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={settingsForm.city}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">العنوان وموقع المحل</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    رابط موقع المحل على الخريطة
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://maps.google.com/..."
                    value={settingsForm.mapUrl || ''}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, mapUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* DELIVERY FEE & CURRENCY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    أجور التوصيل الافتراضية (د.ع)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.defaultDeliveryFee}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        defaultDeliveryFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">العملة الافتراضية</label>
                  <select
                    value={settingsForm.currency}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, currency: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="IQD">دينار عراقي (IQD)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    سعر صرف الدولار (1$ = دينار)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.exchangeRate}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        exchangeRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ بيانات وشعار الشركة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل ترغب بإعادة ضبط جميع البيانات للوضع الافتراضي؟')) {
                      resetToDefaults();
                    }
                  }}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير جميع بيانات الموقع</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT ADD / EDIT MODAL (WITH DIRECT DEVICE IMAGE UPLOAD) */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-right">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج أو قطعة جديدة'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: آيفون 15، شاشة أصلية، شاحن سريع..."
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">القسم التابع له *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand & Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">الماركة / الشركة</label>
                  <input
                    type="text"
                    placeholder="Apple, Samsung, Anker..."
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">السعر (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* Condition & Stock & Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">حالة القطعة</label>
                  <select
                    value={productForm.condition}
                    onChange={(e) =>
                      setProductForm({ ...productForm, condition: e.target.value as any })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white cursor-pointer"
                  >
                    <option value="جديد بالكرتون">جديد بالكرتون</option>
                    <option value="مستعمل نظيف (وكالة)">مستعمل نظيف (وكالة)</option>
                    <option value="قطعة أصلية معتمدة">قطعة أصلية معتمدة</option>
                    <option value="هاي كوبي درجة أولى">هاي كوبي درجة أولى</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">الكمية بالمخزن</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">مدة الضمان</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD FROM USER DEVICE + PREVIEW */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-white">
                  صورة المنتج (رفع من جهازك أو رابط):
                </label>

                <div className="flex items-center gap-4">
                  {productForm.image ? (
                    <img
                      src={productForm.image}
                      alt="Product preview"
                      className="w-16 h-16 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {/* Hidden input */}
                    <input
                      type="file"
                      ref={productFileInputRef}
                      onChange={handleProductImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة من الاستوديو أو الكاميرا (جهازك)</span>
                    </button>

                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="أو ضع رابط مباشر للصورة..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 ml-1">صور جاهزة سريعة:</span>
                  {presetImages.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">الوصف والمواصفات</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 cursor-pointer"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY ADD MODAL */}
      {/* ========================================================================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white">إضافة قسم جديد للمتجر</h3>
            <p className="text-xs text-slate-400">
              أضف قسماً مثل: إكسسوارات، شواحن، شاشات، بطاريات، كوابل، أو أي قسم تريده:
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم القسم الجديد * (مثال: إكسسوارات)
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إكسسوارات وهواتف"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  وصف مختصر للقسم
                </label>
                <input
                  type="text"
                  placeholder="أحدث الإكسسوارات والشواحن الأصلية وكفرات الحماية"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 cursor-pointer"
                >
                  تأكيد إضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WALK-IN MAINTENANCE MODAL */}
      {/* ========================================================================= */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-right space-y-4">
            <h3 className="text-base font-bold text-white">تسجيل جهاز صيانة مستلم في الورشة</h3>
            <form onSubmit={handleSaveMaintenance} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={maintenanceForm.customerName}
                    onChange={(e) =>
                      setMaintenanceForm({ ...maintenanceForm, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    value={maintenanceForm.customerPhone}
                    onChange={(e) =>
                      setMaintenanceForm({ ...maintenanceForm, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ماركة الجهاز</label>
                  <select
                    value={maintenanceForm.deviceBrand}
                    onChange={(e) =>
                      setMaintenanceForm({ ...maintenanceForm, deviceBrand: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Apple">آبل (iPhone / iPad)</option>
                    <option value="Samsung">سامسونج (Samsung)</option>
                    <option value="Xiaomi">شاومي (Xiaomi)</option>
                    <option value="Huawei">هواوي (Huawei)</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">موديل الجهاز *</label>
                  <input
                    type="text"
                    required
                    placeholder="iPhone 14 Pro, S23..."
                    value={maintenanceForm.deviceModel}
                    onChange={(e) =>
                      setMaintenanceForm({ ...maintenanceForm, deviceModel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">نوع المشكلة / العطل</label>
                  <select
                    value={maintenanceForm.issueCategory}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        issueCategory: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="شاشة مكسورة / عرض">تبديل شاشة / كسر شاشة</option>
                    <option value="تبديل بطارية">تبديل بطارية وكالة</option>
                    <option value="صيانة ماذر بورد وآي سي">صيانة ماذر بورد وآيسي</option>
                    <option value="مدخل الشحن والمايك">مدخل الشحن والمايك</option>
                    <option value="سقوط بالماء ورطوبة">سقوط بالماء ورطوبة</option>
                    <option value="سوفت وير وفك قفل">سوفت وير وفك قفل</option>
                    <option value="أخرى">عطل آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">التكلفة التقديرية (د.ع)</label>
                  <input
                    type="number"
                    value={maintenanceForm.estimatedCost}
                    onChange={(e) =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        estimatedCost: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">تفاصيل وملاحظات الاستلام</label>
                <textarea
                  rows={2}
                  value={maintenanceForm.issueDetails}
                  onChange={(e) =>
                    setMaintenanceForm({ ...maintenanceForm, issueDetails: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 cursor-pointer"
                >
                  تسجيل وإصدار التذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
