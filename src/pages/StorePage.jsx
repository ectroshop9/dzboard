import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ShoppingCart, Package, Loader2, Monitor, Zap, Cpu, Grid, List, Eye } from 'lucide-react';
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
    { code: 'all', name: 'الكل' },
    { code: 'samsung', name: 'Samsung' }, { code: 'lg', name: 'LG' },
    { code: 'condor', name: 'Condor' }, { code: 'iris', name: 'Iris' },
    { code: 'geant', name: 'Geant' }, { code: 'stream', name: 'Stream' },
    { code: 'maxtor', name: 'Maxtor' }, { code: 'kiowa', name: 'Kiowa' },
  ];

  // تأخير إرسال البحث لمنع كثرة الطلبات (Debounce)
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
            if (sortBy === 'price-low') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
            if (sortBy === 'price-high') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
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
    e.stopPropagation(); // إيقاف الانتقال لصفحة التفاصيل عند الضغط على زر الشراء مباشرة
    navigate('/checkout', {
      state: {
        items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }]
      }
    });
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: 'system-ui' }}>
      {/* الهيدر العلوي */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', sticky: 'top', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <ChevronLeft size={18} /> الرئيسية
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>المتجر</h1>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#475569' }}
            title="تغيير طريقة العرض"
          >
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        {/* شريط الفلاتر والبحث */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {/* التصنيفات */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
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
                    color: isActive ? '#3b82f6' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />{cat.label}
                </button>
              );
            })}
          </div>

          {/* القوائم المنسدلة والبحث */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', minWidth: 130, outline: 'none', cursor: 'pointer' }}
            >
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>

            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input
                type="text"
                placeholder="ابحث عن قطعة (رقم الكارت، الموديل...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontSize: 14 }}
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', minWidth: 150, outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: منخفض لمرتفع</option>
              <option value="price-high">السعر: مرتفع لمنخفض</option>
            </select>
          </div>
        </div>

        {/* عدد المنتجات */}
        <div style={{ marginBottom: 16, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
          {loading ? 'جاري البحث عن القطع...' : `${products.length} قطعة متوفرة`}
        </div>

        {/* محتوى المنتجات */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center', padding: 60 }}>
            <Package size={48} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: 0 }}>لا توجد منتجات مطابقة للبحث</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>جرب تغيير عبارة البحث أو اختيار تصنيف آخر</p>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 } : { display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(product => {
              const numericPrice = parseFloat(product.price) || 0;
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
                    display: viewMode === 'list' ? 'flex' : 'block',
                    alignItems: viewMode === 'list' ? 'center' : 'stretch'
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
                  <div style={{ background: '#fafafa', height: viewMode === 'list' ? 120 : 180, width: viewMode === 'list' ? 140 : '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: viewMode === 'grid' ? '1px solid #f1f5f9' : 'none', flexShrink: 0 }}>
                    <img
                      src={product.image || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
                    />
                  </div>

                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, color: '#1e293b', lineHeight: 1.4 }}>{product.name}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description || 'لا يوجد وصف متاح'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>
                        {numericPrice.toLocaleString('en-US')} دج
                      </span>
                      <button
                        onClick={(e) => handleBuyNow(e, product)}
                        disabled={!product.stock}
                        style={{
                          padding: '8px 14px',
                          background: product.stock ? '#f59e0b' : '#cbd5e1',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: product.stock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <ShoppingCart size={14} /> {product.stock ? 'اشتري الآن' : 'نفد'}
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