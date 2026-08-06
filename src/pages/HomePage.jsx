import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Cpu, Zap, Monitor, Package, Wrench, ChevronLeft, Shield, Truck, Star, Sun, Moon, Search
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('dzboard_theme');
      if (savedTheme !== null) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBrand, setSearchBrand] = useState('ALL');

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200',
      title: 'كرت تيكون (T-Con)',
      subtitle: 'جميع بوردات T-Con لجميع أحجام وأنواع الشاشات',
    },
    {
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200',
      title: 'اليمونتاسيون (Power Supply)',
      subtitle: 'باور سبلاي وبوردات تغذية أصلية ومجربة',
    },
    {
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200',
      title: 'قطع غيار وشاشات أصلية',
      subtitle: 'مين بورد، مساطر ليد وقطع غيار بأسعار منافسة',
    },
  ];

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('dzboard_theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [isDark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return;

    const revealElement = (element) => { element.classList.add('is-visible'); };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { 
          revealElement(entry.target); 
          observer.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((element) => {
      const alreadyInView = element.getBoundingClientRect().top < window.innerHeight * 0.9;
      if (alreadyInView) { revealElement(element); } else { observer.observe(element); }
    });

    return () => observer.disconnect();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().replace(/[^\w\s\u0600-\u06FF-]/gi, '');
    if (!cleanQuery && searchBrand === 'ALL') {
      navigate('/store');
      return;
    }
    const params = new URLSearchParams();
    if (cleanQuery) params.append('q', cleanQuery);
    if (searchBrand !== 'ALL') params.append('brand', searchBrand);
    navigate(`/store?${params.toString()}`);
  };

  const categories = [
    { key: 'tcon', label: 'كرت تيكون', icon: Monitor, color: '#3b82f6', desc: 'كرت T-Con لجميع الشاشات' },
    { key: 'alimentation', label: 'اليمونتاسيون', icon: Zap, color: '#f59e0b', desc: 'باور سبلاي وبوردة التغذية' },
    { key: 'main-board', label: 'مين بورد', icon: Cpu, color: '#6366f1', desc: 'البوردات الرئيسية (Motherboards)' },
    { key: 'parts', label: 'قطع غيار وليد', icon: Package, color: '#10b981', desc: 'مساطر LED وإكسسوارات الصيانة' },
  ];

  const features = [
    { icon: Shield, title: 'قطع أصلية ومختبرة', description: 'جميع البوردات مختبرة دقيقاً من طرف تقنيين مع ضمان الإرجاع.' },
    { icon: Truck, title: 'توصيل لـ 58 ولاية', description: 'توصيل سريع وسريع إلى باب المنزل أو المقر عبر شركات توصيل موثوقة.' },
    { icon: Wrench, title: 'دعم تقني متخصص', description: 'فريق تقني يساعدك في التأكد من توافق رقم البوردة (Board Part Number).' },
    { icon: Star, title: 'الدفع عند الاستلام', description: 'لا تدفع شيئاً حتى تستلم طلبيتك وتفحصها بنفسك.' },
  ];

  const brands = [
    { name: 'Samsung', code: 'samsung' },
    { name: 'LG', code: 'lg' },
    { name: 'Condor', code: 'condor' },
    { name: 'Iris', code: 'iris' },
    { name: 'Geant', code: 'geant' },
    { name: 'Stream', code: 'stream' },
    { name: 'Maxtor', code: 'maxtor' },
    { name: 'Kiowa', code: 'kiowa' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, #f8fafc)', direction: 'rtl', minHeight: '100vh', fontFamily: "'Cairo', 'IBM Plex Sans Arabic', sans-serif" }}>
      
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50" style={{ background: 'var(--bg-secondary, #1e293b)', borderBottom: '1px solid var(--border, #334155)', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary, #6366f1)', fontWeight: 900, fontSize: '22px' }}>DZ</span>
            <span style={{ color: 'var(--accent, #f59e0b)', fontWeight: 900, fontSize: '22px' }}>Board</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setIsDark(!isDark)} 
              aria-label="تغيير المظهر"
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px 8px' }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/store" className="btn btn-primary btn-sm">المتجر</Link>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <header style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, var(--bg-primary, #0f172a) 5%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.85) 100%)',
            }} />
          </div>
        ))}
        
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 16px',
        }}>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 38px)',
            fontWeight: 900,
            marginBottom: '8px',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#cbd5e1',
            marginBottom: '20px',
            textShadow: '0 1px 5px rgba(0,0,0,0.6)',
          }}>
            {slides[currentSlide].subtitle}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/store" className="btn btn-accent btn-lg" style={{ gap: 6 }}>
              تصفح القطع المتوفرة <ChevronLeft size={18} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`شريحة ${index + 1}`}
                style={{
                  width: currentSlide === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: currentSlide === index ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Search Engine */}
      <section style={{ marginTop: '-40px', position: 'relative', zIndex: 20, padding: '0 16px 20px 16px' }}>
        <div className="card" style={{
          maxWidth: '850px',
          margin: '0 auto',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>ابحث برقم القطعة أو موديل الشاشة</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              مثال: <code style={{ background: 'rgba(99,102,241,0.12)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>32D1200</code> أو <code style={{ background: 'rgba(99,102,241,0.12)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>LGP32-13PL1</code>
            </p>
          </div>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={searchBrand} onChange={(e) => setSearchBrand(e.target.value)} className="field-input" style={{ minWidth: '130px', width: 'auto' }}>
              <option value="ALL">كل الماركات</option>
              {brands.map((b) => (<option key={b.code} value={b.code}>{b.name}</option>))}
            </select>
            <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
              <input type="text" placeholder="أدخل رقم البوردة أو موديل التلفزيون..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} maxLength={60} className="field-input" />
              <Search size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              بحث <Search size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Categories Section - 2x2 */}
      <section style={{ background: 'var(--bg-secondary)', padding: '40px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="reveal" data-reveal style={{ fontSize: '22px', fontWeight: 900, textAlign: 'center', marginBottom: '6px' }}>
            تصنيفات القطع
          </h2>
          <p className="reveal" data-reveal style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px' }}>
            تصفح القطع حسب النوع المراد تصليحه
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => navigate(`/store?category=${cat.key}`)}
                  className="card reveal"
                  data-reveal
                  style={{ padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'inherit', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className="icon-box icon-box-lg" style={{ background: `${cat.color}18`, color: cat.color, margin: '0 auto 14px auto', width: '56px', height: '56px' }}>
                    <Icon size={28} />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>{cat.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - 2x2 */}
      <section style={{ background: 'var(--bg-primary)', padding: '40px 16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="reveal" data-reveal style={{ fontSize: '20px', fontWeight: 900, textAlign: 'center', marginBottom: '24px' }}>
            لماذا يفضل التقنيون DZBoard؟
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card reveal" data-reveal style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="icon-box icon-box-md" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', marginBottom: '12px', width: '44px', height: '44px' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)', margin: 0 }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands Section - 4 columns */}
      <section style={{ background: 'var(--bg-secondary)', padding: '36px 16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 className="reveal" data-reveal style={{ fontSize: '20px', fontWeight: 900, textAlign: 'center', marginBottom: '20px' }}>
            ندعم القطع لأشهر الماركات العالمية والمحلية
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            {brands.map((brand, index) => (
              <button 
                key={index} 
                onClick={() => navigate(`/store?brand=${brand.code}`)}
                className="card reveal" 
                data-reveal 
                style={{ padding: '18px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'inherit' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '13px', fontWeight: 800 }}>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="reveal" data-reveal style={{ background: 'var(--bg-primary)', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px', color: 'var(--accent)' }}>لم تجد القطعة المناسبة؟</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            تواصل مع فريق الدعم الفني لدينا مباشرة للتأكد من توفر القطعة البديلة لجهازك.
          </p>
          <Link to="/store" className="btn btn-accent btn-lg" style={{ gap: 8 }}>
            تصفح كافة القطع الآن <ChevronLeft size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="reveal" data-reveal style={{ background: 'var(--bg-sidebar)', color: 'var(--text-sidebar)', borderTop: '1px solid var(--border)', padding: '32px 16px 20px 16px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 900, color: '#fff' }}>
            DZ<span style={{ color: 'var(--accent)' }}>Board</span>
          </div>
          <p style={{ fontSize: '12px', lineHeight: '1.6', marginBottom: '16px', opacity: 0.8 }}>
            متجر قطع غيار الشاشات التلفزيونية الأول في الجزائر - توصيل لـ 58 ولاية والدفع عند الاستلام.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px' }}>
            <Link to="/store" style={{ color: 'inherit', textDecoration: 'none' }}>المتجر</Link>
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155', fontSize: '11px', opacity: 0.7 }}>
            <p>&copy; {new Date().getFullYear()} DZBoard. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Floating Messenger Button */}
      <a 
        href="https://m.me/dzboard" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          left: '24px', 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 4px 14px rgba(0, 132, 255, 0.45)', 
          zIndex: 40, 
          transition: 'all 0.3s ease-in-out', 
          color: '#fff' 
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="تواصل معنا عبر ميسنجر"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.45 5.513 3.714 7.214V22l3.355-1.843c.928.257 1.91.397 2.931.397 5.523 0 10-4.145 10-9.296C22 6.145 17.523 2 12 2zm1.193 12.48l-2.556-2.727-4.99 2.727 5.49-5.823 2.622 2.727 4.925-2.727-5.491 5.823z" />
        </svg>
      </a>

    </div>
  );
}
