import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  Product,
  MaintenanceRequest,
  MaintenanceStatus,
  CartItem,
  StoreSettings,
  Order,
  Customer,
  DeletedItemRecord,
  SuspendedInvoice,
} from '../types/store';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { clearDatabase, readDatabaseValue, writeDatabaseValue } from '../utils/database';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export type InvoiceSource =
  | { type: 'order'; data: Order }
  | { type: 'maintenance'; data: MaintenanceRequest };

interface StoreContextType {
  // State
  products: Product[];
  categories: Category[];
  maintenanceRequests: MaintenanceRequest[];
  orders: Order[];
  customers: Customer[];
  currentCustomer: Customer | null;
  settings: StoreSettings;
  cart: CartItem[];
  activeTab: 'store' | 'maintenance' | 'admin' | 'orders';
  selectedCategory: string;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isTrackerOpen: boolean;
  isRequestMaintenanceOpen: boolean;
  isAuthModalOpen: boolean;
  isInvoiceCreatorOpen: boolean;
  authMode: 'login' | 'signup';
  activeInvoice: InvoiceSource | null;
  invoicePrintFormat: 'a4' | 'thermal';
  toast: Toast | null;
  visitorCount: number;

  // Trash / Deleted Items (سلة المحذوفات)
  trashRecords: DeletedItemRecord[];
  restoreFromTrash: (trashId: string) => void;
  permanentlyDeleteTrash: (trashId: string) => void;
  emptyTrash: () => void;

  // Suspended Invoices (الفواتير المعلقة)
  suspendedInvoices: SuspendedInvoice[];
  suspendInvoice: (data: Omit<SuspendedInvoice, 'id' | 'heldAtDate' | 'heldAtTime'>) => SuspendedInvoice;
  resumeSuspendedInvoice: (suspendedId: string) => SuspendedInvoice | undefined;
  deleteSuspendedInvoice: (suspendedId: string) => void;

  // Setters
  setActiveTab: (tab: 'store' | 'maintenance' | 'admin' | 'orders') => void;
  setSelectedCategory: (catId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsTrackerOpen: (open: boolean) => void;
  setIsRequestMaintenanceOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsInvoiceCreatorOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  setInvoicePrintFormat: (format: 'a4' | 'thermal') => void;
  incrementVisitorCount: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Auth / Customer
  loginCustomer: (emailOrPhone: string) => boolean;
  signupCustomer: (name: string, email: string, phone: string, address?: string) => Customer;
  logoutCustomer: () => void;
  updateCustomerProfile: (updated: Partial<Customer>) => void;

  // Data Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addMaintenanceRequest: (
    req: Omit<MaintenanceRequest, 'id' | 'receivedDate' | 'status'>
  ) => string;
  updateMaintenanceStatus: (
    id: string,
    status: MaintenanceStatus,
    notes?: string,
    cost?: number
  ) => void;
  deleteMaintenanceRequest: (id: string) => void;

  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrder: (id: string, updatedData: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;

  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  openInvoice: (source: InvoiceSource, format?: 'a4' | 'thermal') => void;
  closeInvoice: () => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  formatPrice: (priceInIQD: number) => string;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Sample Orders
const INITIAL_ORDERS: Order[] = [
  {
    id: 'INV-1091',
    orderType: 'purchase',
    items: [
      {
        id: 'prod-5',
        title: 'شاحن أنكر GaN ثلاثي المنافذ بقوة 65 واط Anker Prime 65W',
        price: 48000,
        quantity: 1,
        condition: 'جديد بالكرتون',
        type: 'product',
      },
      {
        id: 'prod-9',
        title: 'كيبل أبل الأصلي المجدول USB-C إلى USB-C بقوة 60W',
        price: 22000,
        quantity: 2,
        condition: 'قطعة أصلية معتمدة',
        type: 'product',
      },
    ],
    subtotal: 92000,
    deliveryFee: 5000,
    total: 97000,
    deliveryMethod: 'delivery',
    customerName: 'حسين علي الركابي',
    customerPhone: '07705544332',
    customerEmail: 'hussain@example.com',
    customerAddress: 'بغداد - المنصور - شارع 14 رمضان',
    createdAt: '2026-09-24',
    status: 'completed',
  },
  {
    id: 'INV-1092',
    orderType: 'part_installation',
    items: [
      {
        id: 'prod-3',
        title: 'شاشة آيفون 14 برو ماكس أصلية Super Retina XDR OLED',
        price: 360000,
        quantity: 1,
        condition: 'قطعة أصلية معتمدة',
        type: 'part',
      },
      {
        id: 'srv-install',
        title: 'أجور فحص وتركيب ونقل True Tone في الورشة',
        price: 15000,
        quantity: 1,
        type: 'repair_service',
      },
    ],
    subtotal: 375000,
    deliveryFee: 0,
    total: 375000,
    deliveryMethod: 'pickup',
    customerName: 'كرار مهدي',
    customerPhone: '07802233441',
    customerEmail: 'karrar@example.com',
    customerAddress: 'استلام وتركيب مباشر في ورشة مصطفى كطان',
    createdAt: '2026-09-24',
    status: 'completed',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'أحمد شاكر الربيعي',
    email: 'ahmed@example.com',
    phone: '07712345678',
    address: 'بغداد - الكرادة - شارع العرصات',
    createdAt: '2026-09-20',
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_maintenance');
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_REQUESTS;
    } catch {
      return INITIAL_MAINTENANCE_REQUESTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_current_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'store' | 'maintenance' | 'admin' | 'orders'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isRequestMaintenanceOpen, setIsRequestMaintenanceOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isInvoiceCreatorOpen, setIsInvoiceCreatorOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeInvoice, setActiveInvoice] = useState<InvoiceSource | null>(null);
  const [invoicePrintFormat, setInvoicePrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [toast, setToast] = useState<Toast | null>(null);

  // Trash Records (سلة المحذوفات)
  const [trashRecords, setTrashRecords] = useState<DeletedItemRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_trash');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Suspended Invoices (الفواتير المعلقة)
  const [suspendedInvoices, setSuspendedInvoices] = useState<SuspendedInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_suspended_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [visitorCount, setVisitorCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mustafa_kattan_visitors');
      return saved ? parseInt(saved, 10) : 1845;
    } catch {
      return 1845;
    }
  });

  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  const incrementVisitorCount = () => {
    setVisitorCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('mustafa_kattan_visitors', next.toString());
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const hasCountedSession = sessionStorage.getItem('mustafa_kattan_counted');
      if (!hasCountedSession) {
        sessionStorage.setItem('mustafa_kattan_counted', 'true');
        incrementVisitorCount();
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Load the durable browser database, while keeping localStorage as a migration fallback.
  useEffect(() => {
    let cancelled = false;

    const hydrateFromDatabase = async () => {
      try {
        const [savedProducts, savedCategories, savedMaintenance, savedOrders, savedCustomers, savedSettings, savedTrash, savedSuspended, savedCart] = await Promise.all([
          readDatabaseValue<Product[]>('products'),
          readDatabaseValue<Category[]>('categories'),
          readDatabaseValue<MaintenanceRequest[]>('maintenance'),
          readDatabaseValue<Order[]>('orders'),
          readDatabaseValue<Customer[]>('customers'),
          readDatabaseValue<StoreSettings>('settings'),
          readDatabaseValue<DeletedItemRecord[]>('trash'),
          readDatabaseValue<SuspendedInvoice[]>('suspendedInvoices'),
          readDatabaseValue<CartItem[]>('cart'),
        ]);

        if (cancelled) return;
        if (savedProducts) setProducts(savedProducts);
        if (savedCategories) setCategories(savedCategories);
        if (savedMaintenance) setMaintenanceRequests(savedMaintenance);
        if (savedOrders) setOrders(savedOrders);
        if (savedCustomers) setCustomers(savedCustomers);
        if (savedSettings) setSettings(savedSettings);
        if (savedTrash) setTrashRecords(savedTrash);
        if (savedSuspended) setSuspendedInvoices(savedSuspended);
        if (savedCart) setCart(savedCart);
      } catch (error) {
        console.warn('تعذر تحميل قاعدة البيانات المحلية، سيتم استخدام التخزين الاحتياطي.', error);
      } finally {
        if (!cancelled) setIsDatabaseReady(true);
      }
    };

    void hydrateFromDatabase();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistState = <T,>(key: string, value: T, localStorageKey: string) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    } catch (error) {
      console.warn(error);
    }
    if (isDatabaseReady) {
      void writeDatabaseValue(key, value).catch((error) => console.warn(`تعذر حفظ ${key}`, error));
    }
  };

  // Sync to the database and retain localStorage compatibility.
  useEffect(() => {
    persistState('products', products, 'mustafa_kattan_products');
  }, [products, isDatabaseReady]);

  useEffect(() => {
    persistState('categories', categories, 'mustafa_kattan_categories');
  }, [categories, isDatabaseReady]);

  useEffect(() => {
    persistState('maintenance', maintenanceRequests, 'mustafa_kattan_maintenance');
  }, [maintenanceRequests, isDatabaseReady]);

  useEffect(() => {
    persistState('orders', orders, 'mustafa_kattan_orders');
  }, [orders, isDatabaseReady]);

  useEffect(() => {
    persistState('customers', customers, 'mustafa_kattan_customers');
  }, [customers, isDatabaseReady]);

  useEffect(() => {
    try {
      localStorage.setItem('mustafa_kattan_current_customer', JSON.stringify(currentCustomer));
    } catch (e) {
      console.warn(e);
    }
  }, [currentCustomer]);

  useEffect(() => {
    persistState('settings', settings, 'mustafa_kattan_settings');
  }, [settings, isDatabaseReady]);

  useEffect(() => {
    persistState('trash', trashRecords, 'mustafa_kattan_trash');
  }, [trashRecords, isDatabaseReady]);

  useEffect(() => {
    persistState('suspendedInvoices', suspendedInvoices, 'mustafa_kattan_suspended_invoices');
  }, [suspendedInvoices, isDatabaseReady]);

  useEffect(() => {
    persistState('cart', cart, 'mustafa_kattan_cart');
  }, [cart, isDatabaseReady]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // Auth / Customer methods
  const loginCustomer = (emailOrPhone: string): boolean => {
    const q = emailOrPhone.trim().toLowerCase();
    const found = customers.find(
      (c) => c.email.toLowerCase() === q || c.phone.replace(/\s+/g, '') === q.replace(/\s+/g, '')
    );
    if (found) {
      setCurrentCustomer(found);
      showToast(`أهلاً بك مجدداً، ${found.name}! تم تسجيل الدخول بنجاح.`);
      return true;
    } else {
      // Auto register quick account if not found
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'زبون كريم',
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@mustafakattan.iq`,
        phone: emailOrPhone.includes('@') ? '07700000000' : emailOrPhone,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [...prev, newCust]);
      setCurrentCustomer(newCust);
      showToast(`تم إنشاء حساب جديد بنجاح مرحباً بك ${newCust.name}`);
      return true;
    }
  };

  const signupCustomer = (
    name: string,
    email: string,
    phone: string,
    address?: string
  ): Customer => {
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name,
      email: email || `${phone}@customer.mustafakattan.iq`,
      phone,
      address: address || '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCust]);
    setCurrentCustomer(newCust);
    showToast(`مرحباً بك يا ${name}! تم إنشاء حسابك بنجاح.`);
    return newCust;
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const updateCustomerProfile = (updated: Partial<Customer>) => {
    if (!currentCustomer) return;
    const next = { ...currentCustomer, ...updated };
    setCurrentCustomer(next);
    setCustomers((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    showToast('تم تحديث بيانات ملفك الشخصي بنجاح');
  };

  const getFormattedDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const full = `${dateStr} ${timeStr}`;
    return { dateStr, timeStr, full };
  };

  // Product CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = 'prod-' + Date.now();
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
    showToast(`تمت إضافة منتج: "${product.title}" بنجاح`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast('تم تحديث بيانات المنتج بنجاح');
  };

  const deleteProduct = (id: string) => {
    const prodToDelete = products.find((p) => p.id === id);
    if (prodToDelete) {
      const { dateStr, timeStr } = getFormattedDateTime();
      const trashItem: DeletedItemRecord = {
        id: 'TRASH-' + Date.now(),
        originalId: prodToDelete.id,
        itemType: 'product',
        title: `منتج: ${prodToDelete.title}`,
        description: `السعر: ${formatPrice(prodToDelete.price)} - المخزون: ${prodToDelete.stock}`,
        deletedAtDate: dateStr,
        deletedAtTime: timeStr,
        data: prodToDelete,
      };
      setTrashRecords((prev) => [trashItem, ...prev]);
    }
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast('تم حذف المنتج ونقله إلى سلة المحذوفات', 'info');
  };

  // Category CRUD
  const addCategory = (newCat: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const category: Category = { ...newCat, id };
    setCategories((prev) => [...prev, category]);
    showToast(`تمت إضافة قسم "${category.name}" بنجاح`);
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updated } : cat))
    );
    showToast('تم تحديث القسم بنجاح');
  };

  const deleteCategory = (id: string) => {
    if (categories.length <= 1) {
      showToast('لا يمكن حذف جميع الأقسام. يجب بقاء قسم واحد على الأقل.', 'error');
      return;
    }
    const catToDelete = categories.find((c) => c.id === id);
    if (catToDelete) {
      const { dateStr, timeStr } = getFormattedDateTime();
      const trashItem: DeletedItemRecord = {
        id: 'TRASH-' + Date.now(),
        originalId: catToDelete.id,
        itemType: 'category',
        title: `قسم: ${catToDelete.name}`,
        description: catToDelete.description,
        deletedAtDate: dateStr,
        deletedAtTime: timeStr,
        data: catToDelete,
      };
      setTrashRecords((prev) => [trashItem, ...prev]);
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    showToast('تم حذف القسم ونقله إلى سلة المحذوفات', 'info');
  };

  // Maintenance Actions
  const addMaintenanceRequest = (
    req: Omit<MaintenanceRequest, 'id' | 'receivedDate' | 'status'>
  ): string => {
    const randomTicketNumber = Math.floor(1000 + Math.random() * 9000);
    const newId = `MK-${randomTicketNumber}`;
    const { full } = getFormattedDateTime();

    const newRequest: MaintenanceRequest = {
      ...req,
      id: newId,
      receivedDate: full,
      status: 'received',
    };

    setMaintenanceRequests((prev) => [newRequest, ...prev]);
    showToast(`تم تسجيل طلب الصيانة بنجاح! رقم تذكرتك: ${newId}`);
    return newId;
  };

  const updateMaintenanceStatus = (
    id: string,
    status: MaintenanceStatus,
    notes?: string,
    cost?: number
  ) => {
    setMaintenanceRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          return {
            ...req,
            status,
            ...(notes !== undefined ? { technicianNotes: notes } : {}),
            ...(cost !== undefined ? { estimatedCost: cost } : {}),
          };
        }
        return req;
      })
    );
    showToast(`تم تحديث حالة طلب الصيانة #${id} بنجاح`);
  };

  const deleteMaintenanceRequest = (id: string) => {
    const ticket = maintenanceRequests.find((t) => t.id === id);
    if (ticket) {
      const { dateStr, timeStr } = getFormattedDateTime();
      const trashItem: DeletedItemRecord = {
        id: 'TRASH-' + Date.now(),
        originalId: ticket.id,
        itemType: 'maintenance',
        title: `طلب صيانة #${ticket.id} (${ticket.deviceBrand} ${ticket.deviceModel})`,
        description: `الزبون: ${ticket.customerName} - العطل: ${ticket.issueCategory}`,
        deletedAtDate: dateStr,
        deletedAtTime: timeStr,
        data: ticket,
      };
      setTrashRecords((prev) => [trashItem, ...prev]);
    }
    setMaintenanceRequests((prev) => prev.filter((r) => r.id !== id));
    showToast('تم حذف طلب الصيانة ونقله إلى سلة المحذوفات', 'info');
  };

  // Orders CRUD
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const newId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const { full } = getFormattedDateTime();

    const order: Order = {
      ...orderData,
      id: newId,
      createdAt: full,
      status: 'completed',
    };

    setOrders((prev) => [order, ...prev]);

    // Also link customer if not registered
    if (order.customerPhone) {
      const existing = customers.find((c) => c.phone === order.customerPhone);
      if (!existing) {
        setCustomers((prev) => [
          ...prev,
          {
            id: 'cust-' + Date.now(),
            name: order.customerName,
            email: order.customerEmail || `${order.customerPhone}@customer.mustafakattan.iq`,
            phone: order.customerPhone,
            address: order.customerAddress || '',
            createdAt: full,
          },
        ]);
      }
    }

    return order;
  };

  const updateOrder = (id: string, updatedData: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updatedData } : o))
    );
    showToast(`تم حفظ وتحديث الفاتورة #${id}`);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast(`تم تحديث حالة الفاتورة #${id}`);
  };

  const deleteOrder = (id: string) => {
    const orderToDelete = orders.find((o) => o.id === id);
    if (orderToDelete) {
      const { dateStr, timeStr } = getFormattedDateTime();
      const trashItem: DeletedItemRecord = {
        id: 'TRASH-' + Date.now(),
        originalId: orderToDelete.id,
        itemType: 'order',
        title: `فاتورة مبيعات #${orderToDelete.id} (${orderToDelete.customerName})`,
        description: `${orderToDelete.items.length} مواد بقيمة ${formatPrice(orderToDelete.total)}`,
        deletedAtDate: dateStr,
        deletedAtTime: timeStr,
        data: orderToDelete,
      };
      setTrashRecords((prev) => [trashItem, ...prev]);
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('تم حذف الفاتورة ونقلها إلى سلة المحذوفات', 'info');
  };

  // Trash actions (سلة المحذوفات)
  const restoreFromTrash = (trashId: string) => {
    const item = trashRecords.find((r) => r.id === trashId);
    if (!item) return;

    if (item.itemType === 'order') {
      setOrders((prev) => [item.data, ...prev.filter((o) => o.id !== item.data.id)]);
    } else if (item.itemType === 'product') {
      setProducts((prev) => [item.data, ...prev.filter((p) => p.id !== item.data.id)]);
    } else if (item.itemType === 'maintenance') {
      setMaintenanceRequests((prev) => [item.data, ...prev.filter((m) => m.id !== item.data.id)]);
    } else if (item.itemType === 'category') {
      setCategories((prev) => [item.data, ...prev.filter((c) => c.id !== item.data.id)]);
    } else if (item.itemType === 'suspended_invoice') {
      setSuspendedInvoices((prev) => [item.data, ...prev.filter((s) => s.id !== item.data.id)]);
    }

    setTrashRecords((prev) => prev.filter((r) => r.id !== trashId));
    showToast(`تم استرجاع "${item.title}" بنجاح إلى النظام!`);
  };

  const permanentlyDeleteTrash = (trashId: string) => {
    setTrashRecords((prev) => prev.filter((r) => r.id !== trashId));
    showToast('تم الحذف النهائي من النظام');
  };

  const emptyTrash = () => {
    setTrashRecords([]);
    showToast('تم إفراغ سلة المحذوفات بالكامل');
  };

  // Suspended Invoices actions (تعليق الفواتير)
  const suspendInvoice = (
    data: Omit<SuspendedInvoice, 'id' | 'heldAtDate' | 'heldAtTime'>
  ): SuspendedInvoice => {
    const { dateStr, timeStr } = getFormattedDateTime();
    const newHold: SuspendedInvoice = {
      ...data,
      id: `HOLD-${Math.floor(100 + Math.random() * 900)}`,
      heldAtDate: dateStr,
      heldAtTime: timeStr,
    };
    setSuspendedInvoices((prev) => [newHold, ...prev]);
    showToast(`تم تعليق الفاتورة بنجاح #${newHold.id}!`);
    return newHold;
  };

  const resumeSuspendedInvoice = (suspendedId: string): SuspendedInvoice | undefined => {
    const found = suspendedInvoices.find((s) => s.id === suspendedId);
    if (found) {
      setSuspendedInvoices((prev) => prev.filter((s) => s.id !== suspendedId));
      showToast(`تم استرجاع الفاتورة المعلقة #${found.id}`);
    }
    return found;
  };

  const deleteSuspendedInvoice = (suspendedId: string) => {
    const found = suspendedInvoices.find((s) => s.id === suspendedId);
    if (found) {
      const { dateStr, timeStr } = getFormattedDateTime();
      const trashItem: DeletedItemRecord = {
        id: 'TRASH-' + Date.now(),
        originalId: found.id,
        itemType: 'suspended_invoice',
        title: `فاتورة معلقة #${found.id} (${found.customerName})`,
        description: `${found.items.length} مواد بقيمة ${formatPrice(found.total)}`,
        deletedAtDate: dateStr,
        deletedAtTime: timeStr,
        data: found,
      };
      setTrashRecords((prev) => [trashItem, ...prev]);
    }
    setSuspendedInvoices((prev) => prev.filter((s) => s.id !== suspendedId));
    showToast('تم حذف الفاتورة المعلقة ونقلها إلى سلة المحذوفات');
  };

  // Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`تمت إضافة "${product.title.slice(0, 30)}..." إلى السلة`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('تم حذف العنصر من السلة', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Invoices & Printing
  const openInvoice = (source: InvoiceSource, format: 'a4' | 'thermal' = 'a4') => {
    setActiveInvoice(source);
    setInvoicePrintFormat(format);
  };

  const closeInvoice = () => {
    setActiveInvoice(null);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('تم حفظ إعدادات واسم وشعار المتجر بنجاح');
  };

  const formatPrice = (priceInIQD: number): string => {
    if (settings.currency === 'USD') {
      const usd = Math.round(priceInIQD / settings.exchangeRate);
      return `$${usd.toLocaleString('en-US')}`;
    }
    return `${priceInIQD.toLocaleString('ar-IQ')} د.ع`;
  };

  const resetToDefaults = () => {
    void clearDatabase().catch((error) => console.warn('تعذر تصفير قاعدة البيانات', error));
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setMaintenanceRequests([]);
    setOrders([]);
    setCustomers([]);
    setCurrentCustomer(null);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setTrashRecords([]);
    setSuspendedInvoices([]);
    setVisitorCount(0);
    try {
      localStorage.setItem('mustafa_kattan_visitors', '0');
    } catch (error) {
      console.warn(error);
    }
    showToast('تم تصفير جميع البيانات وإرجاع الموقع للحالة الافتراضية');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        maintenanceRequests,
        orders,
        customers,
        currentCustomer,
        settings,
        cart,
        activeTab,
        selectedCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isTrackerOpen,
        isRequestMaintenanceOpen,
        isAuthModalOpen,
        isInvoiceCreatorOpen,
        authMode,
        activeInvoice,
        invoicePrintFormat,
        toast,
        visitorCount,
        trashRecords,
        restoreFromTrash,
        permanentlyDeleteTrash,
        emptyTrash,
        suspendedInvoices,
        suspendInvoice,
        resumeSuspendedInvoice,
        deleteSuspendedInvoice,
        setActiveTab,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsTrackerOpen,
        setIsRequestMaintenanceOpen,
        setIsAuthModalOpen,
        setIsInvoiceCreatorOpen,
        setAuthMode,
        setInvoicePrintFormat,
        incrementVisitorCount,
        showToast,
        loginCustomer,
        signupCustomer,
        logoutCustomer,
        updateCustomerProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        deleteMaintenanceRequest,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        openInvoice,
        closeInvoice,
        updateSettings,
        formatPrice,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
