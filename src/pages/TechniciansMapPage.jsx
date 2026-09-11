import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MapPin, User, Loader2, X } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API = '/api';

// خريطة city_code → wilaya_id
const CODE_TO_ID = {
  '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7, '08': 8, '09': 9,
  '10': 10, '11': 11, '12': 12, '13': 13, '14': 14, '15': 15, '16': 16, '17': 17,
  '18': 18, '19': 19, '20': 20, '21': 21, '22': 22, '23': 23, '24': 24, '25': 25,
  '26': 26, '27': 27, '28': 28, '29': 29, '30': 30, '31': 31, '32': 32, '33': 33,
  '34': 34, '35': 35, '36': 36, '37': 37, '38': 38, '39': 39, '40': 40, '41': 41,
  '42': 42, '43': 43, '44': 44, '45': 45, '46': 46, '47': 47, '48': 48
};

export default function TechniciansMapPage() {
  const [technicians, setTechnicians] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState(null);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState([]);

  useEffect(() => {
    // تحميل البيانات + الخريطة
    Promise.all([
      fetch(`${API}/technicians`).then(r => r.json()),
      fetch(`${API}/technicians/stats`).then(r => r.json()),
      fetch('/data/algeria-wilayas.geojson').then(r => r.json())
    ])
      .then(([techsData, statsData, geo]) => {
        if (techsData.success) setTechnicians(techsData.technicians || []);
        if (statsData.success) setStats(statsData.stats || {});
        setGeoData(geo);
      })
      .finally(() => setLoading(false));
  }, []);

  // خريطة الاسم العربي → wilaya_id (تشمل الولايات الجديدة)
  const NAME_TO_ID = {
    'أدرار': 1, 'الشلف': 2, 'الأغواط': 3, 'أم البواقي': 4, 'باتنة': 5, 'بجاية': 6,
    'بسكرة': 7, 'بشار': 8, 'البليدة': 9, 'البويرة': 10, 'تمنراست': 11, 'تبسة': 12,
    'تلمسان': 13, 'تيارت': 14, 'تيزي وزو': 15, 'الجزائر': 16, 'الجلفة': 17, 'جيجل': 18,
    'سطيف': 19, 'سعيدة': 20, 'سكيكدة': 21, 'سيدي بلعباس': 22, 'عنابة': 23, 'قالمة': 24,
    'قسنطينة': 25, 'المدية': 26, 'مستغانم': 27, 'المسيلة': 28, 'معسكر': 29, 'ورقلة': 30,
    'وهران': 31, 'البيض': 32, 'إليزي': 33, 'برج بوعريريج': 34, 'بومرداس': 35, 'الطارف': 36,
    'تندوف': 37, 'تيسمسيلت': 38, 'الوادي': 39, 'خنشلة': 40, 'سوق أهراس': 41, 'تيبازة': 42,
    'ميلة': 43, 'عين الدفلى': 44, 'النعامة': 45, 'عين تموشنت': 46, 'غرداية': 47, 'غليزان': 48,
    'تيميمون': 49, 'برج باجي مختار': 50, 'أولاد جلال': 51, 'اولاد جلال': 51,
    'بني عباس': 52, 'عين صالح': 53, 'عين قزام': 54, 'تقرت': 55, 'جانت': 56,
    'المغير': 57, 'المنيعة': 58
  };

  const getWilayaIdFromName = (nameAr, nameEn) => {
    // جرب بالاسم العربي
    if (NAME_TO_ID[nameAr]) return NAME_TO_ID[nameAr];
    // جرب بالاسم الإنجليزي
    const EN_TO_ID = {
      'Adrar': 1, 'Chlef': 2, 'Laghouat': 3, 'Oum El Bouaghi': 4, 'Batna': 5, 'Béjaïa': 6,
      'Biskra': 7, 'Béchar': 8, 'Blida': 9, 'Bouira': 10, 'Tamanrasset': 11, 'Tébessa': 12,
      'Tlemcen': 13, 'Tiaret': 14, 'Tizi Ouzou': 15, 'Alger': 16, 'Djelfa': 17, 'Jijel': 18,
      'Sétif': 19, 'Saïda': 20, 'Skikda': 21, 'Sidi Bel Abbès': 22, 'Annaba': 23, 'Guelma': 24,
      'Constantine': 25, 'Médéa': 26, 'Mostaganem': 27, "M'Sila": 28, 'Mascara': 29, 'Ouargla': 30,
      'Oran': 31, 'El Bayadh': 32, 'Illizi': 33, 'Bordj Bou Arreridj': 34, 'Boumerdès': 35, 'El Tarf': 36,
      'Tindouf': 37, 'Tissemsilt': 38, 'El Oued': 39, 'Khenchela': 40, 'Souk Ahras': 41, 'Tipaza': 42,
      'Mila': 43, 'Aïn Defla': 44, 'Naâma': 45, 'Aïn Témouchent': 46, 'Ghardaïa': 47, 'Relizane': 48,
      'Timimoune': 49, 'Bordj Badji Mokhtar': 50, 'Ouled Djellal': 51,
      'Béni Abbès': 52, 'In Salah': 53, 'In Guezzam': 54, 'Touggourt': 55, 'Djanet': 56,
      "El M'Ghair": 57, 'El Meniaa': 58
    };
    return EN_TO_ID[nameEn] || null;
  };

  const handleWilayaClick = (wilayaId) => {
    const techs = technicians.filter(t => t.wilaya_id === wilayaId);
    setSelectedWilaya(wilayaId);
    setSelectedTechs(techs);
  };

  const getWilayaName = (id) => {
    const names = {
      1: 'أدرار', 2: 'الشلف', 3: 'الأغواط', 4: 'أم البواقي', 5: 'باتنة', 6: 'بجاية',
      7: 'بسكرة', 8: 'بشار', 9: 'البليدة', 10: 'البويرة', 11: 'تمنراست', 12: 'تبسة',
      13: 'تلمسان', 14: 'تيارت', 15: 'تيزي وزو', 16: 'الجزائر', 17: 'الجلفة', 18: 'جيجل',
      19: 'سطيف', 20: 'سعيدة', 21: 'سكيكدة', 22: 'سيدي بلعباس', 23: 'عنابة', 24: 'قالمة',
      25: 'قسنطينة', 26: 'المدية', 27: 'مستغانم', 28: 'المسيلة', 29: 'معسكر', 30: 'ورقلة',
      31: 'وهران', 32: 'البيض', 33: 'إليزي', 34: 'برج بوعريريج', 35: 'بومرداس', 36: 'الطارف',
      37: 'تندوف', 38: 'تيسمسيلت', 39: 'الوادي', 40: 'خنشلة', 41: 'سوق أهراس', 42: 'تيبازة',
      43: 'ميلة', 44: 'عين الدفلى', 45: 'النعامة', 46: 'عين تموشنت', 47: 'غرداية', 48: 'غليزان',
      49: 'تيميمون', 50: 'برج باجي مختار', 51: 'أولاد جلال', 52: 'بني عباس', 53: 'عين صالح',
      54: 'عين قزام', 55: 'تقرت', 56: 'جانت', 57: 'المغير', 58: 'المنيعة'
    };
    return names[id] || `ولاية ${id}`;
  };

  // تنسيق كل ولاية
  const wilayaStyle = (feature) => {
    const wilayaId = getWilayaIdFromName(feature.properties.name_ar, feature.properties.name);
    const count = wilayaId ? (stats[wilayaId] || 0) : 0;
    const isSelected = selectedWilaya === wilayaId;

    return {
      fillColor: isSelected ? '#3b82f6' : (count > 0 ? '#86efac' : '#e2e8f0'),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#1d4ed8' : '#94a3b8',
      fillOpacity: isSelected ? 0.8 : (count > 0 ? 0.7 : 0.4)
    };
  };

  // أحداث كل ولاية
  const onEachWilaya = (feature, layer) => {
    const wilayaId = getWilayaIdFromName(feature.properties.name_ar, feature.properties.name);
    const count = wilayaId ? (stats[wilayaId] || 0) : 0;
    const nameAr = feature.properties.name_ar || feature.properties.name;

    // Tooltip عند المرور
    layer.bindTooltip(
      `<div style="text-align: center; font-family: Cairo, system-ui;">
        <strong>${nameAr}</strong><br/>
        <span style="color: ${count > 0 ? '#10b981' : '#94a3b8'};">
          ${count > 0 ? `${count} 👨‍🔧 مصلح` : 'لا يوجد مصلحين'}
        </span>
      </div>`,
      { sticky: true }
    );

    // Click
    layer.on({
      click: () => handleWilayaClick(wilayaId),
      mouseover: (e) => {
        e.target.setStyle({
          fillColor: count > 0 ? '#10b981' : '#cbd5e1',
          fillOpacity: 0.85,
          weight: 2
        });
      },
      mouseout: (e) => {
        e.target.setStyle(wilayaStyle(feature));
      }
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', direction: 'rtl' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="spin" style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12, color: '#64748b', fontWeight: 700 }}>جاري تحميل الخريطة...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', direction: 'rtl', fontFamily: 'Cairo, system-ui' }}>
      
      {/* الهيدر */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 16px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 14 }}>
            <ArrowRight size={18} /> الرئيسية
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>🗺️ خريطة المصلحين</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 12 }}>
          👆 اضغط على أي ولاية لعرض المصلحين
        </p>

        {/* الخريطة */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <div style={{ height: '70vh', minHeight: 500, borderRadius: 12, overflow: 'hidden' }}>
            <MapContainer
              center={[28.0339, 1.6596]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoData && (
                <GeoJSON
                  data={geoData}
                  style={wilayaStyle}
                  onEachFeature={onEachWilaya}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* قائمة المصلحين */}
        {selectedWilaya && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>
                📍 {getWilayaName(selectedWilaya)} - {selectedTechs.length} مصلح
              </h2>
              <button
                onClick={() => { setSelectedWilaya(null); setSelectedTechs([]); }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {selectedTechs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: 30, fontSize: 14 }}>
                😔 لا يوجد مصلحين في هذه الولاية بعد
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                        {t.name?.charAt(0) || '?'}
                      </div>
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
      </main>
    </div>
  );
}
