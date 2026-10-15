import React, { useState } from 'react';
import MinhCharacter from './MinhCharacter';

/**
 * CharacterDemo - Trang tương tác demo nhân vật Minh
 * Cho phép kiểm thử toàn diện:
 * - 6 Biểu cảm (.dung-yen, .vui, .buon, .suy-nghi, .met, .bat-ngo)
 * - 5 Tư thế (.dung, .di-bo, .ngoi-chay-xe, .ngoi-ban-hoc, .cui-nhin-dien-thoai)
 * - 4 Trang phục (di-hoc, lam-them, o-nha, cong-phan-xet)
 * - Thanh trượt hào quang ánh sáng ấm (--do-thuoc từ 0.00 -> 1.00)
 * - Tùy chọn phụ kiện (balo, thẻ sinh viên, tai nghe)
 * - Tùy chọn nền xem trước (nền tối / nền sáng / nền chiều tà)
 */
export default function CharacterDemo() {
  const [bieuCam, setBieuCam] = useState('dung-yen');
  const [tuThe, setTuThe] = useState('dung');
  const [trangPhuc, setTrangPhuc] = useState('di-hoc');
  const [doThuoc, setDoThuoc] = useState(0.2);
  const [showBackpack, setShowBackpack] = useState(true);
  const [showStudentCard, setShowStudentCard] = useState(true);
  const [showHeadphones, setShowHeadphones] = useState(false);
  const [bgMode, setBgMode] = useState('dark');

  // Danh sách các biểu cảm theo đặc tả
  const DS_BIEU_CAM = [
    { id: 'dung-yen', label: 'Đứng yên', desc: 'Hiền lành, ấm áp, hơi mệt nhẹ' },
    { id: 'vui', label: 'Vui vẻ', desc: 'Mắt cười tít, má hồng, miệng cười tươi' },
    { id: 'buon', label: 'Buồn bã', desc: 'Lông mày cau chếch, mí mắt trĩu' },
    { id: 'suy-nghi', label: 'Suy nghĩ', desc: 'Mắt liếc, miệng mím lệch, dấu ?' },
    { id: 'met', label: 'Mệt mỏi', desc: 'Mí mắt sụp 50%, giọt mồ hôi' },
    { id: 'bat-ngo', label: 'Bất ngờ', desc: 'Mắt to tròn, miệng chữ O, dấu !' },
  ];

  // Danh sách các tư thế theo đặc tả
  const DS_TU_THE = [
    { id: 'dung', label: 'Đứng thẳng', desc: 'Thở nhẹ nhàng tự nhiên' },
    { id: 'di-bo', label: 'Đi bộ', desc: 'Chân tay vung nhịp nhàng' },
    { id: 'ngoi-chay-xe', label: 'Ngồi chạy xe', desc: 'Chồm người lái xe máy' },
    { id: 'ngoi-ban-hoc', label: 'Ngồi bàn học', desc: 'Gập gối, cầm bút học bài' },
    { id: 'cui-nhin-dien-thoai', label: 'Nhìn điện thoại', desc: 'Đầu cúi, ánh sáng màn hình' },
  ];

  // Danh sách 4 bộ trang phục theo đặc tả
  const DS_TRANG_PHUC = [
    {
      id: 'di-hoc',
      label: 'Đi học',
      colorPreview: '#2563EB',
      desc: 'Sơ mi trắng, jean xanh, thẻ sinh viên, balo',
    },
    {
      id: 'lam-them',
      label: 'Làm thêm',
      colorPreview: '#F97316',
      desc: 'Áo polo nâu cà phê, quần âu, thẻ ca làm',
    },
    {
      id: 'o-nha',
      label: 'Ở nhà',
      colorPreview: '#64748B',
      desc: 'Áo thun cotton xám nhạt, quần lửng, tai nghe',
    },
    {
      id: 'cong-phan-xet',
      label: 'Cổng phán xét',
      colorPreview: '#F59E0B',
      desc: 'Áo khoác đen huyền bí, huy hiệu vàng định mệnh',
    },
  ];

  // Các bối cảnh diễn kịch nhanh
  const KICH_BAN_PRESETS = [
    {
      label: 'Đến trường buổi sáng',
      trangPhuc: 'di-hoc',
      tuThe: 'di-bo',
      bieuCam: 'dung-yen',
      doThuoc: 0.1,
      showBackpack: true,
      showStudentCard: true,
      showHeadphones: false,
      bg: 'twilight',
    },
    {
      label: 'Tan ca làm thêm',
      trangPhuc: 'lam-them',
      tuThe: 'dung',
      bieuCam: 'met',
      doThuoc: 0.15,
      showBackpack: true,
      showStudentCard: false,
      showHeadphones: true,
      bg: 'dark',
    },
    {
      label: 'Đêm thức học bài',
      trangPhuc: 'o-nha',
      tuThe: 'ngoi-ban-hoc',
      bieuCam: 'suy-nghi',
      doThuoc: 0.35,
      showBackpack: false,
      showStudentCard: false,
      showHeadphones: true,
      bg: 'dark',
    },
    {
      label: 'Chạy xe ngoài phố',
      trangPhuc: 'di-hoc',
      tuThe: 'ngoi-chay-xe',
      bieuCam: 'vui',
      doThuoc: 0.25,
      showBackpack: true,
      showStudentCard: true,
      showHeadphones: false,
      bg: 'twilight',
    },
    {
      label: 'Cổng Phán Xét thức tỉnh',
      trangPhuc: 'cong-phan-xet',
      tuThe: 'dung',
      bieuCam: 'bat-ngo',
      doThuoc: 1.0,
      showBackpack: false,
      showStudentCard: false,
      showHeadphones: false,
      bg: 'abyss',
    },
  ];

  const applyPreset = (preset) => {
    setTrangPhuc(preset.trangPhuc);
    setTuThe(preset.tuThe);
    setBieuCam(preset.bieuCam);
    setDoThuoc(preset.doThuoc);
    setShowBackpack(preset.showBackpack);
    setShowStudentCard(preset.showStudentCard);
    setShowHeadphones(preset.showHeadphones);
    setBgMode(preset.bg);
  };

  // Nền preview tương ứng
  const bgStyles = {
    dark: 'linear-gradient(145deg, #181E29 0%, #0F172A 100%)',
    abyss: 'radial-gradient(circle at center, #1E1B4B 0%, #030712 100%)',
    twilight: 'linear-gradient(160deg, #1E293B 0%, #312E81 50%, #4C1D95 100%)',
    light: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 100%)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0B0F19',
        color: '#E2E8F0',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* Header */}
        <header
          style={{
            borderBottom: '1px solid #1E293B',
            paddingBottom: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.75rem',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Nhân Vật Minh (21 tuổi)
              <span
                style={{
                  fontSize: '0.85rem',
                  backgroundColor: '#1E293B',
                  color: '#38BDF8',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #38BDF8',
                }}
              >
                SVG Nội Tuyến & CSS
              </span>
            </h1>
            <p style={{ margin: '6px 0 0', color: '#94A3B8', fontSize: '0.92rem' }}>
              Tỉ lệ người thật 1/7 - Anime Flat - Biểu cảm, tư thế và hào quang độ thuộc
            </p>
          </div>

          {/* Chọn nền test */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Nền preview:</span>
            {[
              { id: 'dark', label: 'Đêm' },
              { id: 'abyss', label: 'Vực sâu' },
              { id: 'twilight', label: 'Chiều tà' },
              { id: 'light', label: 'Sáng' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBgMode(b.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: bgMode === b.id ? '1px solid #38BDF8' : '1px solid #334155',
                  backgroundColor: bgMode === b.id ? '#0284C7' : '#1E293B',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </header>

        {/* Khung điều khiển và xem trước */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 380px) 1fr',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* CỘT TRÁI: KHUNG XEM TRƯỚC NHÂN VẬT MINH */}
          <div
            style={{
              background: bgStyles[bgMode] || bgStyles.dark,
              borderRadius: 16,
              border: '1px solid #334155',
              padding: '28px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              position: 'sticky',
              top: 24,
            }}
          >
            {/* Hiển thị nhân vật Minh */}
            <div style={{ width: '100%', maxWidth: 300, height: 490 }}>
              <MinhCharacter
                bieuCam={bieuCam}
                tuThe={tuThe}
                trangPhuc={trangPhuc}
                doThuoc={doThuoc}
                showBackpack={showBackpack}
                showStudentCard={showStudentCard}
                showHeadphones={showHeadphones}
              />
            </div>

            {/* Thông số hiện tại */}
            <div
              style={{
                marginTop: 18,
                padding: '8px 14px',
                borderRadius: 8,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '90%',
                fontSize: '0.82rem',
                display: 'flex',
                justifyContent: 'space-between',
                color: '#CBD5E1',
              }}
            >
              <span>{bieuCam}</span>
              <span>•</span>
              <span>{tuThe}</span>
              <span>•</span>
              <span>{trangPhuc}</span>
              <span>•</span>
              <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>
                Độ thuộc: {Math.round(doThuoc * 100)}%
              </span>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG ĐIỀU KHIỂN TƯƠNG TÁC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 1. KỊCH BẢN NHANH */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: '#93C5FD' }}>
                Kịch bản mẫu nhanh
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {KICH_BAN_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(p)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38BDF8')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 2. ĐIỀU CHỈNH ĐỘ THUỘC (HÀO QUANG ÁNH SÁNG ẤM) */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <label
                  htmlFor="slider-do-thuoc"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    color: '#FCD34D',
                    cursor: 'pointer',
                  }}
                >
                  Hào quang Ánh Sáng Ấm (--do-thuoc)
                </label>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#78350F',
                    color: '#FEF08A',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}
                >
                  {doThuoc.toFixed(2)}
                </span>
              </div>
              <input
                id="slider-do-thuoc"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={doThuoc}
                onChange={(e) => setDoThuoc(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#F59E0B',
                  cursor: 'pointer',
                }}
              />
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
                Kéo từ 0.00 (không hào quang) đến 1.00 (ánh sáng ấm huyền ảo phán xét bao bọc toàn thân).
              </p>
            </section>

            {/* 3. BIỂU CẢM (.dung-yen, .vui, .buon, .suy-nghi, .met, .bat-ngo) */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: '#F472B6' }}>
                Biểu cảm khuôn mặt (Class)
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                }}
              >
                {DS_BIEU_CAM.map((item) => {
                  const isActive = bieuCam === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setBieuCam(item.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: isActive ? '2px solid #EC4899' : '1px solid #334155',
                        backgroundColor: isActive ? 'rgba(236, 72, 153, 0.15)' : '#1E293B',
                        color: isActive ? '#F472B6' : '#E2E8F0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>.{item.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 4. TƯ THẾ (.dung, .di-bo, .ngoi-chay-xe, .ngoi-ban-hoc, .cui-nhin-dien-thoai) */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: '#38BDF8' }}>
                Tư thế toàn thân (Class)
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 8,
                }}
              >
                {DS_TU_THE.map((item) => {
                  const isActive = tuThe === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTuThe(item.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: isActive ? '2px solid #38BDF8' : '1px solid #334155',
                        backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : '#1E293B',
                        color: isActive ? '#38BDF8' : '#E2E8F0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '0.88rem' }}>.{item.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 5. TRANG PHỤC (CSS VARIABLES) */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: '#34D399' }}>
                Trang phục (CSS Variables)
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 8,
                }}
              >
                {DS_TRANG_PHUC.map((item) => {
                  const isActive = trangPhuc === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTrangPhuc(item.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        border: isActive ? '2px solid #34D399' : '1px solid #334155',
                        backgroundColor: isActive ? 'rgba(52, 211, 153, 0.15)' : '#1E293B',
                        color: isActive ? '#34D399' : '#E2E8F0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 'bold',
                          fontSize: '0.88rem',
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: item.colorPreview,
                            display: 'inline-block',
                          }}
                        />
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 4 }}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 6. PHỤ KIỆN BẬT / TẮT */}
            <section
              style={{
                backgroundColor: '#131B2E',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', margin: '0 0 10px', color: '#A78BFA' }}>
                Phụ kiện nhận diện
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showStudentCard}
                    onChange={(e) => setShowStudentCard(e.target.checked)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  Thẻ sinh viên đeo cổ
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showBackpack}
                    onChange={(e) => setShowBackpack(e.target.checked)}
                    style={{ accentColor: '#334155' }}
                  />
                  Balo đeo một bên vai
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showHeadphones}
                    onChange={(e) => setShowHeadphones(e.target.checked)}
                    style={{ accentColor: '#94A3B8' }}
                  />
                  Tai nghe quàng cổ
                </label>
              </div>
            </section>

            {/* 7. HƯỚNG DẪN TÍCH HỢP CODE */}
            <section
              style={{
                backgroundColor: '#0F172A',
                padding: 14,
                borderRadius: 10,
                border: '1px dashed #334155',
                fontSize: '0.82rem',
                color: '#94A3B8',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#F1F5F9', marginBottom: 4 }}>
                Mã JSX tích hợp mẫu:
              </div>
              <code
                style={{
                  display: 'block',
                  backgroundColor: '#030712',
                  padding: '8px 12px',
                  borderRadius: 6,
                  color: '#38BDF8',
                  fontFamily: 'Consolas, monospace',
                  overflowX: 'auto',
                }}
              >
                {`<MinhCharacter bieuCam="${bieuCam}" tuThe="${tuThe}" trangPhuc="${trangPhuc}" doThuoc={${doThuoc}} />`}
              </code>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
