import React from 'react';

/**
 * Minh họa Chặng 1: Cửa sổ nắng sớm phòng trọ
 * Ánh nắng vàng nhạt rọi qua rèm, điện thoại reo báo câu kinh mới
 */
export function MorningWindowIllustration() {
  return (
    <svg
      className="cutscene-svg"
      viewBox="0 0 400 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Minh họa sáng sớm phòng trọ với ánh nắng ban mai rọi qua cửa sổ"
    >
      <defs>
        <linearGradient id="skyMorn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#ffedd5" />
        </linearGradient>
        <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="wallMorn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bức tường phòng trọ */}
      <rect width="400" height="225" fill="url(#wallMorn)" />

      {/* Khung cửa sổ mở ra bầu trời sớm */}
      <rect x="70" y="25" width="130" height="130" rx="8" fill="url(#skyMorn)" stroke="#b45309" strokeWidth="4" />
      {/* Khung chấn song cửa sổ */}
      <line x1="135" y1="25" x2="135" y2="155" stroke="#b45309" strokeWidth="3" />
      <line x1="70" y1="90" x2="200" y2="90" stroke="#b45309" strokeWidth="3" />

      {/* Mặt trời mọc và tia nắng sớm */}
      <circle cx="160" cy="55" r="22" fill="#fde047" opacity="0.9" />
      <polygon
        className="animate-sunbeam"
        points="140,40 290,225 190,225 125,50"
        fill="url(#sunRay)"
      />
      <polygon
        className="animate-sunbeam"
        points="160,50 380,210 280,225 145,65"
        fill="url(#sunRay)"
        style={{ animationDelay: '1.2s' }}
      />

      {/* Rèm cửa khẽ bay */}
      <path
        d="M60 20 Q85 70 65 155 L55 155 Q80 70 55 20 Z"
        fill="#fcd34d"
        opacity="0.85"
      />
      <path
        d="M210 20 Q185 70 205 155 L215 155 Q190 70 215 20 Z"
        fill="#fcd34d"
        opacity="0.85"
      />

      {/* Chậu sen đá nhỏ trên bậu cửa */}
      <rect x="75" y="145" width="22" height="12" rx="2" fill="#d97706" />
      <circle cx="82" cy="142" r="5" fill="#10b981" />
      <circle cx="89" cy="140" r="6" fill="#059669" />

      {/* Mặt bàn gỗ phòng trọ */}
      <rect x="0" y="165" width="400" height="60" fill="#78350f" />
      <rect x="0" y="165" width="400" height="6" fill="#92400e" />

      {/* Cuốn sổ kinh thánh / vở ghi chép */}
      <polygon points="120,180 190,175 220,195 150,202" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
      <line x1="155" y1="178" x2="185" y2="198" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="135" y1="184" x2="165" y2="197" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="170" y1="182" x2="200" y2="195" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Chiếc điện thoại reo báo câu kinh mới */}
      <circle cx="280" cy="188" r="30" fill="url(#phoneGlow)" />
      <rect x="260" y="172" width="40" height="26" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="264" y="176" width="32" height="18" rx="2" fill="var(--color-primary, #7bb5e8)" />
      {/* Biểu tượng chuông rung / sóng phát */}
      <path d="M253 175 C250 185 250 190 253 195" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <path d="M307 175 C310 185 310 190 307 195" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="280" cy="185" r="2.5" fill="#fef08a" />

      {/* Tách trà ấm bốc hơi */}
      <ellipse cx="340" cy="192" rx="12" ry="5" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
      <path d="M340 187 Q338 178 342 173" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Minh họa Chặng 2: Đường đi & Giảng đường
 * Đèn đỏ ngã tư, biển hiệu chữ lộn xộn, góc thư viện trường đại học
 */
export function TrafficLibraryIllustration() {
  return (
    <svg
      className="cutscene-svg"
      viewBox="0 0 400 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Minh họa trên đường dừng đèn đỏ và thư viện giảng đường"
    >
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-border, #c5def3)" />
          <stop offset="100%" stopColor="var(--color-bg-ice, #eef6fc)" />
        </linearGradient>
        <radialGradient id="redLightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bầu trời ban ngày */}
      <rect width="400" height="225" fill="url(#skyDay)" />

      {/* Đường phố & vạch sang đường bên trái */}
      <polygon points="0,225 180,225 130,120 0,120" fill="#334155" />
      <line x1="15" y1="165" x2="55" y2="165" stroke="#ffffff" strokeWidth="4" />
      <line x1="30" y1="190" x2="80" y2="190" stroke="#ffffff" strokeWidth="5" />
      <line x1="50" y1="215" x2="110" y2="215" stroke="#ffffff" strokeWidth="6" />

      {/* Cột đèn tín hiệu giao thông (Đèn Đỏ sáng) */}
      <rect x="25" y="45" width="22" height="60" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      <rect x="34" y="105" width="4" height="65" fill="#475569" />
      {/* Đèn đỏ phát sáng */}
      <circle cx="36" cy="58" r="16" fill="url(#redLightGlow)" />
      <circle cx="36" cy="58" r="6" fill="#ef4444" />
      <circle cx="36" cy="75" r="5" fill="#475569" />
      <circle cx="36" cy="92" r="5" fill="#475569" />

      {/* Biển hiệu, tờ rơi chữ lộn xộn gợi nhớ câu kinh */}
      <rect x="65" y="65" width="55" height="32" rx="3" fill="#ffffff" stroke="var(--color-primary-deep, #4a82b8)" strokeWidth="1.5" />
      <text x="70" y="80" fontSize="8" fontWeight="bold" fill="var(--color-text-main, #1c3553)" fontFamily="monospace">BẢNG HIỆU</text>
      <text x="70" y="91" fontSize="7" fill="#64748b" fontFamily="monospace">A B C ... ?</text>

      <rect x="85" y="105" width="35" height="22" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
      <text x="90" y="119" fontSize="6.5" fontWeight="bold" fill="#854d0e">TỜ RƠI</text>

      {/* Vách ngăn chia nửa sang Giảng đường / Thư viện */}
      <line x1="175" y1="0" x2="175" y2="225" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />

      {/* Phía bên phải: Thư viện giảng đường */}
      <rect x="175" y="0" width="225" height="225" fill="#f1f5f9" />

      {/* Giá sách thư viện */}
      <rect x="195" y="20" width="185" height="150" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" rx="4" />
      <line x1="195" y1="70" x2="380" y2="70" stroke="#64748b" strokeWidth="2" />
      <line x1="195" y1="120" x2="380" y2="120" stroke="#64748b" strokeWidth="2" />

      {/* Những gáy sách nhiều màu sắc */}
      {/* Tầng 1 */}
      <rect x="205" y="30" width="10" height="40" fill="var(--color-primary-deep, #4a82b8)" />
      <rect x="217" y="35" width="12" height="35" fill="#ef4444" />
      <rect x="231" y="28" width="14" height="42" fill="#10b981" />
      <rect x="247" y="32" width="10" height="38" fill="#f59e0b" />
      <rect x="260" y="36" width="16" height="34" fill="#8b5cf6" />
      {/* Tầng 2 */}
      <rect x="205" y="80" width="14" height="40" fill="#6366f1" />
      <rect x="221" y="85" width="10" height="35" fill="#ec4899" />
      <rect x="233" y="78" width="15" height="42" fill="var(--color-primary, #7bb5e8)" />
      <rect x="250" y="82" width="12" height="38" fill="#84cc16" />

      {/* Bàn học thư viện & Cuốn sách đang mở ghép từng chữ */}
      <rect x="180" y="170" width="220" height="55" fill="#cbd5e1" />
      <polygon points="260,185 295,182 320,195 285,200" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
      <polygon points="295,182 330,185 355,200 320,195" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
      {/* Dòng chữ gợi nhớ */}
      <line x1="272" y1="188" x2="290" y2="188" stroke="var(--color-primary-deep, #4a82b8)" strokeWidth="2" />
      <line x1="275" y1="193" x2="300" y2="193" stroke="var(--color-primary-deep, #4a82b8)" strokeWidth="2" />
      <line x1="325" y1="188" x2="345" y2="188" stroke="var(--color-primary-deep, #4a82b8)" strokeWidth="2" />
    </svg>
  );
}

/**
 * Minh họa Chặng 3: Chỗ làm thêm buổi chiều tối
 * Quán ăn bận rộn, khay bê đồ, khăn lau bàn, kiên trì nhẩm từng từ
 */
export function CoffeeWorkIllustration() {
  return (
    <svg
      className="cutscene-svg"
      viewBox="0 0 400 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Minh họa chỗ làm thêm chiều tối vừa lau bàn vừa nhẩm câu kinh"
    >
      <defs>
        <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#431407" />
          <stop offset="50%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bầu trời hoàng hôn chiều tối qua ô kính lớn */}
      <rect width="400" height="225" fill="url(#sunsetSky)" />

      {/* Khung kính quán nhìn ra thành phố hoàng hôn */}
      <rect x="30" y="20" width="340" height="120" rx="6" fill="#1c1917" opacity="0.6" stroke="#b45309" strokeWidth="2" />
      <line x1="200" y1="20" x2="200" y2="140" stroke="#78350f" strokeWidth="3" />

      {/* Đèn chụp vàng ấm của quán cà phê / quán ăn */}
      <line x1="120" y1="0" x2="120" y2="45" stroke="#d97706" strokeWidth="2" />
      <path d="M100 65 L140 65 L130 45 L110 45 Z" fill="#9a3412" stroke="#ea580c" strokeWidth="1" />
      <circle cx="120" cy="70" r="30" fill="url(#lampGlow)" />

      <line x1="280" y1="0" x2="280" y2="45" stroke="#d97706" strokeWidth="2" />
      <path d="M260 65 L300 65 L290 45 L270 45 Z" fill="#9a3412" stroke="#ea580c" strokeWidth="1" />
      <circle cx="280" cy="70" r="30" fill="url(#lampGlow)" />

      {/* Đồng hồ quán chỉ 18:30 */}
      <circle cx="50" cy="50" r="16" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="40" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="50" x2="57" y2="54" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />

      {/* Quầy bar / Bàn ăn quán cần lau dọn */}
      <rect x="0" y="145" width="400" height="80" fill="#451a03" />
      <rect x="0" y="145" width="400" height="8" fill="#78350f" />

      {/* Khay bê đồ và tách cà phê bốc khói */}
      <ellipse cx="150" cy="175" rx="42" ry="14" fill="#1c1917" stroke="#9a3412" strokeWidth="1.5" />
      {/* Tách cà phê */}
      <rect x="135" y="160" width="16" height="14" rx="2" fill="#ffffff" />
      <path d="M151 163 C156 163 156 170 151 170" stroke="#ffffff" strokeWidth="2" fill="none" />
      {/* Làn khói nghi ngút */}
      <path d="M141 155 Q138 148 143 142" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M146 155 Q149 146 145 140" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* Khăn lau bàn gấp gọn bên cạnh vết bàn sáng bóng */}
      <rect x="250" y="168" width="38" height="18" rx="4" fill="var(--color-primary, #7bb5e8)" stroke="var(--color-primary-deep, #4a82b8)" strokeWidth="1" />
      <ellipse cx="305" cy="180" rx="25" ry="8" fill="#fef08a" opacity="0.25" />

      {/* Đôi bàn tay cần mẫn lau dọn (biểu tượng) & bong bóng suy nghĩ lời kinh */}
      <g opacity="0.95">
        <circle cx="215" cy="120" r="4" fill="#fed7aa" />
        <circle cx="225" cy="110" r="6" fill="#fed7aa" />
        <rect x="232" y="85" width="110" height="30" rx="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.5" />
        <text x="242" y="104" fontSize="9" fontWeight="bold" fill="#c2410c" fontFamily="sans-serif">
          Nhẩm từng từ...
        </text>
      </g>
    </svg>
  );
}

/**
 * Minh họa Chặng 4: Đêm về phòng trọ & Cổng phán xét (Cổng Ánh Sáng)
 * Phòng trọ đêm khuya ngọn đèn nhỏ, xa xa bừng sáng Cổng Ánh Sáng thiên đàng
 */
export function NightGateIllustration() {
  return (
    <svg
      className="cutscene-svg"
      viewBox="0 0 400 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Minh họa đêm về phòng trọ và Cổng Ánh Sáng của ngày phán xét rực rỡ từ xa"
    >
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050510" />
          <stop offset="50%" stopColor="#0f0c29" />
          <stop offset="100%" stopColor="#240b36" />
        </linearGradient>
        <radialGradient id="heavenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#c084fc" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f0c29" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="roadToGate" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>

      {/* Bầu trời đêm sâu thẳm */}
      <rect width="400" height="225" fill="url(#nightSky)" />

      {/* Các vì sao lấp lánh */}
      <circle className="animate-star" cx="40" cy="30" r="1.5" fill="#ffffff" />
      <circle className="animate-star" cx="95" cy="55" r="2" fill="#fef08a" style={{ animationDelay: '0.8s' }} />
      <circle className="animate-star" cx="160" cy="25" r="1.5" fill="#e0e7ff" style={{ animationDelay: '1.4s' }} />
      <circle className="animate-star" cx="330" cy="35" r="2" fill="#ffffff" style={{ animationDelay: '0.5s' }} />
      <circle className="animate-star" cx="365" cy="70" r="1.5" fill="#fef08a" style={{ animationDelay: '1.1s' }} />

      {/* Vầng trăng khuyết thanh mảnh */}
      <path
        d="M30 60 A18 18 0 1 0 54 36 A14 14 0 1 1 30 60 Z"
        fill="#fef08a"
        opacity="0.9"
      />

      {/* CỘNG ÁNH SÁNG (Cổng phán xét / Cổng Thiên Đàng) ở xa xăm */}
      <circle className="animate-gate" cx="200" cy="85" r="85" fill="url(#heavenGlow)" />

      {/* Con đường ánh sáng dẫn về Cổng */}
      <polygon points="120,225 280,225 208,105 192,105" fill="url(#roadToGate)" opacity="0.85" />
      <line x1="200" y1="105" x2="200" y2="225" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />

      {/* Khung cổng vòm uy nghiêm tỏa sáng */}
      <path
        d="M175 105 L175 75 A25 25 0 0 1 225 75 L225 105"
        stroke="#fef08a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="170" y1="105" x2="230" y2="105" stroke="#fde047" strokeWidth="3" />
      <circle cx="200" cy="65" r="4" fill="#ffffff" />

      {/* Các tia hào quang bừng sáng từ Cổng */}
      <line x1="200" y1="40" x2="200" y2="15" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="230" y1="50" x2="250" y2="35" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="170" y1="50" x2="150" y2="35" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* Góc phòng trọ đêm khuya bên dưới */}
      <rect x="0" y="165" width="115" height="60" fill="#1e1b4b" opacity="0.95" />
      {/* Ngọn đèn bàn nhỏ thắp sáng góc phòng */}
      <polygon points="35,175 65,175 58,160 42,160" fill="#f59e0b" />
      <line x1="50" y1="175" x2="50" y2="200" stroke="#78350f" strokeWidth="3" />
      <circle cx="50" cy="180" r="24" fill="#fbbf24" opacity="0.35" />
      {/* Cuốn kinh mở đọc thầm */}
      <polygon points="40,205 60,200 75,208 55,212" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
      <line x1="57" y1="201" x2="57" y2="210" stroke="#c084fc" strokeWidth="1" />
    </svg>
  );
}

/**
 * Lựa chọn Component hình minh họa theo loại
 */
export function CutsceneIllustration({ type }) {
  switch (type) {
    case 'morning-window':
    case 'morning-room':
      return <MorningWindowIllustration />;
    case 'traffic-library':
    case 'street-library':
      return <TrafficLibraryIllustration />;
    case 'coffee-work':
    case 'cafe-work':
      return <CoffeeWorkIllustration />;
    case 'night-gate':
    case 'night-lightgate':
      return <NightGateIllustration />;
    default:
      return <MorningWindowIllustration />;
  }
}
