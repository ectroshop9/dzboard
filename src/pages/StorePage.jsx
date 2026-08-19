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

  // ✅ دالة تطبيع النص للبحث الدقيق
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // توحيد المسافات
      .replace(/[أإآ]/g, 'ا') // توحيد الألف
      .replace(/ة/g, 'ه') // توحيد التاء المربوطة
      .replace(/ى/g, 'ي') // توحيد الياء
      .replace(/[^\w\s\u0600-\u06FF]/g, '') // إزالة الرموز الخاصة
      ;
  };

  // ✅ دالة البحث المتقدم
  const searchInProduct = (product, query) => {
    if (!query) return true;
    
    const normalizedQuery = normalizeText(query);
    const searchableFields = [
      product.name,
      product.title,
      product.description,
      product.category,
      product.brand,
      product.model,
      product.serial_number,
      product.code,
      product.sku
    ];
    
    const searchableText = normalizeText(searchableFields.filter(Boolean).join(' '));
    
    // البحث الكامل
    if (searchableText.includes(normalizedQuery)) return true;
    
    // البحث بالكلمات المتعددة
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);
    if (queryWords.length > 1) {
      return queryWords.every(word => searchableText.includes(word));
    }
    
    return false;
  };

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
            
            // ✅ البحث الدقيق محلياً
            if (debouncedQuery) {
              filtered = filtered.filter(p => searchInProduct(p, debouncedQuery));
            }
            
            // الترتيب
            if (sortBy === 'price-low') filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
            if (sortBy === 'price-high') filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
            if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            
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
              placeholder="ابحث بالاسم، الموديل، الرقم التسلسلي..."
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

      {/* باقي الكود كما هو */}
      {/* ... */}
    </div>
  );
}