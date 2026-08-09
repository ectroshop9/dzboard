import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Package, Loader2, Shield, Truck, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data.success) setProduct(data.product);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        if (isMounted) setLoading(false);
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
            id: product.id,
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#ff6600' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', direction: 'rtl', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Package size={56} style={{ color: '#999', marginBottom: 12 }} />
          <h2 style={{ fontSize: 18, color: '#333', marginBottom: 16 }}>المنتج غير موجود أو تم حذفه</h2>
          <Link to="/store" style={{ display: 'inline-block', padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>العودة للمتجر</Link>
        </div>
      </div>
    );
  }

  const numericPrice = parseFloat(product.price) || 0;
  const isOutOfStock = !product.stock || product.stock <= 0;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui', direction: 'rtl' }}>
      {/* هيدر العلوي */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={22} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#444', marginRight: 8 }}>تفاصيل القطعة</span>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <img
            src={product.image || 'https://via.placeholder.com/400'}
            alt={product.name}
            style={{ width: '100%', height: 'auto', maxHeight: 350, objectFit: 'contain', background: '#fafafa' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
          />

          <div style={{ padding: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#222', marginBottom: 10, lineHeight: 1.4 }}>{product.name}</h1>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{product.description || 'لا يوجد وصف إضافي للمنتج.'}</p>

            {/* محدد السعر والكمية */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#ff6600' }}>
                    {(numericPrice * quantity).toLocaleString('en-US')} دج
                  </span>
                  {!isOutOfStock ? (
                    <p style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 600 }}>✓ متوفر في المخزون ({product.stock} قطعة)</p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>✕ غير متوفر حالياً</p>
                  )}
                </div>

                {/* أزرار زيادة/نقصان الكمية */}
                {!isOutOfStock && (
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      style={{ padding: '8px 12px', background: '#f8fafc', border: 'none', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', color: '#333' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0 16px', fontWeight: 700, fontSize: 15, color: '#222' }}>{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      style={{ padding: '8px 12px', background: '#f8fafc', border: 'none', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', color: '#333' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* زر الشراء */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isOutOfStock ? '#ccc' : '#ff6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(255,102,0,0.2)'
                }}
              >
                <ShoppingCart size={20} /> {isOutOfStock ? 'المنتج نفد من المخزون' : 'اشتري الآن (الدفع عند الاستلام)'}
              </button>
            </div>
          </div>
        </div>

        {/* الميزات الشاملة */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 13, color: '#666', justifyContent: 'center', background: '#fff', padding: 12, borderRadius: 10, border: '1px solid #eee' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={16} style={{ color: '#10b981' }} /> دفع عند الاستلام</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={16} style={{ color: '#3b82f6' }} /> توصيل لـ 58 ولاية</span>
        </div>
      </div>
    </div>
  );
}