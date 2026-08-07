import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ShoppingCart, Package, Loader2, Monitor, Zap, Cpu, Grid, List } from 'lucide-react';
import { api } from '../services/api';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
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

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedBrand !== 'all') params.brand = selectedBrand;
    if (searchQuery) params.q = searchQuery;
    api.getProducts(params).then(data => {
      if (data.success) {
        let filtered = data.products;
        if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
        setProducts(filtered);
      }
      setLoading(false);
    }).catch(() => { setProducts([]); setLoading(false); });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }] } });
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={18} /> الرئيسية</Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>المتجر</h1>
          </div>
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, cursor: 'pointer' }}>{viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={() => setSelectedCategory(cat.key)} style={{ padding: '8px 14px', borderRadius: 8, border: selectedCategory === cat.key ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: selectedCategory === cat.key ? '#eff6ff' : '#fff', color: selectedCategory === cat.key ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={14} />{cat.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', minWidth: 130 }}>
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input type="text" placeholder="ابحث عن قطعة..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', minWidth: 140 }}>
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: منخفض لمرتفع</option>
              <option value="price-high">السعر: مرتفع لمنخفض</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16, color: '#64748b', fontSize: 13 }}>{loading ? 'جاري التحميل...' : `${products.length} منتج`}</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={40} className="spin" style={{ color: '#3b82f6' }} /></div>
        ) : products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center', padding: 60 }}>
            <Package size={48} style={{ color: '#94a3b8', marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>لا توجد منتجات</h3>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 } : { display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(product => (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', display: viewMode === 'list' ? 'flex' : 'block', gap: 16 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ background: '#f8fafc', height: viewMode === 'list' ? 'auto' : 180, width: viewMode === 'list' ? 140 : '100%', minHeight: viewMode === 'list' ? 120 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 14, flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{product.name}</h3>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{product.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>{product.price?.toLocaleString('en-US')} دج</span>
                    <button onClick={() => handleBuyNow(product)} disabled={!product.stock} style={{ padding: '8px 16px', background: product.stock ? '#f59e0b' : '#e2e8f0', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: product.stock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShoppingCart size={14} /> اشتري الآن
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
