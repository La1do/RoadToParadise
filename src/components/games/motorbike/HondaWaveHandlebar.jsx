import React from 'react';

/**
 * HondaWaveHandlebar - SVG góc nhìn thứ nhất tay lái xe Honda Wave 110cc
 * Vẽ hoàn toàn bằng SVG inline theo phong cách Anime Flat.
 *
 * Đặc điểm kỹ thuật xe số bán tự động Honda Wave:
 * - Đèn pha tròn ở trung tâm đầu xe
 * - Cụm đồng hồ cơ cổ điển: kim tốc độ dao động, kim xăng, đèn số N/4
 * - Hai gương chiếu hậu phản chiếu đường phía sau
 * - Tay phải: vặn ga + cần phanh trước
 * - Tay trái: nắm cao su + cần phanh nhỏ (xe số tự động, không có cần ly hợp tay)
 * - Hai bàn tay Minh (21 tuổi, sinh viên) bám tay lái tự nhiên
 */
export default function HondaWaveHandlebar({
  speed = 45, // Tốc độ km/h (ảnh hưởng góc kim đồng hồ)
  fuel = 0.75, // Mức xăng (0.0 -> 1.0)
  gear = 4, // Số xe (0: N, 1, 2, 3, 4)
  isVibrating = true, // Rung lắc theo động cơ và nhịp đường
  isRevving = false, // Vặn ga (khi đề nổ / tăng tốc)
  helmetProgress = 1, // Tiến độ hạ mũ bảo hiểm (0: chưa đội, 1: đã đội)
  handsOnBars = true, // Tay đã bám vào tay lái hay chưa
  showMirrors = true,
}) {
  // Góc quay của kim đồng hồ tốc độ (0 km/h: -120deg, 120 km/h: +120deg)
  const clampedSpeed = Math.max(0, Math.min(120, speed));
  const speedNeedleAngle = -120 + (clampedSpeed / 120) * 240;

  // Góc quay kim xăng (-50deg: E cạn, +50deg: F đầy)
  const fuelNeedleAngle = -50 + Math.max(0, Math.min(1, fuel)) * 100;

  return (
    <div className={`honda-wave-handlebar-wrap ${isVibrating ? 'is-vibrating' : ''}`}>
      <svg
        className="honda-wave-svg"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient bóng kim loại tay lái */}
          <linearGradient id="waveMetal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Gradient tay cầm cao su gai chống trượt */}
          <linearGradient id="waveRubber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Gradient mặt đồng hồ cơ */}
          <radialGradient id="waveDialGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="95%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
          </radialGradient>

          {/* Kính chiếu hậu phản chiếu đường chân trời */}
          <linearGradient id="mirrorReflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="48%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Chóa đèn pha tròn cổ điển */}
          <radialGradient id="headlightLens" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* ========================================================
            1. HAI GƯƠNG CHIẾU HẬU (Tròn / oval chuẩn xe Wave)
            ======================================================== */}
        {showMirrors && (
          <g className="wave-mirrors">
            {/* Gương trái */}
            <g className="mirror-left">
              {/* Cần gương kim loại uốn cong */}
              <path
                d="M 320 330 C 310 250, 260 210, 200 170"
                fill="none"
                stroke="#475569"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 320 330 C 310 250, 260 210, 200 170"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Ốp lưng gương nhựa đen */}
              <ellipse cx="190" cy="165" rx="52" ry="38" fill="#0F172A" stroke="#334155" strokeWidth="4" />
              {/* Mặt gương soi cảnh đường lùi */}
              <ellipse cx="190" cy="165" rx="46" ry="32" fill="url(#mirrorReflection)" />
              {/* Vệt phản quang chéo */}
              <path d="M 160 145 L 220 185" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
            </g>

            {/* Gương phải */}
            <g className="mirror-right">
              {/* Cần gương kim loại */}
              <path
                d="M 680 330 C 690 250, 740 210, 800 170"
                fill="none"
                stroke="#475569"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 680 330 C 690 250, 740 210, 800 170"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Ốp lưng gương */}
              <ellipse cx="810" cy="165" rx="52" ry="38" fill="#0F172A" stroke="#334155" strokeWidth="4" />
              {/* Mặt gương */}
              <ellipse cx="810" cy="165" rx="46" ry="32" fill="url(#mirrorReflection)" />
              {/* Vệt phản quang */}
              <path d="M 780 145 L 840 185" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* ========================================================
            2. CÀNG TAY LÁI VÀ ĐẦU XE WAVE
            ======================================================== */}
        <g className="wave-handlebars-structure">
          {/* Cổ ghi-đông đen uốn ngang */}
          <path
            d="M 180 375 C 280 345, 420 330, 500 330 C 580 330, 720 345, 820 375"
            fill="none"
            stroke="url(#waveMetal)"
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* Ốp nhựa đầu xe (Cowl yếm nhựa trên) */}
          <path
            d="M 370 330 C 420 280, 580 280, 630 330 L 610 440 C 560 480, 440 480, 390 440 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="3"
          />
          {/* Đường viền mạ crom trang trí yếm xe */}
          <path
            d="M 400 350 Q 500 330 600 350"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3"
            opacity="0.8"
          />

          {/* Đèn pha tròn ở giữa mũi xe Wave */}
          <circle cx="500" cy="420" r="38" fill="url(#headlightLens)" stroke="#CBD5E1" strokeWidth="5" />
          <circle cx="500" cy="420" r="28" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 4" />
        </g>

        {/* ========================================================
            3. ĐỒNG HỒ CƠ HONDA WAVE (Đồng hồ công tơ mét & xăng)
            ======================================================== */}
        <g className="wave-dashboard" transform="translate(500, 275)">
          {/* Khung viền đồng hồ */}
          <rect
            x="-110"
            y="-55"
            width="220"
            height="110"
            rx="24"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="4"
          />

          {/* Mặt đồng hồ tốc độ chính (Speedometer) bên trái */}
          <circle cx="-35" cy="0" r="42" fill="url(#waveDialGlow)" stroke="#475569" strokeWidth="2" />
          {/* Các vạch số tốc độ 0, 20, 40, 60, 80, 100, 120 */}
          {[-120, -80, -40, 0, 40, 80, 120].map((deg, idx) => (
            <line
              key={deg}
              x1="-35"
              y1="-32"
              x2="-35"
              y2="-38"
              stroke={idx >= 5 ? '#EF4444' : '#F8FAFC'}
              strokeWidth="2"
              transform={`rotate(${deg}, -35, 0)`}
            />
          ))}
          {/* Chữ km/h */}
          <text x="-35" y="20" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">
            km/h
          </text>
          {/* Kim tốc độ (Speed needle) xoay linh hoạt */}
          <g transform={`rotate(${speedNeedleAngle}, -35, 0)`}>
            <polygon points="-36,-38 -34,-38 -33,0 -37,0" fill="#EF4444" />
            <circle cx="-35" cy="0" r="4" fill="#FFFFFF" />
          </g>

          {/* Đồng hồ báo xăng (Fuel gauge) bên phải */}
          <circle cx="50" cy="6" r="28" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <text x="34" y="22" fill="#EF4444" fontSize="8" fontWeight="bold">E</text>
          <text x="60" y="22" fill="#10B981" fontSize="8" fontWeight="bold">F</text>
          {/* Kim xăng */}
          <g transform={`rotate(${fuelNeedleAngle}, 50, 6)`}>
            <polygon points="49,-18 51,-18 52,6 48,6" fill="#F59E0B" />
            <circle cx="50" cy="6" r="3" fill="#FFFFFF" />
          </g>

          {/* Đèn báo số (Gear indicator: N, 1, 2, 3, 4) */}
          <g className="gear-indicator" transform="translate(30, -32)">
            <rect x="0" y="0" width="38" height="14" rx="4" fill="#020617" />
            <circle cx="9" cy="7" r="4" fill={gear === 0 ? '#10B981' : '#1E293B'} />
            <text x="9" y="10" fill={gear === 0 ? '#FFFFFF' : '#475569'} fontSize="7" fontWeight="bold" textAnchor="middle">N</text>
            <circle cx="28" cy="7" r="4" fill={gear === 4 ? '#38BDF8' : '#1E293B'} />
            <text x="28" y="10" fill={gear === 4 ? '#FFFFFF' : '#475569'} fontSize="7" fontWeight="bold" textAnchor="middle">4</text>
          </g>
        </g>

        {/* ========================================================
            4. TAY LÁI TRÁI: NẮM CAO SU + CẦN PHANH SAU (KHÔNG DÙNG CÔN TAY)
            ======================================================== */}
        <g className="handlebar-left">
          {/* Cụm công tắc còi & xi-nhan */}
          <rect x="235" y="328" width="35" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          {/* Nút còi màu vàng nhạt */}
          <circle cx="252" cy="354" r="6" fill="#F59E0B" />

          {/* Cần phanh sau kim loại vươn dài phía trước */}
          <path
            d="M 240 338 C 190 325, 140 322, 110 332"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="110" cy="332" r="4.5" fill="#94A3B8" />

          {/* Ống cao su tay cầm trái với vân khía */}
          <rect
            x="120"
            y="345"
            width="115"
            height="34"
            rx="12"
            fill="url(#waveRubber)"
            stroke="#0F172A"
            strokeWidth="3"
            transform="rotate(6, 120, 345)"
          />
          {/* Vòng khía cao su */}
          {[135, 150, 165, 180, 195, 210].map(x => (
            <line
              key={x}
              x1={x}
              y1="345"
              x2={x}
              y2="379"
              stroke="#0F172A"
              strokeWidth="2"
              transform="rotate(6, 120, 345)"
            />
          ))}

          {/* Bàn tay trái của Minh nắm hờ tay lái */}
          {handsOnBars && (
            <g className="minh-hand-left">
              {/* Cổ tay áo sơ mi trắng đi học */}
              <path
                d="M 80 470 L 150 375 L 175 390 L 115 500 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="2"
              />
              {/* Mu bàn tay */}
              <ellipse cx="170" cy="378" rx="28" ry="18" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              {/* Các ngón tay nắm hờ quanh ống tay cầm */}
              <rect x="145" y="358" width="16" height="26" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              <rect x="160" y="356" width="16" height="28" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              <rect x="175" y="357" width="16" height="27" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              <rect x="190" y="360" width="15" height="24" rx="7" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              {/* Ngón cái tì lên còi */}
              <ellipse cx="185" cy="385" rx="14" ry="9" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" transform="rotate(-15, 185, 385)" />
            </g>
          )}
        </g>

        {/* ========================================================
            5. TAY LÁI PHẢI: TAY GA + CẦN PHANH TRƯỚC
            ======================================================== */}
        <g className={`handlebar-right ${isRevving ? 'is-revving' : ''}`}>
          {/* Cụm công tắc đề nổ & đèn */}
          <rect x="730" y="328" width="35" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          {/* Nút đề màu đỏ */}
          <rect x="740" y="350" width="15" height="12" rx="3" fill="#EF4444" />

          {/* Cần phanh trước kim loại */}
          <path
            d="M 760 338 C 810 325, 860 322, 890 332"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="890" cy="332" r="4.5" fill="#94A3B8" />

          {/* Ống tay ga cao su bên phải */}
          <rect
            x="765"
            y="345"
            width="115"
            height="34"
            rx="12"
            fill="url(#waveRubber)"
            stroke="#0F172A"
            strokeWidth="3"
            transform="rotate(-6, 880, 345)"
          />
          {/* Vân khía cao su tay ga */}
          {[775, 790, 805, 820, 835, 850].map(x => (
            <line
              key={x}
              x1={x}
              y1="345"
              x2={x}
              y2="379"
              stroke="#0F172A"
              strokeWidth="2"
              transform="rotate(-6, 880, 345)"
            />
          ))}

          {/* Bàn tay phải của Minh: nắm ga, 2 ngón trỏ & giữa gác hờ lên phanh */}
          {handsOnBars && (
            <g className="minh-hand-right">
              {/* Cổ tay áo sơ mi trắng */}
              <path
                d="M 920 470 L 850 375 L 825 390 L 885 500 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="2"
              />
              {/* Mu bàn tay */}
              <ellipse cx="830" cy="378" rx="28" ry="18" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              {/* Ngón áp út và ngón út nắm chặt ống ga */}
              <rect x="795" y="360" width="15" height="24" rx="7" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              <rect x="810" y="357" width="16" height="27" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" />
              {/* Ngón trỏ & ngón giữa duỗi nhẹ theo cần phanh trước */}
              <rect x="825" y="348" width="16" height="32" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" transform="rotate(-10, 825, 348)" />
              <rect x="840" y="347" width="16" height="30" rx="8" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" transform="rotate(-8, 840, 347)" />
              {/* Ngón cái bám vòng dưới tay ga */}
              <ellipse cx="815" cy="385" rx="14" ry="9" fill="#FCE9D8" stroke="#E4A88D" strokeWidth="1.5" transform="rotate(15, 815, 385)" />
            </g>
          )}
        </g>

        {/* ========================================================
            6. VIỀN MŨ BẢO HIỂM (HELMET VISOR FRAME)
            Hạ dần từ mép trên màn hình ở đoạn Intro
            ======================================================== */}
        <g
          className="helmet-visor-frame"
          style={{
            transform: `translateY(${(1 - helmetProgress) * -120}px)`,
            opacity: Math.min(1, helmetProgress * 1.2),
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
          }}
        >
          {/* Mép vòm trên của kính mũ bảo hiểm nửa đầu */}
          <path
            d="M -50 -40 Q 500 85 1050 -40 L 1050 -100 L -50 -100 Z"
            fill="#0F172A"
          />
          <path
            d="M -50 -40 Q 500 85 1050 -40"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}
