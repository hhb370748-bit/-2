import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Search, Filter, Sparkles, SlidersHorizontal, PlusCircle } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveTab,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const { addCategory } = useStore();

  const handleQuickAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;
    addCategory({
      name: quickCatName.trim(),
      slug: quickCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      iconName: 'Sparkles',
      description: `قسم ${quickCatName} المميز لدى المتجر`,
    });
    setQuickCatName('');
    setIsQuickAddCatOpen(false);
  };

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
    return list;
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <section id="catalog-section" className="py-12 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-850 pb-6">
          <div className="text-right">
            <span className="text-xs font-semibold text-amber-400">
              كتالوج المنتجات والإكسسوارات والشاشات
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              جميع الأجهزة والقطع المتوفرة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              تصفح هواتف آبل وسامسونج، الشاشات الأصلية الخدمية، شواحن أنكر السريعة، وأحدث كفرات وسوارات الساعات
            </p>
          </div>

          {/* Quick Admin action to add product */}
          <button
            onClick={() => setActiveTab('admin')}
            className="self-start md:self-auto px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>إضافة منتج أو قسم جديد</span>
          </button>
        </div>

        {/* Categories Bar (Segmented Controls) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
            }`}
          >
            جميع الأقسام ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}

          {/* Quick Add Category Direct Button */}
          <button
            onClick={() => setIsQuickAddCatOpen(true)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-dashed border-amber-500/40 flex items-center gap-1.5"
            title="إضافة قسم جديد للمتجر مباشرة"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ قسم جديد</span>
          </button>
        </div>

        {/* Quick Add Category Inline Modal */}
        {isQuickAddCatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 text-right space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>إضافة قسم جديد إلى المتجر</span>
              </h3>
              <form onSubmit={handleQuickAddCategory} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    اسم القسم (مثال: إكسسوارات، شواحن، ساعات...)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسم القسم هنا"
                    value={quickCatName}
                    onChange={(e) => setQuickCatName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCatOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300"
                  >
                    إضافة القسم
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن هاتف، شاشة، شاحن، كابل، أو ماركة معينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Brand Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">كل الماركات والشركات</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="featured">الترتيب: المميز والموصى به</option>
              <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
              <option value="name">الاسم: أبجدياً</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary (If any active) */}
        {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>تصفية حسب:</span>
            {selectedCategory !== 'all' && (
              <span className="text-amber-400">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </span>
            )}
            {selectedBrand !== 'all' && (
              <>
                <span>•</span>
                <span className="text-amber-400">{selectedBrand}</span>
              </>
            )}
            {searchQuery.trim() && (
              <>
                <span>•</span>
                <span className="text-amber-400">"{searchQuery}"</span>
              </>
            )}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="text-xs text-rose-400 hover:underline mr-2"
            >
              إلغاء التصفية
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">لم يتم العثور على أي منتج يطابق بحثك</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              جرب تغيير كلمة البحث أو اختيار قسم مختلف، أو تواصل مع مصطفى كطان مباشرة عبر الواتساب لتوفير القطعة المطلوبة فوراً.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-amber-400 text-slate-950 rounded-xl"
            >
              عرض كافة المنتجات
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
