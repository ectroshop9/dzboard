import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Package, Loader2, Shield, Truck } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      navigate('/checkout', {
        state: {
          items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }]
        }
      });
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}><Loader2 size={40} className="spin" /></div>;
  if (!product) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', direction: 'rtl' }}><div style={{ textAlign: 'center' }}><Package size={48} /><p>المنتج غير موجود</p><Link to="/store" className="btn btn-primary">المتجر</Link></div></div>;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui', direction: 'rtl' }}>
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
          <div style={{ padding: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#222', marginBottom: 8 }}>{product.name}</h1>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>{product.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#ff6600' }}>{product.price?.toLocaleString('en-US')} دج</span>
                {product.stock > 0 && <p style={{ fontSize: 12, color: '#0a0', marginTop: 4 }}>✓ {product.stock} قطعة متوفرة</p>}
              </div>
              <button onClick={handleBuyNow} disabled={!product.stock} style={{ padding: '12px 24px', background: product.stock ? '#ff6600' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: product.stock ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={18} /> اشتري الآن
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 12, color: '#999', justifyContent: 'center' }}>
          <span><Shield size={12} /> دفع عند الاستلام</span>
          <span><Truck size={12} /> توصيل لـ 58 ولاية</span>
        </div>
      </div>
    </div>
  );
}
