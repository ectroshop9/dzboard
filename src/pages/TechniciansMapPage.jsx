import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MapPin, User, Loader2, X } from 'lucide-react';

const API = '/api';

const WILAYAS = [
  { id: 1, name: 'أدرار' }, { id: 2, name: 'الشلف' }, { id: 3, name: 'الأغواط' },
  { id: 4, name: 'أم البواقي' }, { id: 5, name: 'باتنة' }, { id: 6, name: 'بجاية' },
  { id: 7, name: 'بسكرة' }, { id: 8, name: 'بشار' }, { id: 9, name: 'البليدة' },
  { id: 10, name: 'البويرة' }, { id: 11, name: 'تمنراست' }, { id: 12, name: 'تبسة' },
  { id: 13, name: 'تلمسان' }, { id: 14, name: 'تيارت' }, { id: 15, name: 'تيزي وزو' },
  { id: 16, name: 'الجزائر' }, { id: 17, name: 'الجلفة' }, { id: 18, name: 'جيجل' },
  { id: 19, name: 'سطيف' }, { id: 20, name: 'سعيدة' }, { id: 21, name: 'سكيكدة' },
  { id: 22, name: 'سيدي بلعباس' }, { id: 23, name: 'عنابة' }, { id: 24, name: 'قالمة' },
  { id: 25, name: 'قسنطينة' }, { id: 26, name: 'المدية' }, { id: 27, name: 'مستغانم' },
  { id: 28, name: 'المسيلة' }, { id: 29, name: 'معسكر' }, { id: 30, name: 'ورقلة' },
  { id: 31, name: 'وهران' }, { id: 32, name: 'البيض' }, { id: 33, name: 'إليزي' },
  { id: 34, name: 'برج بوعريريج' }, { id: 35, name: 'بومرداس' }, { id: 36, name: 'الطارف' },
  { id: 37, name: 'تندوف' }, { id: 38, name: 'تيسمسيلت' }, { id: 39, name: 'الوادي' },
  { id: 40, name: 'خنشلة' }, { id: 41, name: 'سوق أهراس' }, { id: 42, name: 'تيبازة' },
  { id: 43, name: 'ميلة' }, { id: 44, name: 'عين الدفلى' }, { id: 45, name: 'النعامة' },
  { id: 46, name: 'عين تموشنت' }, { id: 47, name: 'غرداية' }, { id: 48, name: 'غليزان' },
  { id: 49, name: 'تيميمون' }, { id: 50, name: 'برج باجي مختار' }, { id: 51, name: 'أولاد جلال' },
  { id: 52, name: 'بني عباس' }, { id: 53, name: 'عين صالح' }, { id: 54, name: 'عين قزام' },
  { id: 55, name: 'تقرت' }, { id: 56, name: 'جانت' }, { id: 57, name: 'المغير' }, { id: 58, name: 'المنيعة' },
];

export default function TechniciansMapPage() {
  const [technicians, setTechnicians] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/technicians`).then(r => r.json()),
      fetch(`${API}/technicians/stats`).then(r => r.json())
    ])
      .then(([techsData, statsData]) => {
        if (techsData.success) setTechnicians(techsData.technicians || []);
        if (statsData.success) setStats(statsData.stats || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const handleWilayaClick = (wilayaId) => {
    const techs = technicians.filter(t => t.wilaya_id === wilayaId);
    setSelectedWilaya(wilayaId);
    setSelectedTechs(techs);
  };

  const getWilayaName = (id) => WILAYAS.find(w => w.id === id)?.name || `ولاية ${id}`;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'system-ui', paddingBottom: 60 }}>
      
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 14 }}>
            <ArrowRight size={18} /> الرئيسية
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>🗺️ خريطة المصلحين</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Loader2 size={40} className="spin" style={{ color: '#3b82f6' }} />
          </div>
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16, textAlign: 'center' }}>
                👆 اضغط على الولاية لعرض المصلحين المتوفرين
              </p>

              {/* شبكة الولايات */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                gap: 8 
              }}>
                {WILAYAS.map(w => {
                  const count = stats[w.id] || 0;
                  const hasTechs = count > 0;
                  const isSelected = selectedWilaya === w.id;
                  
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleWilayaClick(w.id)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid #3b82f6' : '1px solid ' + (hasTechs ? '#86efac' : '#e2e8f0'),
                        background: isSelected ? '#eff6ff' : hasTechs ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 800, color: hasTechs ? '#059669' : '#64748b' }}>
                        {w.id}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', textAlign: 'center', lineHeight: 1.2 }}>
                        {w.name}
                      </span>
                      {hasTechs && (
                        <span style={{
                          background: '#10b981',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 800,
                          borderRadius: 10,
                          padding: '2px 6px',
                          marginTop: 2
                        }}>
                          {count} 👨‍🔧
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* المصلحين في الولاية المختارة */}
            {selectedWilaya && (
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                    📍 {getWilayaName(selectedWilaya)} - {selectedTechs.length} مصلح
                  </h2>
                  <button
                    onClick={() => setSelectedWilaya(null)}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {selectedTechs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: 30, fontSize: 14 }}>
                    لا يوجد مصلحين في هذه الولاية بعد
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {selectedTechs.map(t => (
                      <div key={t.id} style={{ 
                        background: '#f8fafc', 
                        borderRadius: 12, 
                        padding: 16,
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <User size={18} style={{ color: '#3b82f6' }} />
                          <strong style={{ fontSize: 15 }}>{t.name}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                          <a 
                            href={`tel:${t.phone}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              background: '#10b981',
                              color: '#fff',
                              padding: '10px 14px',
                              borderRadius: 8,
                              textDecoration: 'none',
                              fontWeight: 700,
                              justifyContent: 'center',
                              direction: 'ltr'
                            }}
                          >
                            <Phone size={15} /> {t.phone}
                          </a>
                          
                          {t.commune && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                              <MapPin size={14} style={{ color: '#f59e0b' }} />
                              {t.commune}
                            </div>
                          )}
                          
                          {t.address && (
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              📍 {t.address}
                            </div>
                          )}
                          
                          {t.notes && (
                            <div style={{ 
                              fontSize: 12, 
                              background: '#fef3c7', 
                              color: '#92400e', 
                              padding: '8px 10px', 
                              borderRadius: 8,
                              marginTop: 4
                            }}>
                              📝 {t.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
