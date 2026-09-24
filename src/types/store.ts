export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
}

export interface Product {
  id: string;
  title: string;
  categoryId: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  description: string;
  warranty: string;
  condition: 'جديد بالكرتون' | 'مستعمل نظيف (وكالة)' | 'قطعة أصلية معتمدة' | 'هاي كوبي درجة أولى';
  features: string[];
  featured?: boolean;
}

export type MaintenanceStatus = 'received' | 'diagnosing' | 'repairing' | 'ready' | 'delivered';

export interface MaintenanceRequest {
  id: string; // e.g. "MK-2041"
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  issueCategory: 'شاشة مكسورة / عرض' | 'تبديل بطارية' | 'مدخل الشحن والمايك' | 'صيانة ماذر بورد وآي سي' | 'سوفت وير وفك قفل' | 'سقوط بالماء ورطوبة' | 'كاميرا وعدسات' | 'أخرى';
  issueDetails: string;
  priority: 'عادي' | 'مستعجل (نفس اليوم)';
  estimatedCost: number;
  status: MaintenanceStatus;
  receivedDate: string;
  technicianNotes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  condition?: string;
  notes?: string;
  totalPrice?: number;
  type?: 'product' | 'part' | 'repair_service' | 'custom';
}

export interface Order {
  id: string; // e.g. "INV-1092"
  orderType: 'purchase' | 'maintenance' | 'part_installation' | 'custom_invoice';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryCompany?: string; // اسم التوصيل / المندوب / شركة الشحن
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface StoreSettings {
  storeName: string;
  ownerName: string;
  logoUrl?: string;
  tagline?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  mapUrl?: string;
  currency: 'IQD' | 'USD';
  exchangeRate: number; // e.g. 1 USD = 1530 IQD
  defaultDeliveryFee: number;
}

export interface DeletedItemRecord {
  id: string; // unique trash id e.g. "TRASH-12345"
  originalId: string;
  itemType: 'order' | 'product' | 'maintenance' | 'category' | 'suspended_invoice';
  title: string;
  description: string;
  deletedAtDate: string; // YYYY-MM-DD
  deletedAtTime: string; // HH:mm:ss
  data: any; // complete snapshot to allow instant restore!
}

export interface SuspendedInvoice {
  id: string; // e.g. "HOLD-101"
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryCompany?: string;
  deliveryFee: number;
  deliveryMethod: 'delivery' | 'pickup';
  items: OrderItem[];
  subtotal: number;
  total: number;
  notes?: string;
  heldAtDate: string; // YYYY-MM-DD
  heldAtTime: string; // HH:mm:ss
}
