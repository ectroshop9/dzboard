import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, Zap, Monitor, Package, Wrench, ChevronLeft, Shield, Truck, Star, Search
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBrand, setSearchBrand] = useState('ALL');

  const slides = [
    { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200', title: 'كرت تيكون (T-Con)', subtitle: 'جميع بوردات T-Con لجميع أحجام وأنواع الشاشات' },
    { image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200', title: 'اليمونتاسيون (Power Supply)', subtitle: 'باور سبلاي وبوردات تغذية أصلية ومجربة' },
    { image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200', title: 'قطع غيار وشاشات أصلية', subtitle: 'مين بورد، مساطر ليد وقطع غيار بأسعار منافسة' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return;
    const revealElement = (el) => el.classList.add('is-visible');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { revealElement(entry.target); observer.unobserve(entry.target); } });
    }, { threshold: 0.15 });
    elements.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight * 0.9) revealElement(el); else observer.observe(el); });
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
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6', desc: 'كرت T-Con لجميع الشاشات' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b', desc: 'باور سبلاي وبوردة التغذية' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1', desc: 'البوردات الرئيسية' },
    { key: 'parts', label: 'قطع غيار وليد', icon: Package, color: '#10b981', desc: 'مساطر LED وإكسسوارات الصيانة' },
  ];

  const features = [
    { icon: Shield, title: 'قطع أصلية ومختبرة', description: 'جميع البوردات مختبرة مع ضمان الإرجاع.' },
    { icon: Truck, title: 'توصيل لـ 58 ولاية', description: 'توصيل سريع عبر شركات توصيل موثوقة.' },
    { icon: Wrench, title: 'دعم تقني متخصص', description: 'فريق تقني يساعدك في اختيار القطعة المناسبة.' },
    { icon: Star, title: 'الدفع عند الاستلام', description: 'لا تدفع شيئاً حتى تستلم طلبيتك.' },
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
    <div style={{ background: '#1e293b', color: '#1e293b', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#3b82f6', fontWeight: 900, fontSize: '22px' }}>DZ</span>
            <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '22px' }}>Board</span>
          </Link>
          <Link to="/store" className="btn btn-primary btn-sm">المتجر</Link>
        </div>
      </nav>

      <header style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <div key={index} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1e293b 5%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.85) 100%)' }} />
          </div>
        ))}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 16px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, marginBottom: '8px', color: '#fff' }}>{slides[currentSlide].title}</h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '20px' }}>{slides[currentSlide].subtitle}</p>
          <Link to="/store" className="btn btn-accent btn-lg" style={{ gap: 6 }}>تصفح القطع <ChevronLeft size={18} /></Link>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: currentSlide === i ? 24 : 8, height: 8, borderRadius: 4, border: 'none', background: currentSlide === i ? '#f59e0b' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </header>

      <section style={{ marginTop: '-40px', position: 'relative', zIndex: 20, padding: '0 16px 20px 16px' }}>
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto', padding: '24px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select value={searchBrand} onChange={e => setSearchBrand(e.target.value)} className="field-input" style={{ minWidth: 130, width: 'auto' }}>
              <option value="ALL">كل الماركات</option>
              {brands.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
            </select>
            <div style={{ flex: 1, position: 'relative', minWidth: 220 }}>
              <input type="text" placeholder="أدخل رقم البوردة أو موديل التلفزيون..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="field-input" />
              <Search size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>بحث <Search size={16} /></button>
          </form>
        </div>
      </section>

      <section style={{ background: '#ffffff', padding: '40px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 6 }}>تصنيفات القطع</h2>
          <p data-reveal style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginBottom: 28 }}>تصفح القطع حسب النوع</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={() => navigate(`/store?category=${cat.key}`)} className="card" data-reveal style={{ padding: 28, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'inherit', background: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 14 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ background: `${cat.color}18`, color: cat.color, margin: '0 auto 14px auto', width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={28} /></div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{cat.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: '#1e293b', padding: '40px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 24 }}>لماذا يفضل التقنيون DZBoard؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card" data-reveal style={{ padding: 24, textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1', marginBottom: 12, width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} /></div>
                  <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ background: '#ffffff', padding: '36px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 data-reveal style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', marginBottom: 20 }}>ندعم القطع لأشهر الماركات</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {brands.map((brand, i) => (
              <button key={i} onClick={() => navigate(`/store?brand=${brand.code}`)} className="card" data-reveal style={{ padding: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'inherit', background: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 10 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <img src={brand.image} alt={brand.name} style={{ width: 50, height: 35, objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal style={{ background: '#1e293b', padding: '40px 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: '#f59e0b' }}>لم تجد القطعة المناسبة؟</h2>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>تواصل مع فريق الدعم الفني لدينا مباشرة.</p>
        <Link to="/store" className="btn btn-accent btn-lg" style={{ gap: 8 }}>تصفح كافة القطع <ChevronLeft size={18} /></Link>
      </section>

      <footer style={{ background: '#f1f5f9', color: '#94a3b8', borderTop: '1px solid #e2e8f0', padding: '32px 16px 20px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 8 }}>DZ<span style={{ color: '#f59e0b' }}>Board</span></div>
        <p style={{ fontSize: 12, marginBottom: 16 }}>متجر قطع غيار الشاشات الأول في الجزائر.</p>
        <Link to="/store" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12 }}>المتجر</Link>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #ffffff', fontSize: 11 }}>&copy; {new Date().getFullYear()} DZBoard.</div>
      </footer>

      <a href="https://m.me/dzboard" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: 24, left: 24, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #0084FF, #00C6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,132,255,0.45)', zIndex: 40, transition: 'all 0.3s', color: '#fff' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.45 5.513 3.714 7.214V22l3.355-1.843c.928.257 1.91.397 2.931.397 5.523 0 10-4.145 10-9.296C22 6.145 17.523 2 12 2zm1.193 12.48l-2.556-2.727-4.99 2.727 5.49-5.823 2.622 2.727 4.925-2.727-5.491 5.823z"/></svg>
      </a>
    </div>
  );
}
