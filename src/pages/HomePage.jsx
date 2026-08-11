import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Zap, Monitor, Package, Wrench, Shield, Truck, Star, Search, X, TrendingUp, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBrand, setSearchBrand] = useState('ALL');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [brokenBrands, setBrokenBrands] = useState({});

  const slides = [
    { image: '/hero/tcon.jpg' },
    { image: '/hero/parts.jpg' },
    { image: '/hero/parts.jpg' },
  ];

  useEffect(() => {
    let isMounted = true;
    api.getProducts().then(data => {
      if (isMounted && data?.success) setFeaturedProducts((data.products || []).slice(0, 4));
    }).finally(() => { if (isMounted) setLoadingProducts(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { 
        if (entry.isIntersecting) { 
          entry.target.classList.add('is-visible'); 
          observer.unobserve(entry.target); 
        } 
      });
    }, { threshold: 0.1 });
    elements.forEach(el => { 
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [featuredProducts, loadingProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (searchBrand !== 'ALL') params.append('brand', searchBrand);
    navigate(`/store?${params.toString()}`);
  };

  const categories = [
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1' },
    { key: 'parts', label: 'قطع غيار', icon: Package, color: '#10b981' },
  ];

  const features = [
    { icon: Shield, title: 'قطع أصلية', description: 'جميع القطع مجربة ومضمونة.' },
    { icon: Truck, title: 'توصيل 58 ولاية', description: 'توصيل سريع وموثوق.' },
    { icon: Wrench, title: 'دعم تقني', description: 'فريق متخصص لمساعدتك.' },
    { icon: Star, title: 'الدفع عند الاستلام', description: 'ادفع عند معاينة واستلام طلبك.' },
    { icon: Zap, title: 'سرعة التوصيل', description: 'توصيل خلال 24-72 ساعة.' }, 
    { icon: TrendingUp, title: 'أسعار تنافسية', description: 'أفضل الأسعار في السوق.' },
  ];

  const brands = [
    { name: 'Samsung', code: 'samsung', image: '/brands/samsung.png' },
    { name: 'LG', code: 'lg', image: '/brands/lg.png' },
    { name: 'Condor', code: 'condor', image: '/brands/condor.png' },
    { name: 'Iris', code: 'iris', image: '/brands/iris.png' },
    { name: 'Geant', code: 'geant', image: '/brands/geant.png' },
    { name: 'Stream', code: 'stream', image: '/brands/stream.png' },
    { name: 'Maxtor', code: 'maxtor', image: '/brands/maxtor.png' },
    { name: 'Kiowa', code: 'kiowa', image: '/brands/kiowa.png' },
    { name: 'TCL', code: 'tcl', image: '/brands/tcl.png' },
    { name: 'Toshiba', code: 'toshiba', image: '/brands/toshiba.png' },
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* هيدر العلوي */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900 }}>
            <span style={{ color: '#3b82f6' }}>DZ</span><span style={{ color: '#f59e0b' }}>Board</span>
          </Link>
          <Link to="/store" style={{ background: '#3b82f6', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>المتجر</Link>
        </div>
      </nav>

      {/* سلايدر البانر */}
      <header className="hero-banner" style={{ position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        {slides.map((slide, index) => (
          <div key={index} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
          </div>
        ))}
      </header>

      {/* صندوق البحث المتجاوب */}
      <section style={{ maxWidth: 850, margin: '-50px auto 0', padding: '0 16px', position: 'relative', zIndex: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '14px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSearchSubmit} className="search-form-grid" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select value={searchBrand} onChange={e => setSearchBrand(e.target.value)} style={{ padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', outline: 'none', fontSize: 13, color: '#334155', cursor: 'pointer' }} className="search-brand-select">
              <option value="ALL">كل الماركات</option>
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <input type="text" placeholder="ابحث برقم البوردة، الموديل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 36px 12px 36px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontSize: 13 }} />
              <Search size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}><X size={16} /></button>}
            </div>
            
            <button type="submit" className="search-btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>بحث</button>
          </form>
        </div>
      </section>

      {/* تصنيفات القطع */}
      <section style={{ padding: '40px 16px 20px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, textAlign: 'center', marginBottom: 20, color: '#0f172a' }} className="reveal-item">تصنيفات القطع</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, maxWidth: 700, margin: '0 auto' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} data-reveal onClick={() => navigate(`/store?category=${cat.key}`)} className="reveal-item" style={{ padding: 14, textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = cat.color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                  <div style={{ background: `${cat.color}15`, color: cat.color, margin: '0 auto 10px', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} /></div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{cat.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* أحدث القطع المتوفرة */}
      <section style={{ padding: '20px 16px 30px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 900, color: '#0f172a', margin: 0 }}>أحدث القطع المتوفرة</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>قطع مجربة وجاهزة للشحن المباشر</p>
          </div>
          {loadingProducts ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {[1, 2, 3, 4].map(n => <div key={n} style={{ background: '#fff', height: 220, borderRadius: 12, border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {featuredProducts.map(product => (
                <div key={product.id} onClick={() => navigate('/checkout', { state: { items: [{ id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }] } })} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                  <div>
                    <div style={{ height: 110, background: '#fafafa', borderRadius: 8, overflow: 'hidden', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name || product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name || product.title}</h3>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>
                      {(parseFloat(product.price) || 0).toLocaleString('en-US')} <span style={{ fontSize: 10 }}>دج</span>
                    </div>
                  </div>
                  <button style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span>اشتري الآن</span>
                    <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* المميزات */}
      <section style={{ padding: '30px 16px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 'clamp(17px, 3.5vw, 20px)', fontWeight: 900, textAlign: 'center', marginBottom: 20 }} className="reveal-item">لماذا يفضل التقنيون التعامل مع DZBoard؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, maxWidth: 700, margin: '0 auto' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} data-reveal className="reveal-item" style={{ padding: 14, textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}><Icon size={20} /></div>
                  <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>{f.title}</h3>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.4 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* شبكة الماركات */}
      <section style={{ padding: '24px 16px 20px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 'clamp(17px, 3.5vw, 20px)', fontWeight: 900, textAlign: 'center', marginBottom: 16 }} className="reveal-item">قطع متوافقة مع جميع الماركات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: 10 }}>
            {brands.map((brand, i) => (
              <button key={i} data-reveal onClick={() => navigate(`/store?brand=${brand.code}`)} className="reveal-item" style={{ padding: '10px 6px', textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, transition: 'all 0.2s', fontWeight: 700, fontSize: 12, color: '#334155' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {brokenBrands[brand.code] ? (
                  brand.name
                ) : (
                  <img src={brand.image} alt={brand.name} style={{ maxWidth: 60, maxHeight: 30, objectFit: 'contain' }} onError={() => setBrokenBrands(prev => ({ ...prev, [brand.code]: true }))} />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* قسم طلب قطعة خاصة */}
      <section style={{ padding: '16px 16px 10px' }}>
        <div data-reveal className="reveal-item custom-part-card" style={{ 
          maxWidth: 850, 
          margin: '0 auto', 
          background: '#ffffff', 
          border: '2px dashed #3b82f6', 
          borderRadius: 16, 
          padding: '20px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justify: 'space-between', 
          flexWrap: 'wrap', 
          gap: 14 
        }}>
          <div style={{ flex: '1 1 240px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
              لم تجد القطعة التي تبحث عنها؟
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              أرسل لنا تفاصيل وموديل القطعة وسنقوم بالبحث عنها وتوفيرها لك في أقرب وقت.
            </p>
          </div>
          
          <Link to="/request-part" style={{ 
            background: '#3b82f6', 
            color: '#fff', 
            padding: '10px 18px', 
            borderRadius: 10, 
            textDecoration: 'none', 
            fontWeight: 800, 
            fontSize: 13, 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 6, 
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          }}>
            <span>اطلب قطعة خاصة</span>
            <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </div>
      </section>

      {/* قسم الدعوة للشراء */}
      <section style={{ padding: '24px 16px 30px' }}>
        <div data-reveal className="reveal-item" style={{ maxWidth: 850, margin: '0 auto', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 16, padding: '28px 18px', textAlign: 'center', color: '#fff', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>هل تبحث عن قطعة غيار نادرة؟</h2>
            <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 13, maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.5 }}>نوفر لك البوردات الأصلية لمختلف الشاشات والماركات مع إمكانية التوصيل والدفع عند الاستلام.</p>
            <Link to="/store" style={{ background: '#3b82f6', color: '#fff', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              <span>تصفح المتجر الآن</span>
              <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* الفوتر */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '24px 16px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></div>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>متجر قطع غيار الشاشات الأول في الجزائر</p>
          <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px dashed #f1f5f9', paddingTop: 12 }}>&copy; {new Date().getFullYear()} DZBoard. جميع الحقوق محفوظة.</div>
        </div>
      </footer>

      {/* زر التواصل العائم */}
      <a href="https://m.me/dzboard" target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر ماسنجر" style={{ position: 'fixed', bottom: 20, left: 20, width: 48, height: 48, borderRadius: '50%', background: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,132,255,0.4)', zIndex: 40, color: '#fff', textDecoration: 'none' }}>
        <MessageCircle size={24} />
      </a>

      {/* استعلامات التجاوب والأنماط */}
      <style>{`
        .hero-banner { height: 240px; }
        .search-brand-select { flex: 1 1 120px; }
        .search-input-wrapper { flex: 2 1 200px; }
        .search-btn { flex: 1 1 90px; }

        @media (min-width: 640px) {
          .hero-banner { height: 350px; }
          .custom-part-card { padding: 24px 20px !important; }
        }

        @media (max-width: 480px) {
          .search-brand-select { flex: 1 1 100% !important; }
          .search-input-wrapper { flex: 1 1 100% !important; }
          .search-btn { flex: 1 1 100% !important; }
        }

        .reveal-item { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
        .reveal-item.is-visible { opacity: 1 !important; transform: translateY(0) !important; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}