import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Zap, Monitor, Package, Wrench, ChevronLeft, Shield, Truck, Star, Search, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBrand, setSearchBrand] = useState('ALL');
  
  // حالة المنتجات المميزة
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const slides = [
    { image: '/hero/tcon.jpg', title: 'كرت تيكون (T-Con)', subtitle: 'جميع بوردات T-Con لجميع أنواع الشاشات متوفرة لدينا' },
    { image: '/hero/parts.jpg', title: 'اليمونتاسيون (Power Supply)', subtitle: 'باور سبلاي وبوردات تغذية أصلية ومجربة' },
    { image: '/hero/parts.jpg', title: 'قطع غيار شاشات أصلية', subtitle: 'أسعار منافسة وتوصيل سريع لـ 58 ولاية' },
  ];

  // جلب المنتجات المميزة من الـ API
  useEffect(() => {
    let isMounted = true;
    api.getProducts()
      .then(data => {
        if (isMounted && data && data.success) {
          // جلب أول 4 منتجات فقط
          setFeaturedProducts((data.products || []).slice(0, 4));
        }
      })
      .catch(err => console.error('Error fetching featured products:', err))
      .finally(() => { if (isMounted) setLoadingProducts(false); });

    return () => { isMounted = false; };
  }, []);

  // التبديل التلقائي للسلايدر
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // مراقب أنيميشن الظهور عند التمرير (Intersection Observer)
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
  }, []);

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
    { icon: Star, title: 'الدفع عند الاستلام', description: 'ادفع عند معايتة واستلام طلبك.' },
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
  ];

  return (
    <div style={{ background: '#fff', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* الشريط العلوي Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900 }}>
            <span style={{ color: '#3b82f6' }}>DZ</span><span style={{ color: '#f59e0b' }}>Board</span>
          </Link>
          <Link to="/store" style={{ background: '#3b82f6', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            المتجر الكامل
          </Link>
        </div>
      </nav>

      {/* الهيدر السلايدر Hero Section */}
      <header style={{ position: 'relative', height: '420px', overflow: 'hidden', background: '#0f172a' }}>
        {slides.map((slide, index) => (
          <div key={index} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.85) 100%)' }} />
          </div>
        ))}
        
        {/* المحتوى التفاعلي للسلايدر */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 16px', color: '#fff' }}>
          <h1 style={{ fontSize: 'calc(22px + 1.2vw)', fontWeight: 900, marginBottom: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1', marginBottom: 24, maxWidth: 520, lineHeight: 1.5 }}>
            {slides[currentSlide].subtitle}
          </p>
          
          <Link to="/store" style={{ background: '#f59e0b', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>
            تصفح جميع القطع <ChevronLeft size={18} />
          </Link>

          {/* مؤشرات السلايدر */}
          <div style={{ display: 'flex', gap: 8, position: 'absolute', bottom: 60 }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: currentSlide === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentSlide === idx ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* نموذج البحث السريع */}
      <section style={{ maxWidth: 850, margin: '-40px auto 0', padding: '0 16px', position: 'relative', zIndex: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select 
              value={searchBrand} 
              onChange={e => setSearchBrand(e.target.value)} 
              style={{ padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', minWidth: 130, flex: '1 1 130px', outline: 'none', fontSize: 13, color: '#334155', cursor: 'pointer' }}
            >
              <option value="ALL">كل الماركات</option>
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>

            <div style={{ flex: '2 1 220px', position: 'relative' }}>
              <input 
                type="text" 
                placeholder="ابحث برقم البوردة، الموديل أو نوع القطعة..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                style={{ width: '100%', padding: '12px 36px 12px 36px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontSize: 13 }} 
              />
              <Search size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', flex: '1 1 100px', fontSize: 14 }}>
              بحث
            </button>
          </form>
        </div>
      </section>

      {/* تصنيفات القطع */}
      <section style={{ padding: '50px 16px 30px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 28, color: '#0f172a' }} className="reveal-item">
            تصنيفات القطع
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} data-reveal onClick={() => navigate(`/store?category=${cat.key}`)} className="reveal-item" style={{ padding: 22, textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ background: `${cat.color}15`, color: cat.color, margin: '0 auto 12px', width: 54, height: 54, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={26} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{cat.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* قسم المنتجات المضافة حديثاً / المميزة */}
      <section style={{ padding: '20px 16px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>أحدث القطع المتوفرة</h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>قطع مجربة وجاهزة للشحن المباشر</p>
            </div>
            <Link to="/store" style={{ color: '#2563eb', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              عرض الكل <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>

          {loadingProducts ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ background: '#fff', height: 220, borderRadius: 12, border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite ease-in-out' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {featuredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ height: 120, background: '#fafafa', borderRadius: 8, overflow: 'hidden', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name || product.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#d97706' }}>
                        {(parseFloat(product.price) || 0).toLocaleString()} <span style={{ fontSize: 10 }}>دج</span>
                      </span>
                      <span style={{ color: '#3b82f6', background: '#eff6ff', padding: 6, borderRadius: 6 }}>
                        <ShoppingCart size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* الميزات والضمانات */}
      <section style={{ padding: '40px 16px' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 24 }} className="reveal-item">
            لماذا يفضل التقنيون التعامل مع DZBoard؟
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} data-reveal className="reveal-item" style={{ padding: 20, textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.4 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* أشهر الماركات المتجاوبة */}
      <section style={{ padding: '36px 16px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 20 }} className="reveal-item">
            قطع متوافقة مع جميع الماركات
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {brands.map((brand, i) => (
              <button key={i} data-reveal onClick={() => navigate(`/store?brand=${brand.code}`)} className="reveal-item" style={{ padding: '12px 8px', textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <img 
                  src={brand.image} 
                  alt={brand.name} 
                  style={{ maxWidth: 70, maxHeight: 35, objectFit: 'contain' }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = brand.name;
                    e.target.parentNode.style.fontWeight = '700';
                    e.target.parentNode.style.color = '#334155';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* دعوة لاتخاذ إجراء CTA */}
      <section data-reveal className="reveal-item" style={{ background: '#0f172a', padding: '48px 16px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>هل تبحث عن قطعة غيار نادرة؟</h2>
        <p style={{ color: '#cbd5e1', marginBottom: 24, fontSize: 14 }}>نوفر لك البوردات الأصلية مع إمكانية التوصيل والدفع عند الاستلام</p>
        <Link to="/store" style={{ background: '#f59e0b', color: '#fff', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, display: 'inline-block', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
          تصفح المتجر الآن
        </Link>
      </section>

      {/* الفوتر */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></div>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>متجر قطع غيار الشاشات الأول في الجزائر</p>
        <div style={{ marginTop: 16, fontSize: 11, color: '#94a3b8' }}>&copy; {new Date().getFullYear()} DZBoard. جميع الحقوق محفوظة.</div>
      </footer>

      {/* زر Messenger الثابت */}
      <a href="https://m.me/dzboard" target="_blank" rel="noopener noreferrer" aria-label="Messenger Support" style={{ position: 'fixed', bottom: 24, left: 24, width: 56, height: 56, borderRadius: '50%', background: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,132,255,0.4)', zIndex: 40, color: '#fff' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.45 5.513 3.714 7.214V22l3.355-1.843c.928.257 1.91.397 2.931.397 5.523 0 10-4.145 10-9.296C22 6.145 17.523 2 12 2zm1.193 12.48l-2.556-2.727-4.99 2.727 5.49-5.823 2.622 2.727 4.925-2.727-5.491 5.823z"/></svg>
      </a>

      {/* تحسين كلاسات الأنيميشن */}
      <style>{`
        .reveal-item {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .reveal-item.is-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes pulse { 
          0% { opacity: 0.6; } 
          50% { opacity: 0.3; } 
          100% { opacity: 0.6; } 
        }
      `}</style>
    </div>
  );
}