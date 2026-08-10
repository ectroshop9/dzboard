import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ShoppingCart, Package, Loader2, Monitor, Zap, Cpu, Grid, List, X, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { key: 'all', label: 'الكل', icon: Grid, color: '#94a3b8' },
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
    { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
  ];

  const brands = [
    { code: 'all', name: 'كل الماركات' },
    { code: 'samsung', name: 'Samsung' }, { code: 'lg', name: 'LG' },
    { code: 'condor', name: 'Condor' }, { code: 'iris', name: 'Iris' },
    { code: 'geant', name: 'Geant' }, { code: 'stream', name: 'Stream' },
    { code: 'maxtor', name: 'Maxtor' }, { code: 'kiowa', name: 'Kiowa' },
  ];

  // تأخير إرسال البحث (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // تحديث الـ URL عند تغيير أي فلتر
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (debouncedQuery) params.set('q', debouncedQuery);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedBrand, debouncedQuery, setSearchParams]);

  // جلب البيانات من الـ API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedBrand !== 'all') params.brand = selectedBrand;
    if (debouncedQuery) params.q = debouncedQuery;

    api.getProducts(params)
      .then(data => {
        if (isMounted) {
          if (data && data.success) {
            let filtered = [...(data.products || [])];
            if (sortBy === 'price-low') filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
            if (sortBy === 'price-high') filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            setProducts(filtered);
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedCategory, selectedBrand, debouncedQuery, sortBy]);

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    navigate('/checkout', {
      state: {
        items: [{ id: product.id, name: product.name || product.title, price: product.price, quantity: 1, image: product.image }]
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: 'system-ui', paddingBottom: 40 }}>
      
      {/* الهيدر العلوي المثبت بشكل صحيح */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: 14 }}>
              <ChevronLeft size={18} /> الرئيسية
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>المتجر الإلكتروني</h1>
<Link to="/request-part" style={{ background: '#d97706', color: '#fff', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, marginRight: 8 }}>طلب قطعة غير متوفرة</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
              title="تغيير طريقة العرض"
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              <span style={{ display: 'none', smDisplay: 'inline' }}>{viewMode === 'grid' ? 'قائمة' : 'شبكة'}</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        
        {/* شريط الفلاتر والبحث */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          {/* التصنيفات */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 14, scrollbarWidth: 'none' }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isActive ? '#eff6ff' : '#fff',
                    color: isActive ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={15} style={{ color: isActive ? '#2563eb' : cat.color }} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* أدوات البحث والتصفية */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* القائمة المنسدلة للماركات */}
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', minWidth: 130, outline: 'none', cursor: 'pointer', fontSize: 13, color: '#334155' }}
            >
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>

            {/* حقل البحث ومسح النص */}
            <div style={{ flex: 1, position: 'relative', minWidth: 220 }}>
              <input
                type="text"
                placeholder="ابحث برقم الكارت، اسم الموديل أو القطعة..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 36px 10px 36px', border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 13, color: '#1e293b' }}
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ترتيب النتائج */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', minWidth: 150, outline: 'none', cursor: 'pointer', fontSize: 13, color: '#334155' }}
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="price-low">السعر: من الأدنى للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأدنى</option>
            </select>
          </div>
        </div>

        {/* معلومات النتائج وزر إعادة الضبط */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            {loading ? 'جاري البحث في المخزون...' : `تم العثور على ${products.length} قطعة`}
          </div>

          {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
            <button
              onClick={handleClearFilters}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={14} /> إعادة ضبط الفلاتر
            </button>
          )}
        </div>

        {/* عرض المنتجات / حالة التحميل */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} style={{ background: '#fff', borderRadius: 14, height: 260, border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
            <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center', padding: '60px 20px' }}>
            <Package size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: 0 }}>لم يتم العثور على قطع متطابقة</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, marginBottom: 16 }}>جرب تغيير عبارات البحث أو اختيار ماركة أخرى</p>
            <button
              onClick={handleClearFilters}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              عرض جميع القطع
            </button>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 } : { display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(product => {
              const numericPrice = parseFloat(product.price) || 0;
              const isAvailable = product.stock !== false && product.stock !== 0;

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: viewMode === 'list' ? 'flex' : 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    alignItems: viewMode === 'list' ? 'center' : 'stretch',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* شارة توفر المنتج */}
                  <span style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 12,
                    background: isAvailable ? '#dcfce7' : '#fee2e2',
                    color: isAvailable ? '#166534' : '#991b1b',
                  }}>
                    {isAvailable ? 'متوفر' : 'غير متوفر'}
                  </span>

                  {/* صورة المنتج */}
                  <div style={{ 
                    background: '#fafafa', 
                    height: viewMode === 'list' ? 120 : 180, 
                    width: viewMode === 'list' ? 130 : '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    borderBottom: viewMode === 'grid' ? '1px solid #f1f5f9' : 'none', 
                    flexShrink: 0 
                  }}>
                    <img
                      src={product.image || 'https://via.placeholder.com/200?text=لا+توجد+صورة'}
                      alt={product.name || product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=صورة+غير+متاحة'; }}
                    />
                  </div>

                  {/* التفاصيل والأسعار */}
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: '#0f172a', lineHeight: 1.4 }}>
                        {product.name || product.title}
                      </h3>
                      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description || 'قطعة غيار إلكترونية ذات جودة عالية متوافقة ومعاينة.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px dashed #f1f5f9' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#d97706' }}>
                        {numericPrice.toLocaleString('en-US')} <span style={{ fontSize: 11 }}>دج</span>
                      </span>

                      <button
                        onClick={(e) => handleBuyNow(e, product)}
                        disabled={!isAvailable}
                        style={{
                          padding: '8px 14px',
                          background: isAvailable ? '#f59e0b' : '#cbd5e1',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'background 0.2s'
                        }}
                      >
                        <ShoppingCart size={14} /> {isAvailable ? 'شراء الآن' : 'نفد'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}