import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Package, Loader2, Shield, Truck, Plus, Minus, AlertCircle } from 'lucide-react';

const API = 'https://dzboard.onrender.com/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    fetch(`${API}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.success && data.product) {
            setProduct(data.product);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product?.stock && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleBuyNow = () => {
    if (product) {
      navigate('/checkout', {
        state: {
          items: [{
            id: product.id || product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
          }]
        }
      });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#2563eb', marginBottom: 12 }} />
        <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>جاري تحميل تفاصيل المنتج...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 32, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: 400, width: '90%' }}>
          <Package size={56} style={{ color: '#94a3b8', marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, color: '#0f172a', fontWeight: 800, marginBottom: 8 }}>المنتج غير موجود</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>عذراً، تعذر العثور على المنتج المطلوب أو ربما تم إزالته.</p>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const numericPrice = parseFloat(product.price) || 0;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      
      {/* Header Bar */}
      <header style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 13 }}
          >
            <ChevronRight size={18} /> العودة
          </button>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>تفاصيل المنتج</span>
          <div style={{ width: 60 }} />
        </div>
      </header>

      {/* Product Content Container */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          
          {/* Image Banner */}
          <div style={{ background: '#fafafa', padding: 20, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <img
              src={product.image || 'https://via.placeholder.com/400?text=No+Image'}
              alt={product.name}
              style={{ width: '100%', height: 'auto', maxHeight: 360, objectFit: 'contain', borderRadius: 8 }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
            />
          </div>

          {/* Details Section */}
          <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 12, lineHeight: 1.4 }}>{product.name}</h1>
            
            <p style={{ color: '#475569', fontSize: 14, marginBottom: 24, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {product.description || 'لا يوجد وصف إضافي متوفر لهذا المنتج حالياً.'}
            </p>

            {/* Price & Quantity Box */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 26, fontWeight: 900, color: '#2563eb' }}>
                    {(numericPrice * quantity).toLocaleString('en-US')} دج
                  </span>
                  {!isOutOfStock ? (
                    <p style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: 700 }}>
                      ✓ متوفر بالمخزون {product.stock ? `(${product.stock} قطعة)` : ''}
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 700 }}>
                      ✕ غير متوفر حالياً
                    </p>
                  )}
                </div>

                {/* Counter */}
                {!isOutOfStock && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      style={{ padding: '10px 14px', background: '#f8fafc', border: 'none', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 18px', fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={product.stock && quantity >= product.stock}
                      style={{ padding: '10px 14px', background: '#f8fafc', border: 'none', cursor: (product.stock && quantity >= product.stock) ? 'not-allowed' : 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isOutOfStock ? '#94a3b8' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'background 0.2s'
                }}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'المنتج غير متوفر' : 'طلب المنتج (الدفع عند الاستلام)'}
              </button>
            </div>
          </div>
        </div>

        {/* Value Badges */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 13, color: '#475569', justifyContent: 'center', background: '#fff', padding: '14px 20px', borderRadius: 12, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><Shield size={18} style={{ color: '#059669' }} /> الدفع بعد المعاينة والاستلام</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><Truck size={18} style={{ color: '#2563eb' }} /> التوصيل سريع لـ 58 ولاية</span>
        </div>
      </main>
    </div>
  );
}