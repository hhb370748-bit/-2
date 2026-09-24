import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MaintenanceSection } from './components/MaintenanceSection';
import { MaintenanceRequestModal } from './components/MaintenanceRequestModal';
import { MaintenanceTrackerModal } from './components/MaintenanceTrackerModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { InvoiceModal } from './components/InvoiceModal';
import { InvoiceCreatorModal } from './components/InvoiceCreatorModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { Footer } from './components/Footer';
import { CheckCircle2, Info, AlertCircle, Wrench, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, toast, setIsRequestMaintenanceOpen, setIsTrackerOpen } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'store' && (
          <>
            <Hero />
            <ProductCatalog />
            <MaintenanceSection />

            {/* Quality & Trust Spotlight Section */}
            <section className="py-12 bg-slate-900/50 border-t border-slate-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-slate-800 p-8 sm:p-12 text-right">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>كفالة مصطفى كطان الذهبية</span>
                      </div>
                      <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                        هل تبحث عن قطعة نادرة أو شاشة خاصة بهاتفك؟
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                        نوفر قطع غيار أصلية service pack لكافة الموديلات الحديثة والقديمة، مع إمكانية الفحص
                        المباشر أمامك وتركيب الشاشة مع كفالة خطية مختومة.
                      </p>
                    </div>

                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                      <button
                        onClick={() => setIsRequestMaintenanceOpen(true)}
                        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>طلب فحص وصيانة شاشة</span>
                      </button>

                      <button
                        onClick={() => setIsTrackerOpen(true)}
                        className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>تتبع تذكرة صيانة سابقة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'maintenance' && (
          <div className="pt-4">
            <MaintenanceSection />
          </div>
        )}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals */}
      <ProductDetailModal />
      <MaintenanceRequestModal />
      <MaintenanceTrackerModal />
      <CartDrawer />
      <InvoiceModal />
      <InvoiceCreatorModal />
      <CustomerAuthModal />

      {/* Footer */}
      <Footer />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex items-center gap-3 text-right max-w-md">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-semibold text-slate-100">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
