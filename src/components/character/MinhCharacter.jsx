import React from 'react';
import './MinhCharacter.css';

/**
 * MinhCharacter - Nhân vật Minh (21 tuổi, sinh viên)
 * Vẽ chuẩn góc nhìn 3/4 Anime Flat (nghiêng 35 độ tự nhiên, khuôn mặt và cơ thể vẽ phối cảnh thực)
 *
 * Props:
 * @param {string} bieuCam - 'dung-yen' | 'vui' | 'buon' | 'suy-nghi' | 'met' | 'bat-ngo' (mặc định: 'dung-yen')
 * @param {string} tuThe - 'dung' | 'di-bo' | 'ngoi-chay-xe' | 'ngoi-ban-hoc' | 'cui-nhin-dien-thoai' (mặc định: 'dung')
 * @param {string} trangPhuc - 'di-hoc' | 'lam-them' | 'o-nha' | 'cong-phan-xet' (mặc định: 'di-hoc')
 * @param {string} gocNhin - '3-4' | 'side' | 'chinh-dien' (mặc định: '3-4')
 * @param {number} doThuoc - Cường độ ánh sáng ấm hào quang (0.0 đến 1.0, mặc định: 0)
 * @param {object} customColors - Tùy chỉnh màu sắc CSS variables (mauAo, mauQuan, mauGiay, mauToc, phuKien)
 * @param {boolean} showBackpack - Bật/tắt balo đeo một bên vai (mặc định: true)
 * @param {boolean} showStudentCard - Bật/tắt thẻ sinh viên đeo cổ (mặc định: true)
 * @param {boolean} showHeadphones - Bật/tắt tai nghe quàng cổ (mặc định: true)
 * @param {string} className - Class CSS bổ sung
 * @param {object} style - Style bổ sung cho container
 * @param {string|number} width - Chiều rộng SVG container (mặc định: '100%')
 * @param {string|number} height - Chiều cao SVG container (mặc định: 'auto')
 */
export default function MinhCharacter({
  bieuCam = 'dung-yen',
  tuThe = 'dung',
  trangPhuc = 'di-hoc',
  gocNhin = '3-4',
  doThuoc = 0,
  customColors = {},
  showBackpack = true,
  showStudentCard = true,
  showHeadphones = false,
  className = '',
  style = {},
  width = '100%',
  height = 'auto',
  ...restProps
}) {
  const clampedDoThuoc = Math.max(0, Math.min(1, Number(doThuoc) || 0));

  const rootClasses = [
    'minh-character-root',
    bieuCam,
    tuThe,
    trangPhuc,
    `trang-phuc-${trangPhuc}`,
    `goc-${gocNhin || '3-4'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle = {
    '--do-thuoc': clampedDoThuoc,
    ...(customColors.mauAo && { '--mau-ao': customColors.mauAo }),
    ...(customColors.mauQuan && { '--mau-quan': customColors.mauQuan }),
    ...(customColors.mauGiay && { '--mau-giay': customColors.mauGiay }),
    ...(customColors.mauToc && { '--mau-toc': customColors.mauToc }),
    ...(customColors.phuKien && { '--phu-kien': customColors.phuKien }),
    ...style,
    width: width || '100%',
    height: height || 'auto',
  };

  return (
    <div
      className={`minh-character-container ${rootClasses}`}
      style={containerStyle}
      role="img"
      aria-label={`Nhân vật Minh - góc nhìn: ${gocNhin}, biểu cảm: ${bieuCam}, tư thế: ${tuThe}, trang phục: ${trangPhuc}`}
      {...restProps}
    >
      <svg
        className="minh-character-svg"
        viewBox="0 0 300 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hào quang nền */}
          <radialGradient id="minh-aura-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#D97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
          </radialGradient>

          {/* Gradient mống mắt anime flat - nâu hổ phách ấm */}
          <linearGradient id="minh-iris-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--mau-mat-vien, #18181B)" />
            <stop offset="60%" stopColor="var(--mau-mat, #2D231E)" />
            <stop offset="100%" stopColor="var(--mau-mat-sang, #78350F)" />
          </linearGradient>

          {/* Gradient bóng đổ thân áo */}
          <linearGradient id="minh-shirt-shading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
          </linearGradient>

          {/* Gradient bóng đổ quần jean */}
          <linearGradient id="minh-pants-shading" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
          </linearGradient>

          {/* Luồng sáng điện thoại */}
          <linearGradient id="minh-phone-screen-glow" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#7bb5e8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#4a82b8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c5def3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ========================================================
            0. HÀO QUANG ÁNH SÁNG ẤM PHÍA SAU
            ======================================================== */}
        <g className="halo-aura-bg">
          <circle cx="150" cy="230" r="185" fill="url(#minh-aura-glow)" />
          <circle
            cx="150"
            cy="230"
            r="160"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.6"
          />
          <circle
            cx="150"
            cy="230"
            r="175"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
            strokeDasharray="8 12"
            opacity="0.4"
          />
        </g>

        {/* ========================================================
            1. PHỤ KIỆN LỚP NỀN: THÂN BALO ĐEO PHÍA SAU (phu-kien)
            Balo sinh viên canvas xám than chì bên vai trái (phía xa)
            ======================================================== */}
        {showBackpack && (
          <g className="phu-kien phu-kien-balo-sau">
            {/* Quai cầm trên đỉnh balo */}
            <path
              d="M 88 172 C 88 160, 102 160, 102 172"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Thân chính balo */}
            <path
              d="M 76 178 C 74 172, 82 165, 96 165 C 106 165, 112 172, 112 185 L 113 255 C 113 264, 105 268, 94 268 C 82 268, 74 262, 74 250 Z"
              fill="var(--phu-kien-balo, #334155)"
              stroke="#1E293B"
              strokeWidth="2"
            />
            {/* Ngăn phụ trước balo */}
            <path
              d="M 74 215 C 74 210, 78 206, 86 206 L 104 206 C 110 206, 113 210, 113 215 L 113 258 C 113 264, 106 266, 94 266 C 82 266, 74 262, 74 256 Z"
              fill="#1E293B"
              opacity="0.4"
            />
            {/* Khóa kéo kim loại */}
            <path
              d="M 78 208 L 110 208"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </g>
        )}

        {/* ========================================================
            2. TÓC SAU (toc-sau): Cắt ngắn gáy cao, ôm sát đầu góc 3/4
            ======================================================== */}
        <g className="toc-sau">
          {/* Khối tóc sau gáy ôm vòm sọ góc 3/4 */}
          <path
            d="M 122 75 C 118 56, 132 46, 152 46 C 168 46, 180 56, 178 75 C 178 88, 174 104, 166 110 C 158 114, 142 114, 134 110 C 126 104, 122 88, 122 75 Z"
            fill="var(--mau-toc, #1E232A)"
          />
          {/* Chân gáy cao gọn gàng */}
          <path
            d="M 134 110 Q 150 112 166 110"
            fill="none"
            stroke="var(--mau-toc, #1E232A)"
            strokeWidth="2"
          />
        </g>

        {/* ========================================================
            3. TAY TRÁI (tay-trai) — TAY PHÍA XA: NẰM SAU THÂN VÀ CHÂN
            Giải quyết triệt để lỗi z-index: Tay xa nằm lùi phía sau lưng sườn
            Khớp vai (108, 162), khớp khuỷu (100, 222)
            ======================================================== */}
        <g className="nhom-than-tong nhom-than-lop-sau">
          <g className="nhom-tho-than">
            <g className="tay-trai" style={{ transformOrigin: '108px 162px' }}>
              {/* Ống tay áo trên phía xa (đổ bóng màu xám nhạt) */}
              <path
                d="M 110 164 L 100 206 C 99 210, 114 212, 116 206 L 120 168 Z"
                fill="var(--mau-ao-bong, #E2E8F0)"
                stroke="var(--mau-ao-vien, #CBD5E1)"
                strokeWidth="1.4"
              />
              {/* Bắp tay */}
              <path
                d="M 102 206 L 103 222 L 114 222 L 115 206 Z"
                fill="var(--mau-da-nhan, #F5D3BC)"
              />
              {/* Cẳng tay và bàn tay trái (khuyu-tay-trai) */}
              <g className="khuyu-tay-trai" style={{ transformOrigin: '100px 222px' }}>
                <path
                  d="M 103 222 L 103 274 L 114 274 L 114 222 Z"
                  fill="var(--mau-da-nhan, #F5D3BC)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1"
                />
                {/* Bàn tay trái - xuôi tự nhiên bên hông xa */}
                <path
                  d="M 103 274 C 101 280, 100 295, 102 305 C 104 308, 107 308, 109 304 L 111 288 L 113 303 C 114 305, 116 304, 116 300 L 114 274 Z"
                  fill="var(--mau-da-nhan, #F5D3BC)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1"
                />
              </g>
            </g>
          </g>
        </g>

        {/* ========================================================
            4. CHÂN VÀ QUẦN (chan) & GIÀY (giay)
            Phối cảnh 3/4: Chân trái (xa, đậm màu) bước so le với Chân phải (gần, sáng màu)
            Giày lồng vào cẳng chân (goi) khóa khớp 100%
            ======================================================== */}
        <g className="chan">
          {/* 4.1 Chân trái (chan-trai) - Chân phía xa, màu xanh sẫm #1E3A5F */}
          <g className="chan-trai" style={{ transformOrigin: '132px 308px' }}>
            {/* Đùi trái */}
            <path
              d="M 124 294 L 122 412 C 122 418, 142 418, 144 412 L 146 300 Z"
              fill="#1E3A5F"
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            {/* Cẳng chân trái (goi-trai) */}
            <g className="goi-trai" style={{ transformOrigin: '130px 415px' }}>
              <path
                d="M 122 410 L 123 514 L 142 514 L 144 410 C 137 416, 127 416, 122 410 Z"
                fill="#1E3A5F"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
              <path
                d="M 123 460 Q 132 464 142 460 M 123 495 Q 132 499 142 495"
                fill="none"
                stroke="#0F172A"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Giày trái (giay giay-trai) */}
              <g className="giay giay-trai">
                <path
                  d="M 122 514 L 118 534 C 117 540, 128 544, 143 544 C 147 544, 147 534, 143 526 L 142 514 Z"
                  fill="var(--mau-giay, #E2E8F0)"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 117 538 L 116 546 C 116 549, 127 551, 144 551 C 148 551, 148 544, 145 538 Z"
                  fill="#CBD5E1"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1"
                />
                <path
                  d="M 126 524 L 138 524 M 127 529 L 140 529 M 124 537 L 142 537"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* 4.2 Chân phải (chan-phai) - Chân phía gần, màu jean chuẩn #2B4C7E */}
          <g className="chan-phai" style={{ transformOrigin: '168px 308px' }}>
            {/* Đùi phải */}
            <path
              d="M 152 298 L 155 412 C 157 418, 178 418, 180 412 L 178 292 Z"
              fill="var(--mau-quan, #2B4C7E)"
              stroke="var(--mau-quan-vien, #1E3A5F)"
              strokeWidth="1.5"
            />
            {/* Bóng đổ đùi phải */}
            <path
              d="M 170 294 L 166 412 C 170 416, 178 416, 180 412 L 178 292 Z"
              fill="url(#minh-pants-shading)"
            />
            {/* Cẳng chân phải (goi-phai) */}
            <g className="goi-phai" style={{ transformOrigin: '170px 415px' }}>
              <path
                d="M 155 410 L 156 514 L 177 514 L 180 410 C 173 416, 163 416, 155 410 Z"
                fill="var(--mau-quan, #2B4C7E)"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.5"
              />
              <path
                d="M 156 460 Q 166 465 177 460 M 156 495 Q 166 500 177 495"
                fill="none"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Giày phải (giay giay-phai) */}
              <g className="giay giay-phai">
                <path
                  d="M 156 514 L 155 526 C 151 534, 151 544, 155 544 C 172 544, 184 540, 183 534 L 177 514 Z"
                  fill="var(--mau-giay, #F8FAFC)"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 153 538 C 150 544, 150 551, 154 551 C 173 551, 185 549, 185 546 L 184 538 Z"
                  fill="#E2E8F0"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1"
                />
                <path
                  d="M 163 524 L 173 524 M 161 529 L 172 529 M 157 537 L 175 537"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Đáy quần & cạp quần phối cảnh 3/4 */}
          <path
            d="M 120 290 Q 150 298 180 290 L 176 312 Q 152 322 124 312 Z"
            fill="var(--mau-quan-bong, #1E3A5F)"
          />
        </g>

        {/* ========================================================
            5. NHÓM THÂN TRÊN VÀ ĐẦU (NẰM TRÊN TAY XA VÀ CHÂN XA)
            ======================================================== */}
        <g className="nhom-than-tong nhom-than-lop-chinh">
          <g className="nhom-tho-than">
            {/* 5.1 THÂN ÁO (than) — Vẽ góc nghiêng 3/4 */}
            <g className="than-group" style={{ transformOrigin: '150px 290px' }}>
              <g className="than">
                {/* Thân áo chính góc 3/4 */}
                <path
                  d="M 112 165 C 122 158, 142 155, 152 155 C 164 155, 178 158, 186 162 L 182 220 C 180 254, 178 274, 176 292 C 160 296, 138 296, 120 292 C 118 254, 115 220, 112 165 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                {/* Lớp bóng vải áo phía xa */}
                <path
                  d="M 112 165 C 116 200, 118 250, 120 292 C 128 294, 136 295, 146 295 L 146 155 C 138 155, 122 158, 112 165 Z"
                  fill="var(--mau-ao-bong, #F1F5F9)"
                  opacity="0.8"
                />
                {/* Cổ áo vạt chéo phối cảnh 3/4 */}
                <path
                  d="M 138 155 L 146 172 L 152 172 L 142 155 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 166 156 L 158 172 L 152 172 L 161 155 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.2"
                />
                {/* Hàng cúc áo hơi lệch theo phối cảnh 3/4 */}
                <line
                  x1="152"
                  y1="172"
                  x2="152"
                  y2="288"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1"
                />
                <circle cx="152" cy="186" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="152" cy="212" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="152" cy="238" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="152" cy="264" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                {/* Nếp nhăn áo sườn eo */}
                <path
                  d="M 118 226 Q 126 229 130 225 M 180 225 Q 172 228 168 224"
                  fill="none"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1"
                />
              </g>
            </g>

            {/* 5.2 ĐẦU VÀ CỔ (dau-co-group): Khớp cổ (150, 145) */}
            <g className="dau-co-group" style={{ transformOrigin: '150px 145px' }}>
              {/* CỔ (co) */}
              <g className="co">
                <path
                  d="M 142 126 L 138 156 Q 150 158 162 156 L 158 126 Z"
                  fill="var(--mau-da, #FCE9D8)"
                />
                <path
                  d="M 142 126 Q 150 142 158 126 Q 150 134 142 126 Z"
                  fill="var(--mau-da-bong, #F3C7B0)"
                />
                <path
                  d="M 150 141 L 152 143 L 150 145"
                  fill="none"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>

              {/* ĐẦU VÀ KHUÔN MẶT (dau) — VẼ CHUẨN GÓC NGHIÊNG 3/4 ANIME */}
              <g className="dau">
                {/* Khung khuôn mặt 3/4: gò má trái cong nhẹ, góc hàm phải nhìn rõ, cằm thon gọn */}
                <path
                  d="M 126 82 C 124 94, 126 102, 129 107 C 132 113, 142 128, 154 135 C 163 128, 172 120, 174 114 C 176 106, 176 94, 174 82 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                />
                {/* Tai phải (gần) vẽ rõ nét */}
                <path
                  d="M 174 96 C 182 96, 184 112, 176 116 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 176 102 Q 180 107, 177 111"
                  fill="none"
                  stroke="var(--mau-da-bong, #F3C7B0)"
                  strokeWidth="1.2"
                />
                {/* Má hồng góc 3/4 */}
                <ellipse
                  className="ma-hong ma-hong-trai"
                  cx="134"
                  cy="112"
                  rx="4.5"
                  ry="2.6"
                  fill="var(--mau-ma-hong, rgba(244, 114, 182, 0.45))"
                />
                <ellipse
                  className="ma-hong ma-hong-phai"
                  cx="164"
                  cy="112"
                  rx="6"
                  ry="3.2"
                  fill="var(--mau-ma-hong, rgba(244, 114, 182, 0.45))"
                />
                {/* Sống mũi góc 3/4 anime thanh thoát hướng về bên phải */}
                <path
                  d="M 149 106 L 153.5 114 L 150 115"
                  fill="none"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="152" cy="113.5" r="0.6" fill="#FFFFFF" opacity="0.8" />
              </g>

              {/* MẮT TRÁI (mat-trai) — Mắt phía xa, thu hẹp phối cảnh 3/4 */}
              <g className="mat-trai">
                <g className="mat-thuong">
                  <ellipse cx="137" cy="104" rx="4.2" ry="5.0" fill="#FFFFFF" />
                  <g className="trong-mat-chop" style={{ transformOrigin: '137px 104px' }}>
                    <ellipse cx="137.5" cy="104.5" rx="3.4" ry="4.6" fill="url(#minh-iris-gradient)" />
                    <ellipse cx="137.5" cy="104.5" rx="1.8" ry="2.3" fill="#09090B" />
                    {/* Highlight 1 */}
                    <circle cx="136" cy="102.5" r="1.3" fill="#FFFFFF" />
                    {/* Highlight 2 */}
                    <circle cx="138.8" cy="106" r="0.7" fill="#FFFFFF" />
                  </g>
                  <path
                    d="M 132 103 Q 137 99.5 142 103.5"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 134 108.5 Q 137 109.8 140 108.5"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="0.9"
                  />
                </g>
                <path
                  className="mat-cuoi"
                  d="M 132 105 Q 137 100 142 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="mi-mat-buon"
                  d="M 132 102 Q 137 104 142 106"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="mi-mat-met"
                  d="M 132 105 L 142 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="quang-tham-met"
                  d="M 133 111 Q 137 113 141 111"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
              </g>

              {/* MẮT PHẢI (mat-phai) — Mắt phía gần, to rõ nét */}
              <g className="mat-phai">
                <g className="mat-thuong">
                  <ellipse cx="159" cy="104" rx="5.8" ry="5.2" fill="#FFFFFF" />
                  <g className="trong-mat-chop" style={{ transformOrigin: '159px 104px' }}>
                    <ellipse cx="158.5" cy="104.5" rx="4.6" ry="4.8" fill="url(#minh-iris-gradient)" />
                    <ellipse cx="158.5" cy="104.5" rx="2.3" ry="2.4" fill="#09090B" />
                    {/* Highlight 1 */}
                    <circle cx="157" cy="102.5" r="1.6" fill="#FFFFFF" />
                    {/* Highlight 2 */}
                    <circle cx="160.2" cy="106.2" r="0.8" fill="#FFFFFF" />
                  </g>
                  <path
                    d="M 152 103 Q 159 99 166 103.5"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 154 109 Q 159 110.5 164 109"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="0.9"
                  />
                </g>
                <path
                  className="mat-cuoi"
                  d="M 152 105 Q 159 100 166 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="mi-mat-buon"
                  d="M 152 106 Q 159 104 166 102"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="mi-mat-met"
                  d="M 152 105 L 166 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  className="quang-tham-met"
                  d="M 154 111 Q 159 113.5 165 111"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                />
              </g>

              {/* LÔNG MÀY (long-may) */}
              <g className="long-may">
                <path
                  className="long-may-trai"
                  d="M 132 94 Q 137 90.5 142 93.5"
                  fill="none"
                  stroke="#1E232A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '137px 92px' }}
                />
                <path
                  className="long-may-phai"
                  d="M 153 93 Q 160 89.5 167 93.5"
                  fill="none"
                  stroke="#1E232A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '160px 92px' }}
                />
              </g>

              {/* MIỆNG (mieng) — Đặt tại tọa độ 3/4 x=151 */}
              <g className="mieng">
                <path
                  className="mieng-path mieng-dung-yen"
                  d="M 148 124 Q 152 126 156 124"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  className="mieng-path mieng-vui"
                  d="M 147 123 Q 152 130 157 123 Z"
                  fill="#E11D48"
                  stroke="#881337"
                  strokeWidth="1.4"
                />
                <path
                  className="mieng-path mieng-buon"
                  d="M 148 126 Q 152 123 156 126"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  className="mieng-path mieng-suy-nghi"
                  d="M 149 125 L 156 124"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  className="mieng-path mieng-met"
                  d="M 147 125 Q 151.5 128 156 125"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <ellipse
                  className="mieng-path mieng-bat-ngo"
                  cx="152"
                  cy="125"
                  rx="3.2"
                  ry="4.2"
                  fill="#9F1239"
                />
              </g>

              {/* TÓC TRƯỚC (toc-truoc) — Mái layer góc 3/4 anime */}
              <g className="toc-truoc">
                <path
                  d="M 124 76 C 122 60, 134 46, 152 46 C 168 46, 178 58, 176 76 L 175 82 C 172 78, 168 78, 164 84 C 160 78, 156 77, 152 85 C 148 78, 144 77, 140 85 C 136 78, 132 78, 128 84 C 125 78, 124 79, 123 82 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                <path
                  d="M 174 76 L 173 88 C 172 92, 170 94, 169 92 L 170 80 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                <path
                  d="M 149 46 Q 152 40 157 43 Q 153 45 151 47 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                <path
                  d="M 134 58 Q 152 54, 170 58 Q 152 56, 134 58 Z"
                  fill="var(--mau-toc-highlight, rgba(255, 255, 255, 0.28))"
                />
              </g>

              {/* BIỂU CẢM PHỤ HỌA */}
              <g className="bieu-cam-mo-hoi">
                <path
                  d="M 116 94 C 114 94, 112 97, 112 100 C 112 102.5, 114 104, 116 104 C 118 104, 120 102.5, 120 100 C 120 97, 118 94, 116 94 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="0.8"
                />
                <circle cx="115" cy="99" r="0.8" fill="#FFFFFF" />
              </g>

              <g className="bieu-cam-dau-hoi">
                <text
                  x="184"
                  y="62"
                  fontFamily="system-ui, sans-serif"
                  fontSize="22"
                  fontWeight="bold"
                  fill="#F59E0B"
                  stroke="#78350F"
                  strokeWidth="0.8"
                >
                  ?
                </text>
              </g>

              <g className="bieu-cam-bat-ngo">
                <text
                  x="185"
                  y="62"
                  fontFamily="system-ui, sans-serif"
                  fontSize="24"
                  fontWeight="bold"
                  fill="#EF4444"
                  stroke="#7F1D1D"
                  strokeWidth="0.8"
                >
                  !
                </text>
                <line x1="112" y1="65" x2="104" y2="58" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="110" y1="78" x2="100" y2="78" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="188" y1="78" x2="198" y2="78" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>

            {/* 5.3 TAY PHẢI (tay-phai) — TAY PHÍA GẦN: NẰM ĐẰNG TRƯỚC THÂN VÀ HÔNG
                Khớp vai (192, 162), khớp khuỷu (198, 222) */}
            <g className="tay-phai" style={{ transformOrigin: '192px 162px' }}>
              <path
                d="M 186 162 L 180 206 C 182 212, 198 210, 200 206 L 194 162 Z"
                fill="var(--mau-ao, #FFFFFF)"
                stroke="var(--mau-ao-vien, #CBD5E1)"
                strokeWidth="1.4"
              />
              <path
                d="M 182 206 L 183 222 L 196 222 L 197 206 Z"
                fill="var(--mau-da, #FCE9D8)"
              />
              <g className="khuyu-tay-phai" style={{ transformOrigin: '198px 222px' }}>
                <path
                  d="M 183 222 L 184 274 L 196 274 L 196 222 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1"
                />
                <path
                  d="M 184 274 L 182 301 C 182 305, 184 306, 186 304 L 188 288 L 190 305 C 192 310, 195 309, 197 306 C 199 296, 198 280, 196 274 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1"
                />
              </g>
            </g>
          </g>
        </g>

        {/* ========================================================
            6. PHỤ KIỆN LỚP TRƯỚC (phu-kien)
            Thẻ sinh viên đeo cổ + quai balo + tai nghe quàng cổ
            ======================================================== */}
        <g className="phu-kien phu-kien-lop-truoc">
          {showBackpack && (
            <g className="quai-balo">
              <path
                d="M 106 162 C 104 185, 108 215, 116 248"
                fill="none"
                stroke="var(--phu-kien-balo, #334155)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 106 162 C 104 185, 108 215, 116 248"
                fill="none"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <rect
                x="108"
                y="218"
                width="7"
                height="5"
                rx="1"
                fill="#94A3B8"
                stroke="#475569"
                strokeWidth="1"
              />
            </g>
          )}

          {showHeadphones && (
            <g className="tai-nghe-quang-co">
              <path
                d="M 132 152 Q 150 159 168 152"
                fill="none"
                stroke="#475569"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect x="127" y="148" width="8" height="12" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
              <rect x="165" y="148" width="8" height="12" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
            </g>
          )}

          {showStudentCard && (
            <g className="the-sinh-vien-group">
              <path
                d="M 145 154 L 151 216 M 159 154 L 153 216"
                fill="none"
                stroke="var(--phu-kien, #2563EB)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <rect
                x="150"
                y="216"
                width="4"
                height="5"
                rx="1"
                fill="#CBD5E1"
                stroke="#64748B"
                strokeWidth="0.8"
              />
              <rect
                x="144"
                y="221"
                width="16"
                height="24"
                rx="2"
                fill="#FFFFFF"
                stroke="var(--phu-kien, #2563EB)"
                strokeWidth="1.2"
              />
              <rect
                x="147"
                y="224"
                width="6"
                height="7"
                rx="1"
                fill="#93C5FD"
              />
              <line x1="147" y1="234" x2="157" y2="234" stroke="#64748B" strokeWidth="1" />
              <line x1="147" y1="237" x2="155" y2="237" stroke="#94A3B8" strokeWidth="0.8" />
              <line x1="147" y1="240" x2="153" y2="240" stroke="#CBD5E1" strokeWidth="0.8" />
              <rect
                x="144"
                y="242"
                width="16"
                height="3"
                rx="1"
                fill="var(--phu-kien, #2563EB)"
              />
            </g>
          )}
        </g>

        {/* ========================================================
            7. ĐẠO CỤ HỖ TRỢ CÁC TƯ THẾ
            ======================================================== */}
        <g className="dao-cu-xe-may">
          <path
            d="M 90 268 C 105 264, 135 260, 150 260 C 165 260, 195 264, 210 268"
            fill="none"
            stroke="#334155"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect x="86" y="264" width="16" height="8" rx="2" fill="#0F172A" />
          <rect x="198" y="264" width="16" height="8" rx="2" fill="#0F172A" />
          <ellipse cx="150" cy="258" rx="14" ry="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="150" cy="258" r="6" fill="#0284C7" opacity="0.7" />
          <line x1="98" y1="264" x2="90" y2="246" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="88" cy="242" rx="7" ry="5" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.2" />
          <line x1="202" y1="264" x2="210" y2="246" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="212" cy="242" rx="7" ry="5" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.2" />
        </g>

        <g className="dao-cu-ban-hoc">
          <rect x="75" y="324" width="150" height="12" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          <rect x="75" y="336" width="150" height="6" fill="#451A03" />
          <polygon points="126,324 148,321 170,324 168,314 148,312 128,314" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="172" y1="316" x2="182" y2="322" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          <rect x="88" y="312" width="11" height="13" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <path d="M 91 308 Q 93 304 92 300 M 96 308 Q 94 304 96 300" fill="none" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />
        </g>

        <g className="dao-cu-dien-thoai">
          <polygon
            points="140,234 160,234 174,136 126,136"
            fill="url(#minh-phone-screen-glow)"
          />
          <rect
            x="141"
            y="234"
            width="18"
            height="28"
            rx="3"
            fill="#0F172A"
            stroke="#64748B"
            strokeWidth="1.2"
          />
          <rect
            x="142.5"
            y="236"
            width="15"
            height="24"
            rx="1.5"
            fill="#38BDF8"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}
