import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Zap, Monitor, Package, Wrench, ChevronLeft, Shield, Truck, Star, Search } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBrand, setSearchBrand] = useState('ALL');

  const slides = [
    { image: '/hero/tcon.jpg', title: 'كرت تيكون (T-Con)', subtitle: 'جميع بوردات T-Con لجميع أنواع الشاشات' },
    { image: '/hero/parts.jpg', title: 'اليمونتاسيون (Power Supply)', subtitle: 'باور سبلاي وبوردات تغذية أصلية' },
    { image: '/hero/parts.jpg', title: 'قطع غيار شاشات أصلية', subtitle: 'أسعار منافسة وتوصيل لـ 58 ولاية' },
  ];

  // التبديل التلقائي للسلايدر
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 4000);
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
    { icon: Shield, title: 'قطع أصلية', description: 'جميع القطع مختبرة ومضمونة.' },
    { icon: Truck, title: 'توصيل 58 ولاية', description: 'توصيل سريع لكل الولايات.' },
    { icon: Wrench, title: 'دعم تقني', description: 'فريق متخصص يساعدك.' },
    { icon: Star, title: 'الدفع عند الاستلام', description: 'ادفع لما تستلم.' },
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
    <div style={{ background: '#fff', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      {/* الشريط العلوي Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: 22, fontWeight: 900 }}>
            <span style={{ color: '#3b82f6' }}>DZ</span><span style={{ color: '#f59e0b' }}>Board</span>
          </Link>
          <Link to="/store" style={{ background: '#3b82f6', color: '#fff', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>المتجر</Link>
        </div>
      </nav>

      {/* الهيدر السلايدر Hero Section */}
      <header style={{ position: 'relative', height: '420px', overflow: 'hidden', background: '#0f172a' }}>
        {slides.map((slide, index) => (
          <div key={index} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.65)' }} />
          </div>
        ))}
        
        {/* المحتوى التفاعلي للسلايدر */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 16px', color: '#fff' }}>
          <h1 style={{ fontSize: 'calc(20px + 1.5vw)', fontWeight: 900, marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{ fontSize: 16, color: '#cbd5e1', marginBottom: 24, maxWidth: 500 }}>
            {slides[currentSlide].subtitle}
          </p>
          
          <Link to="/store" style={{ background: '#f59e0b', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
            تصفح المتجر <ChevronLeft size={18} />
          </Link>
        </div>
      </header>

      {/* نموذج البحث السريع */}
      <section style={{ maxWidth: 850, margin: '-40px auto 0', padding: '0 16px', position: 'relative', zIndex: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select value={searchBrand} onChange={e => setSearchBrand(e.target.value)} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', minWidth: 130, flex: '1 1 130px', outline: 'none' }}>
              <option value="ALL">كل الماركات</option>
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <div style={{ flex: '2 1 220px', position: 'relative' }}>
              <input type="text" placeholder="ابحث برقم البوردة أو الموديل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 40px 12px 12px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }} />
              <Search size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', flex: '1 1 100px' }}>بحث</button>
          </form>
        </div>
      </section>

      {/* التصنيفات */}
      <section style={{ padding: '50px 16px 30px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 28 }} className="reveal-item">تصنيفات القطع</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} data-reveal onClick={() => navigate(`/store?category=${cat.key}`)} className="reveal-item" style={{ padding: 24, textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ background: `${cat.color}18`, color: cat.color, margin: '0 auto 14px', width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={28} /></div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{cat.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* الميزات */}
      <section style={{ background: '#f8fafc', padding: '40px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 24 }} className="reveal-item">لماذا DZBoard؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} data-reveal className="reveal-item" style={{ padding: 20, textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon size={22} /></div>
                  <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* أشهر الماركات المتجاوبة */}
      <section style={{ padding: '36px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 20 }} className="reveal-item">أشهر الماركات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {brands.map((brand, i) => (
              <button key={i} data-reveal onClick={() => navigate(`/store?brand=${brand.code}`)} className="reveal-item" style={{ padding: '12px 8px', textAlign: 'center', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <img 
                  src={brand.image} 
                  alt={brand.name} 
                  style={{ maxWidth: 70, maxHeight: 35, objectFit: 'contain' }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerText = brand.name;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* دعوة لاتخاذ إجراء CTA */}
      <section data-reveal className="reveal-item" style={{ background: '#f8fafc', padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>جاهز تطلب؟</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>توصيل لكل الولايات - الدفع عند الاستلام</p>
        <Link to="/store" style={{ background: '#f59e0b', color: '#fff', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, display: 'inline-block' }}>تصفح المتجر</Link>
      </section>

      {/* الفوتر */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></div>
        <p style={{ fontSize: 12, color: '#64748b' }}>متجر قطع غيار الشاشات الأول في الجزائر</p>
        <div style={{ marginTop: 16, fontSize: 11, color: '#94a3b8' }}>&copy; {new Date().getFullYear()} DZBoard.</div>
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
      `}</style>
    </div>
  );
}