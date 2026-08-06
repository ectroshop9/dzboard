import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, ChevronLeft, ShoppingCart, Package, Loader2, Monitor, Zap, Cpu, Grid, List 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  
  // Filters
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
    { code: 'samsung', name: 'Samsung' },
    { code: 'lg', name: 'LG' },
    { code: 'condor', name: 'Condor' },
    { code: 'iris', name: 'Iris' },
    { code: 'geant', name: 'Geant' },
    { code: 'stream', name: 'Stream' },
    { code: 'maxtor', name: 'Maxtor' },
    { code: 'kiowa', name: 'Kiowa' },
  ];

  // Sample Products (replace with API call)
  const sampleProducts = [
    { id: 1, name: 'T-Con Samsung 32" FHD', category: 'tcon', brand: 'samsung', price: 2500, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', stock: 5, description: 'كرت T-Con أصلي لشاشات سامسونج 32 بوصة' },
    { id: 2, name: 'Power Supply LG 43"', category: 'alimentation', brand: 'lg', price: 3200, image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400', stock: 3, description: 'باور سبلاي LG 43"' },
    { id: 3, name: 'Main Board Condor 40"', category: 'main-board', brand: 'condor', price: 4500, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400', stock: 2, description: 'مين بورد كوندور' },
    { id: 4, name: 'LED Strips Iris 50"', category: 'parts', brand: 'iris', price: 1800, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', stock: 10, description: 'مساطر LED ايريس' },
    { id: 5, name: 'T-Con Geant 28"', category: 'tcon', brand: 'geant', price: 2000, image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400', stock: 7, description: 'كرت T-Con جيون' },
    { id: 6, name: 'Alimentation Stream 32"', category: 'alimentation', brand: 'stream', price: 2800, image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400', stock: 4, description: 'باور سبلاي ستريم' },
    { id: 7, name: 'Main Board Maxtor 50"', category: 'main-board', brand: 'maxtor', price: 5200, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', stock: 1, description: 'مين بورد ماكستور' },
    { id: 8, name: 'T-Con Kiowa 24"', category: 'tcon', brand: 'kiowa', price: 1500, image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400', stock: 6, description: 'كرت T-Con كيوا' },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = [...sampleProducts];
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (selectedBrand !== 'all') {
        filtered = filtered.filter(p => p.brand === selectedBrand);
      }
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort
      if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
      
      setProducts(filtered);
      setLoading(false);
    }, 500);
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleBuyNow = (product) => {
    navigate('/checkout', { 
      state: { 
        items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }] 
      } 
    });
  };

  const getCategoryColor = (catKey) => {
    const cat = categories.find(c => c.key === catKey);
    return cat ? cat.color : '#94a3b8';
  };

  const getCategoryName = (catKey) => {
    const cat = categories.find(c => c.key === catKey);
    return cat ? cat.label : catKey;
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" className="btn btn-ghost btn-sm">
              <ChevronLeft size={18} /> الرئيسية
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 900 }}>المتجر</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn btn-ghost btn-sm"
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px' }}>
        
        {/* Filters Bar */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          {/* Categories Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`btn ${selectedCategory === cat.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  style={{ gap: 6 }}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="field-input"
              style={{ width: 'auto', minWidth: 130 }}
            >
              {brands.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>

            {/* Search */}
            <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
              <input
                type="text"
                placeholder="ابحث عن قطعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field-input"
              />
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="field-input"
              style={{ width: 'auto', minWidth: 140 }}
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: منخفض لمرتفع</option>
              <option value="price-high">السعر: مرتفع لمنخفض</option>
            </select>
          </div>
        </div>

        {/* Products Count */}
        <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
          {loading ? 'جاري التحميل...' : `${products.length} منتج`}
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>لا توجد منتجات</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>لم نجد قطع تطابق بحثك</p>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          } : {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: viewMode === 'list' ? 'flex' : 'block',
                  gap: viewMode === 'list' ? 16 : 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Product Image */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  height: viewMode === 'list' ? 'auto' : 180,
                  width: viewMode === 'list' ? 140 : '100%',
                  minHeight: viewMode === 'list' ? 120 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ padding: 14, flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: `${getCategoryColor(product.category)}18`,
                      color: getCategoryColor(product.category),
                      fontWeight: 700,
                    }}>
                      {getCategoryName(product.category)}
                    </span>
                    {product.stock <= 3 && product.stock > 0 && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(245,158,11,0.12)',
                        color: '#f59e0b',
                        fontWeight: 700,
                      }}>
                        آخر {product.stock} قطع
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span style={{
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(239,68,68,0.12)',
                        color: '#ef4444',
                        fontWeight: 700,
                      }}>
                        غير متوفر
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{product.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
                    {product.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>
                      {product.price.toLocaleString()} دج
                    </span>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="btn btn-accent btn-sm"
                      disabled={product.stock === 0}
                      style={{ gap: 6 }}
                    >
                      <ShoppingCart size={14} />
                      اشتري الآن
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
