import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingCart, Package, Monitor, Zap, Cpu, Grid, List, X, Download, Plus, Minus, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [quantities, setQuantities] = useState({});

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const categories = [
    { key: 'all', label: 'الكل', icon: Grid, color: '#94a3b8' },
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
    { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
  ];

  // ✅ تنقية النص من XSS
  const sanitizeText = (text) => {
    if (!text) return '';
    return String(text).replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
  };

  const searchInProduct = (product, query) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const fields = [
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
    const text = fields.filter(Boolean).join(' ').toLowerCase();
    return text.includes(q);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (debouncedQuery) params.set('q', debouncedQuery);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, debouncedQuery, setSearchParams]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getProducts()
      .then(data => {
        if (isMounted) {
          if (data && data.success) {
            let filtered = [...(data.products || [])];
            if (selectedCategory !== 'all') {
              filtered = filtered.filter(p => p.category === selectedCategory);
            }
            if (debouncedQuery) {
              filtered = filtered.filter(p => searchInProduct(p, debouncedQuery));
            }
            setProducts(filtered);
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedCategory, debouncedQuery]);

  // ✅ تغيير الكمية مع حماية
  const changeQuantity = (e, productId, delta) => {
    e.stopPropagation();
    setQuantities(prev => {
      const current = parseInt(prev[productId]) || 1;
      const stock = parseInt(products.find(p => p.id === productId)?.stock) || 0;
      const max = Math.max(1, stock);
      const newQty = Math.max(1, Math.min(current + delta, max));
      return { ...prev, [productId]: newQty };
    });
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    const qty = parseInt(quantities[product.id]) || 1;
    const safeQty = Math.max(1, qty);
    navigate('/checkout', {
      state: {
        items: [{ 
          id: product.id, 
          name: sanitizeText(product.name || product.title), 
          price: parseFloat(product.price) || 0, 
          quantity: safeQty, 
          image: product.image 
        }]
      }
    });
  };

  // ✅ فتح رابط آمن
  const handleDownloadUpdate = (e, product) => {
    e.stopPropagation();
    if (product.file_url && product.file_url.startsWith('https://')) {
      window.open(product.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', system-ui, sans-serif", paddingBottom: 40 }}>
      
      {/* ✅ شريط ترويجي أحمر */}
      <div style={{
        background: '#dc2626',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          🚚 توصيل 58 ولاية
        </span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          💵 الدفع عند الاستلام
        </span>
        </div>
      </div>
      
      {/* الهيدر العلوي - بدون "الرئيسية" و"المتجر" */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '10px 12px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
            <ChevronLeft size={18} /> الرئيسية
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1 }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 20,
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                color: '#334155',
                flexShrink: 0
              }}
            >
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <input
                type="text"
                placeholder="ابحث بالاسم، الموديل، الرقم..."
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
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 20, padding: '7px 10px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}
            >
              {viewMode === 'grid' ? <List size={14} /> : <Grid size={14} />}
            </button>
          </div>
        </div>



      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 12px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div></div>
          {selectedCategory !== 'all' && (
            <button onClick={() => setSelectedCategory('all')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              عرض الكل
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} style={{ background: '#fff', borderRadius: 12, height: 220, border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
            <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
      @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, textAlign: 'center', padding: '48px 16px' }}>
            <Package size={44} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#334155', margin: 0 }}>لم يتم العثور على قطع متطابقة</h3>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 16 }}>جرب تغيير عبارات البحث</p>
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
              const isAvailable = parseInt(product.stock) > 0;
              const hasUpdate = product.file_url && product.file_url.startsWith('https://');
              const isParts = product.category === 'parts';
              const qty = parseInt(quantities[product.id]) || 1;
              const totalPrice = numericPrice * qty;
              const safeName = sanitizeText(product.name || product.title);
              const safeDescription = sanitizeText(product.description || 'قطعة غيار إلكترونية');

              return (
                <div
                  key={product.id}
                  onClick={() => navigate('/checkout', { state: { items: [{ id: product.id, name: safeName, price: numericPrice, quantity: isParts ? qty : 1, image: product.image }] } })}
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
                      alt={safeName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=صورة+غير+متاحة'; }}
                    />
                  </div>

                  <div style={{ padding: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 6 }}>
                    <div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a', lineHeight: 1.3 }}>
                        {safeName}
                      </h2>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {safeDescription}
                      </p>
                    </div>

                    {isParts && isAvailable && (
                      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '4px 0' }}>
                        <button onClick={(e) => changeQuantity(e, product.id, -1)} style={{ width: 28, height: 28, borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 800, minWidth: 30, textAlign: 'center' }}>{qty}</span>
                        <button onClick={(e) => changeQuantity(e, product.id, 1)} style={{ width: 28, height: 28, borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6, borderTop: '1px dashed #f1f5f9', flexWrap: 'wrap', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#d97706' }}>
                        {totalPrice.toLocaleString('en-US')} <span style={{ fontSize: 10 }}>دج</span>
                      </span>

                      <div style={{ display: 'flex', gap: 4 }}>
                        {hasUpdate && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/download?product=${product.id}`); }}
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
                            <Download size={13} /> تحميل
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