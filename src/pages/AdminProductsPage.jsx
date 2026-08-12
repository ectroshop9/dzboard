import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ShoppingCart, Package, Monitor, Zap, Cpu, Grid, List, X, SlidersHorizontal, Download } from 'lucide-react';
import { api } from '../services/api';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedBrand !== 'all') params.set('brand', selectedBrand);
    if (debouncedQuery) params.set('q', debouncedQuery);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedBrand, debouncedQuery, setSearchParams]);

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

  const handleDownloadUpdate = (e, product) => {
    e.stopPropagation();
    if (product.update_url) {
      window.open(product.update_url, '_blank');
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', system-ui, sans-serif", paddingBottom: 40 }}>
      
      {/* الهيدر العلوي - مضغوط */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 12px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              <ChevronLeft size={18} /> الرئيسية
            </Link>
            <h1 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#0f172a', whiteSpace: 'nowrap' }}>المتجر</h1>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: 350 }}>
            <input
              type="text"
              placeholder="ابحث..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 32px 8px 28px', border: '1px solid #cbd5e1', borderRadius: 20, outline: 'none', boxSizing: 'border-box', fontSize: 12, color: '#1e293b', background: '#f8fafc' }}
            />
            <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: showFilters ? '#eff6ff' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 20, padding: '7px 10px', cursor: 'pointer', color: showFilters ? '#2563eb' : '#475569', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}
          >
            <SlidersHorizontal size={14} /> فلاتر
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 20, padding: '7px 10px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}
          >
            {viewMode === 'grid' ? <List size={14} /> : <Grid size={14} />}
          </button>
        </div>

        {/* شريط التصنيفات */}
        <div style={{ maxWidth: 1100, margin: '8px auto 0', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 16,
                  border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: isActive ? '#eff6ff' : '#fff',
                  color: isActive ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={12} style={{ color: isActive ? '#2563eb' : cat.color }} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* فلاتر إضافية */}
      {showFilters && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 12px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', outline: 'none', cursor: 'pointer', fontSize: 12, color: '#334155', flex: 1, minWidth: 140, maxWidth: 200 }}
          >
            {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', outline: 'none', cursor: 'pointer', fontSize: 12, color: '#334155', flex: 1, minWidth: 140, maxWidth: 200 }}
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="price-low">السعر: من الأدنى</option>
            <option value="price-high">السعر: من الأعلى</option>
          </select>

          {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
            <button
              onClick={handleClearFilters}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={14} /> مسح
            </button>
          )}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 12px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
            {loading ? 'جاري البحث...' : `${products.length} قطعة`}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} style={{ background: '#fff', borderRadius: 12, height: 220, border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
            <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center', padding: '48px 16px' }}>
            <Package size={44} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: 0 }}>لم يتم العثور على قطع متطابقة</h3>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 16 }}>جرب تغيير عبارات البحث أو اختيار ماركة أخرى</p>
            <button
              onClick={handleClearFilters}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
            >
              عرض جميع القطع
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr', 
            gap: 12 
          }}>
            {products.map(product => {
              const numericPrice = parseFloat(product.price) || 0;
              const isAvailable = product.stock !== false && product.stock !== 0;
              const hasUpdate = product.update_url && product.update_url.trim() !== '';

              return (
                <div
                  key={product.id}
                  onClick={() => navigate('/checkout', { state: { items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }] } })}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    alignItems: viewMode === 'list' ? 'center' : 'stretch',
                    position: 'relative'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: isAvailable ? '#dcfce7' : '#fee2e2',
                    color: isAvailable ? '#166534' : '#991b1b',
                  }}>
                    {isAvailable ? 'متوفر' : 'غير متوفر'}
                  </span>

                  <div style={{ 
                    background: '#fafafa', 
                    height: viewMode === 'list' ? 95 : 140, 
                    width: viewMode === 'list' ? 100 : '100%', 
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
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=صورة+غير+متاحة'; }}
                    />
                  </div>

                  <div style={{ padding: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
                    <div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a', lineHeight: 1.3 }}>
                        {product.name || product.title}
                      </h2>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description || 'قطعة غيار إلكترونية'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6, borderTop: '1px dashed #f1f5f9', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#d97706' }}>
                        {numericPrice.toLocaleString('en-US')} <span style={{ fontSize: 10 }}>دج</span>
                      </span>

                      <div style={{ display: 'flex', gap: 4 }}>
                        {hasUpdate && (
                          <button
                            onClick={(e) => handleDownloadUpdate(e, product)}
                            style={{
                              padding: '6px 10px',
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Download size={13} /> تحديث
                          </button>
                        )}

                        <button
                          onClick={(e) => handleBuyNow(e, product)}
                          disabled={!isAvailable}
                          style={{
                            padding: '6px 10px',
                            background: isAvailable ? '#f59e0b' : '#cbd5e1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 11,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <ShoppingCart size={13} /> {isAvailable ? 'شراء' : 'نفد'}
                        </button>
                      </div>
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