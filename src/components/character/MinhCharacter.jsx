import React from 'react';
import './MinhCharacter.css';

/**
 * MinhCharacter - Nhân vật Minh (21 tuổi, sinh viên)
 * Vẽ hoàn toàn bằng SVG nội tuyến và CSS animations
 *
 * Props:
 * @param {string} bieuCam - 'dung-yen' | 'vui' | 'buon' | 'suy-nghi' | 'met' | 'bat-ngo' (mặc định: 'dung-yen')
 * @param {string} tuThe - 'dung' | 'di-bo' | 'ngoi-chay-xe' | 'ngoi-ban-hoc' | 'cui-nhin-dien-thoai' (mặc định: 'dung')
 * @param {string} trangPhuc - 'di-hoc' | 'lam-them' | 'o-nha' | 'cong-phan-xet' (mặc định: 'di-hoc')
 * @param {string} gocNhin - '3-4' | 'side' | 'chinh-dien' (mặc định: '3-4' góc nghiêng 45 độ)
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
  // Đảm bảo doThuoc nằm trong khoảng 0 đến 1
  const clampedDoThuoc = Math.max(0, Math.min(1, Number(doThuoc) || 0));

  // Tập hợp các class điều khiển trên phần tử gốc
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

  // Xây dựng biến CSS variables
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
      aria-label={`Nhân vật Minh - biểu cảm: ${bieuCam}, tư thế: ${tuThe}, trang phục: ${trangPhuc}`}
      {...restProps}
    >
      <svg
        className="minh-character-svg"
        viewBox="0 0 300 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hào quang nền (Aura radial gradient) */}
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

          {/* Luồng sáng điện thoại (smartphone screen glow) */}
          <linearGradient id="minh-phone-screen-glow" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ========================================================
            0. HÀO QUANG ÁNH SÁNG ẤM PHÍA SAU (ĐỘ THUỘC: 0 -> 1)
            ======================================================== */}
        <g className="halo-aura-bg">
          <circle cx="150" cy="230" r="185" fill="url(#minh-aura-glow)" />
          {/* Vòng tia hào quang quay nhẹ */}
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
            1. PHỤ KIỆN LỚP NỀN: THÂN BALO ĐEO MỘT BÊN VAI
            Balo sinh viên canvas than chì bên vai trái
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
            {/* Thân chính balo xám than */}
            <path
              d="M 78 178 C 76 172, 84 165, 98 165 C 108 165, 114 172, 114 185 L 115 255 C 115 264, 107 268, 96 268 C 84 268, 76 262, 76 250 Z"
              fill="var(--phu-kien-balo, #334155)"
              stroke="#1E293B"
              strokeWidth="2"
            />
            {/* Ngăn phụ trước balo */}
            <path
              d="M 76 215 C 76 210, 80 206, 88 206 L 106 206 C 112 206, 115 210, 115 215 L 115 258 C 115 264, 108 266, 96 266 C 84 266, 76 262, 76 256 Z"
              fill="#1E293B"
              opacity="0.4"
            />
            {/* Đường khóa kéo kim loại */}
            <path
              d="M 80 208 L 112 208"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </g>
        )}

        {/* ========================================================
            2. TÓC SAU (toc-sau): Cắt ngắn gọn gàng, gáy cao ôm sát sọ
            ======================================================== */}
        <g className="toc-sau">
          {/* Khối tóc sau gáy cắt ngắn cao chân gáy (high fade / crop) */}
          <path
            d="M 122 75 C 118 58, 132 50, 150 50 C 168 50, 182 58, 178 75 C 178 88, 174 102, 166 108 C 158 112, 142 112, 134 108 C 126 102, 122 88, 122 75 Z"
            fill="var(--mau-toc, #1E232A)"
          />
          {/* Đường chân tóc gáy tỉa sạch sẽ, không xòe dài */}
          <path
            d="M 134 108 Q 150 110 166 108"
            fill="none"
            stroke="var(--mau-toc, #1E232A)"
            strokeWidth="2"
          />
        </g>

        {/* ========================================================
            3. CHÂN VÀ QUẦN (chan) & 4. GIÀY (giay): Khớp hông, gối, cổ chân
            Giày được lồng trực tiếp vào cẳng chân (goi) để khóa cứng khớp,
            loại bỏ hoàn toàn tình trạng giày bị rớt khỏi cẳng chân khi đi bộ.
            ======================================================== */}
        <g className="chan">
          {/* Chân trái (chan-trai) - Chân phía xa ở góc 3/4 */}
          <g className="chan-trai" style={{ transformOrigin: '132px 308px' }}>
            {/* Đùi trái */}
            <path
              d="M 120 292 L 118 412 C 118 418, 142 418, 144 412 L 148 300 Z"
              fill="var(--mau-quan, #2B4C7E)"
              stroke="var(--mau-quan-vien, #1E3A5F)"
              strokeWidth="1.5"
            />
            {/* Bóng đổ đùi trái */}
            <path
              d="M 118 294 L 118 412 C 120 416, 128 416, 128 412 L 134 300 Z"
              fill="url(#minh-pants-shading)"
            />
            {/* Cẳng chân trái (goi-trai) */}
            <g className="goi-trai" style={{ transformOrigin: '130px 415px' }}>
              <path
                d="M 118 410 L 120 514 L 142 514 L 144 410 C 137 416, 125 416, 118 410 Z"
                fill="var(--mau-quan, #2B4C7E)"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.5"
              />
              {/* Nếp gấp vải ống quần */}
              <path
                d="M 119 460 Q 131 465 143 460 M 120 495 Q 131 500 142 495"
                fill="none"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Giày trái (giay giay-trai) - Khóa trực tiếp vào cẳng chân */}
              <g className="giay giay-trai">
                {/* Thân giày */}
                <path
                  d="M 119 514 L 115 534 C 114 540, 126 544, 143 544 C 147 544, 147 534, 143 526 L 142 514 Z"
                  fill="var(--mau-giay, #F8FAFC)"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1.2"
                />
                {/* Đế giày sneaker cao su */}
                <path
                  d="M 114 538 L 113 546 C 113 549, 125 551, 144 551 C 148 551, 148 544, 145 538 Z"
                  fill="#E2E8F0"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1"
                />
                {/* Chi tiết dây giày / sọc thể thao */}
                <path
                  d="M 124 524 L 136 524 M 125 529 L 138 529 M 122 537 L 142 537"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Chân phải (chan-phai) - Chân phía gần ở góc 3/4 */}
          <g className="chan-phai" style={{ transformOrigin: '168px 308px' }}>
            {/* Đùi phải */}
            <path
              d="M 152 300 L 156 412 C 158 418, 182 418, 182 412 L 180 292 Z"
              fill="var(--mau-quan, #2B4C7E)"
              stroke="var(--mau-quan-vien, #1E3A5F)"
              strokeWidth="1.5"
            />
            {/* Bóng đổ đùi phải */}
            <path
              d="M 172 294 L 168 412 C 172 416, 180 416, 182 412 L 180 292 Z"
              fill="url(#minh-pants-shading)"
            />
            {/* Cẳng chân phải (goi-phai) */}
            <g className="goi-phai" style={{ transformOrigin: '170px 415px' }}>
              <path
                d="M 156 410 L 158 514 L 180 514 L 182 410 C 175 416, 163 416, 156 410 Z"
                fill="var(--mau-quan, #2B4C7E)"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.5"
              />
              {/* Nếp gấp vải ống quần */}
              <path
                d="M 157 460 Q 169 465 181 460 M 158 495 Q 169 500 180 495"
                fill="none"
                stroke="var(--mau-quan-vien, #1E3A5F)"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* Giày phải (giay giay-phai) - Khóa trực tiếp vào cẳng chân */}
              <g className="giay giay-phai">
                {/* Thân giày */}
                <path
                  d="M 158 514 L 157 526 C 153 534, 153 544, 157 544 C 174 544, 186 540, 185 534 L 181 514 Z"
                  fill="var(--mau-giay, #F8FAFC)"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1.2"
                />
                {/* Đế giày sneaker cao su */}
                <path
                  d="M 155 538 C 152 544, 152 551, 156 551 C 175 551, 187 549, 187 546 L 186 538 Z"
                  fill="#E2E8F0"
                  stroke="var(--mau-giay-vien, #64748B)"
                  strokeWidth="1"
                />
                {/* Chi tiết dây giày */}
                <path
                  d="M 164 524 L 176 524 M 162 529 L 175 529 M 158 537 L 178 537"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>

          {/* Đáy quần & thắt lưng */}
          <path
            d="M 120 290 Q 150 298 180 290 L 176 312 Q 150 324 124 312 Z"
            fill="var(--mau-quan-bong, #1E3A5F)"
          />
        </g>

        {/* ========================================================
            5. NHÓM THÂN TRÊN TỔNG (nhom-than-tong)
            Bao gồm animation thở và nhấp nhô bước đi
            ======================================================== */}
        <g className="nhom-than-tong">
          <g className="nhom-tho-than">
            {/* --- 5.1 THÂN ÁO (than) --- */}
            <g className="than-group" style={{ transformOrigin: '150px 290px' }}>
              <g className="than">
                {/* Thân áo chính */}
                <path
                  d="M 106 162 C 120 156, 140 154, 150 154 C 160 154, 180 156, 194 162 L 186 218 C 182 254, 180 274, 178 292 C 160 296, 140 296, 122 292 C 120 274, 118 254, 114 218 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                {/* Lớp bóng vải áo anime flat */}
                <path
                  d="M 106 162 C 114 178, 118 230, 122 292 C 130 294, 140 295, 150 295 L 150 154 C 140 154, 120 156, 106 162 Z"
                  fill="var(--mau-ao-bong, #F1F5F9)"
                  opacity="0.75"
                />
                {/* Cổ áo sơ mi / polo */}
                <path
                  d="M 136 154 L 144 172 L 150 172 L 140 154 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 164 154 L 156 172 L 150 172 L 160 154 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.2"
                />
                {/* Hàng cúc áo thẳng thớm */}
                <line
                  x1="150"
                  y1="172"
                  x2="150"
                  y2="288"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1"
                />
                <circle cx="150" cy="186" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="150" cy="212" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="150" cy="238" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                <circle cx="150" cy="264" r="1.5" fill="var(--mau-ao-vien, #94A3B8)" />
                {/* Nếp nhăn áo sườn eo */}
                <path
                  d="M 115 224 Q 124 227 128 223 M 185 224 Q 176 227 172 223 M 121 260 Q 130 263 134 259"
                  fill="none"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1"
                />
              </g>

              {/* --- 5.2 TAY TRÁI (tay-trai): Khớp vai (108, 162), khớp khuỷu (100, 222) --- */}
              <g className="tay-trai" style={{ transformOrigin: '108px 162px' }}>
                {/* Ống tay áo trên */}
                <path
                  d="M 106 162 L 95 208 C 95 212, 112 214, 114 208 L 118 168 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.4"
                />
                {/* Bắp tay */}
                <path
                  d="M 97 206 L 98 222 L 112 222 L 113 206 Z"
                  fill="var(--mau-da, #FCE9D8)"
                />
                {/* Cẳng tay và bàn tay trái (khuyu-tay-trai) */}
                <g className="khuyu-tay-trai" style={{ transformOrigin: '100px 222px' }}>
                  {/* Cẳng tay */}
                  <path
                    d="M 98 222 L 100 274 L 112 274 L 112 222 Z"
                    fill="var(--mau-da, #FCE9D8)"
                    stroke="var(--mau-da-nhan, #E4A88D)"
                    strokeWidth="1"
                  />
                  {/* Bàn tay trái - thanh niên thon gọn */}
                  <path
                    d="M 100 274 C 98 280, 97 296, 99 306 C 101 309, 104 310, 106 305 L 108 288 L 111 304 C 113 306, 115 305, 115 301 L 112 274 Z"
                    fill="var(--mau-da, #FCE9D8)"
                    stroke="var(--mau-da-nhan, #E4A88D)"
                    strokeWidth="1"
                  />
                </g>
              </g>

              {/* --- 5.3 TAY PHẢI (tay-phai): Khớp vai (192, 162), khớp khuỷu (198, 222) --- */}
              <g className="tay-phai" style={{ transformOrigin: '192px 162px' }}>
                {/* Ống tay áo trên */}
                <path
                  d="M 194 162 L 182 168 L 186 208 C 188 214, 205 212, 205 208 Z"
                  fill="var(--mau-ao, #FFFFFF)"
                  stroke="var(--mau-ao-vien, #CBD5E1)"
                  strokeWidth="1.4"
                />
                {/* Bắp tay */}
                <path
                  d="M 187 206 L 188 222 L 202 222 L 203 206 Z"
                  fill="var(--mau-da, #FCE9D8)"
                />
                {/* Cẳng tay và bàn tay phải (khuyu-tay-phai) */}
                <g className="khuyu-tay-phai" style={{ transformOrigin: '198px 222px' }}>
                  {/* Cẳng tay */}
                  <path
                    d="M 188 222 L 188 274 L 200 274 L 202 222 Z"
                    fill="var(--mau-da, #FCE9D8)"
                    stroke="var(--mau-da-nhan, #E4A88D)"
                    strokeWidth="1"
                  />
                  {/* Bàn tay phải */}
                  <path
                    d="M 188 274 L 185 301 C 185 305, 187 306, 189 304 L 192 288 L 194 305 C 196 310, 199 309, 201 306 C 203 296, 202 280, 200 274 Z"
                    fill="var(--mau-da, #FCE9D8)"
                    stroke="var(--mau-da-nhan, #E4A88D)"
                    strokeWidth="1"
                  />
                </g>
              </g>
            </g>

            {/* --- 5.4 ĐẦU VÀ CỔ (dau-co-group): Khớp cổ (150, 145) --- */}
            <g className="dau-co-group" style={{ transformOrigin: '150px 145px' }}>
              {/* CỔ (co) */}
              <g className="co">
                <path
                  d="M 141 126 L 138 155 Q 150 157 162 155 L 159 126 Z"
                  fill="var(--mau-da, #FCE9D8)"
                />
                {/* Bóng cằm đổ lên cổ (anime flat chin shadow) */}
                <path
                  d="M 141 126 Q 150 142 159 126 Q 150 134 141 126 Z"
                  fill="var(--mau-da-bong, #F3C7B0)"
                />
                {/* Gợi ý yết hầu thanh niên 21 tuổi */}
                <path
                  d="M 149 141 L 151 143 L 149 145"
                  fill="none"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>

              {/* ĐẦU VÀ KHUÔN MẶT (dau) */}
              <g className="dau">
                {/* Khung khuôn mặt (má - cằm góc 3/4 nhẹ) */}
                <path
                  d="M 121 86 C 119 104, 122 114, 126 122 C 132 131, 145 137, 150 137 C 156 137, 168 131, 174 122 C 178 114, 181 104, 179 86 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                />
                {/* Tai trái */}
                <path
                  d="M 121 98 C 115 98, 115 114, 122 116 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 119 104 Q 117 109 120 112"
                  fill="none"
                  stroke="var(--mau-da-bong, #F3C7B0)"
                  strokeWidth="1.2"
                />
                {/* Tai phải */}
                <path
                  d="M 179 98 C 185 98, 185 114, 178 116 Z"
                  fill="var(--mau-da, #FCE9D8)"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 181 104 Q 183 109 180 112"
                  fill="none"
                  stroke="var(--mau-da-bong, #F3C7B0)"
                  strokeWidth="1.2"
                />
                {/* Má hồng hiền lành phớt cam đào */}
                <ellipse
                  className="ma-hong ma-hong-trai"
                  cx="131"
                  cy="114"
                  rx="6"
                  ry="3.2"
                  fill="var(--mau-ma-hong, rgba(244, 114, 182, 0.45))"
                />
                <ellipse
                  className="ma-hong ma-hong-phai"
                  cx="169"
                  cy="114"
                  rx="6"
                  ry="3.2"
                  fill="var(--mau-ma-hong, rgba(244, 114, 182, 0.45))"
                />
                {/* Mũi nhỏ thanh thoát */}
                <path
                  d="M 149 113 L 150.5 117 L 148.5 117.5"
                  fill="none"
                  stroke="var(--mau-da-nhan, #E4A88D)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* MẮT TRÁI (mat-trai): có highlight 2 chấm trắng, chớp mắt */}
              <g className="mat-trai">
                {/* Mắt thường / mở */}
                <g className="mat-thuong">
                  {/* Lòng trắng */}
                  <ellipse cx="135" cy="104" rx="5.5" ry="5.2" fill="#FFFFFF" />
                  {/* Tròng mắt có animation chớp */}
                  <g className="trong-mat-chop" style={{ transformOrigin: '135px 104px' }}>
                    {/* Mống mắt gradient anime nâu hổ phách */}
                    <ellipse cx="135" cy="104.5" rx="4.5" ry="4.8" fill="url(#minh-iris-gradient)" />
                    {/* Đồng tử đen */}
                    <ellipse cx="135" cy="104.5" rx="2.2" ry="2.4" fill="#09090B" />
                    {/* ĐỐM SÁNG CHÍNH (Highlight 1) - góc trên trái */}
                    <circle cx="133.5" cy="102.5" r="1.6" fill="#FFFFFF" />
                    {/* ĐỐM SÁNG PHỤ (Highlight 2) - góc dưới phải */}
                    <circle cx="136.8" cy="106.2" r="0.8" fill="#FFFFFF" />
                  </g>
                  {/* Mí mắt trên thanh mảnh đen */}
                  <path
                    d="M 128 103 Q 135 99 142 103.5"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Mí mắt dưới mờ */}
                  <path
                    d="M 131 109 Q 135 110.5 139 109"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1"
                  />
                </g>
                {/* Mí mắt nheo cười (hiện khi .vui) */}
                <path
                  className="mat-cuoi"
                  d="M 129 106 Q 135 99 142 106"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                {/* Mí mắt rũ khi buồn (.buon) */}
                <path
                  className="mi-mat-buon"
                  d="M 128 101 Q 135 104 142 106"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Mí mắt sụp mệt mỏi (.met) */}
                <path
                  className="mi-mat-met"
                  d="M 128 105 L 142 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Quầng thâm nhẹ dưới mắt khi mệt (.met) */}
                <path
                  className="quang-tham-met"
                  d="M 130 111 Q 135 113.5 140 111"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                />
              </g>

              {/* MẮT PHẢI (mat-phai): phối cảnh 3/4 nhẹ */}
              <g className="mat-phai">
                {/* Mắt thường / mở */}
                <g className="mat-thuong">
                  {/* Lòng trắng */}
                  <ellipse cx="163" cy="104" rx="5.5" ry="5.2" fill="#FFFFFF" />
                  {/* Tròng mắt có animation chớp */}
                  <g className="trong-mat-chop" style={{ transformOrigin: '163px 104px' }}>
                    {/* Mống mắt gradient */}
                    <ellipse cx="163" cy="104.5" rx="4.5" ry="4.8" fill="url(#minh-iris-gradient)" />
                    {/* Đồng tử đen */}
                    <ellipse cx="163" cy="104.5" rx="2.2" ry="2.4" fill="#09090B" />
                    {/* ĐỐM SÁNG CHÍNH (Highlight 1) - góc trên trái */}
                    <circle cx="161.5" cy="102.5" r="1.6" fill="#FFFFFF" />
                    {/* ĐỐM SÁNG PHỤ (Highlight 2) - góc dưới phải */}
                    <circle cx="164.8" cy="106.2" r="0.8" fill="#FFFFFF" />
                  </g>
                  {/* Mí mắt trên */}
                  <path
                    d="M 156 103.5 Q 163 99 170 103"
                    fill="none"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Mí mắt dưới */}
                  <path
                    d="M 159 109 Q 163 110.5 167 109"
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth="1"
                  />
                </g>
                {/* Mí mắt nheo cười (hiện khi .vui) */}
                <path
                  className="mat-cuoi"
                  d="M 156 106 Q 163 99 169 106"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                {/* Mí mắt rũ khi buồn (.buon) */}
                <path
                  className="mi-mat-buon"
                  d="M 156 106 Q 163 104 170 101"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Mí mắt sụp mệt mỏi (.met) */}
                <path
                  className="mi-mat-met"
                  d="M 156 105 L 170 105"
                  fill="none"
                  stroke="#18181B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Quầng thâm nhẹ dưới mắt khi mệt (.met) */}
                <path
                  className="quang-tham-met"
                  d="M 158 111 Q 163 113.5 168 111"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.2"
                />
              </g>

              {/* LÔNG MÀY (long-may) */}
              <g className="long-may">
                {/* Lông mày trái */}
                <path
                  className="long-may-trai"
                  d="M 127 94 Q 134 90.5 142 93.5"
                  fill="none"
                  stroke="#1E232A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '134px 92px' }}
                />
                {/* Lông mày phải */}
                <path
                  className="long-may-phai"
                  d="M 156 93.5 Q 164 90.5 171 94"
                  fill="none"
                  stroke="#1E232A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ transformOrigin: '164px 92px' }}
                />
              </g>

              {/* MIỆNG (mieng): Đổi trạng thái theo class biểu cảm */}
              <g className="mieng">
                {/* 1. Đứng yên / mặc định: nụ cười mỉm nhẹ hiền lành */}
                <path
                  className="mieng-path mieng-dung-yen"
                  d="M 145 125 Q 149.5 127.5 154 125"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* 2. Vui: nụ cười tươi hé mở ấm áp */}
                <path
                  className="mieng-path mieng-vui"
                  d="M 144 123 Q 149.5 131 155 123 Z"
                  fill="#E11D48"
                  stroke="#881337"
                  strokeWidth="1.4"
                />
                {/* 3. Buồn: khóe miệng hơi trễ xuống */}
                <path
                  className="mieng-path mieng-buon"
                  d="M 145 127 Q 149.5 124 154 127"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* 4. Suy nghĩ: miệng mím lệch một bên */}
                <path
                  className="mieng-path mieng-suy-nghi"
                  d="M 145 126.5 Q 150 125 155 127.5"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* 5. Mệt: hé thở dài mệt mỏi */}
                <path
                  className="mieng-path mieng-met"
                  d="M 146 125 Q 149.5 128.5 153 125"
                  fill="none"
                  stroke="#9F1239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* 6. Bất ngờ: miệng chữ O nhỏ ngạc nhiên */}
                <ellipse
                  className="mieng-path mieng-bat-ngo"
                  cx="149.5"
                  cy="126"
                  rx="3.2"
                  ry="4.2"
                  fill="#9F1239"
                />
              </g>

              {/* TÓC TRƯỚC (toc-truoc): Mái ngắn layer hiện đại, thanh niên gọn gàng */}
              <g className="toc-truoc">
                {/* Mái ngắn tỉa layer texture che 1/3 trán, đường nét dứt khoát */}
                <path
                  d="M 121 76 C 119 60, 132 48, 150 48 C 168 48, 181 60, 179 76 L 178 82 C 174 78, 170 78, 166 84 C 162 78, 158 77, 154 85 C 150 78, 146 77, 142 85 C 138 78, 134 78, 130 84 C 126 78, 123 79, 121 82 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                {/* Tóc mai ngắn gọn gàng hai bên thái dương, không rủ dài */}
                <path
                  d="M 121 76 L 122 86 C 123 90, 125 92, 126 90 L 125 80 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                <path
                  d="M 179 76 L 178 86 C 177 90, 175 92, 174 90 L 175 80 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                {/* Lọn tóc ngắn tự nhiên trên đỉnh đầu */}
                <path
                  d="M 147 48 Q 150 42 155 45 Q 151 47 149 49 Z"
                  fill="var(--mau-toc, #1E232A)"
                />
                {/* Dải sáng highlight phản chiếu ánh sáng anime flat trên mái tóc */}
                <path
                  d="M 126 66 Q 150 62 174 66 Q 150 64 126 66 Z"
                  fill="var(--mau-toc-highlight, rgba(255, 255, 255, 0.28))"
                />
              </g>

              {/* CÁC HIỆU ỨNG PHỤ HỌA BIỂU CẢM */}
              {/* Giọt mồ hôi bên thái dương khi .met */}
              <g className="bieu-cam-mo-hoi">
                <path
                  d="M 114 94 C 112 94, 110 97, 110 100 C 110 102.5, 112 104, 114 104 C 116 104, 118 102.5, 118 100 C 118 97, 116 94, 114 94 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="0.8"
                />
                <circle cx="113" cy="99" r="0.8" fill="#FFFFFF" />
              </g>

              {/* Dấu hỏi khi .suy-nghi */}
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

              {/* Dấu chấm than và tia giật mình khi .bat-ngo */}
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
                {/* Các vệt tia giật mình quanh đầu */}
                <line x1="112" y1="65" x2="104" y2="58" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="110" y1="78" x2="100" y2="78" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                <line x1="188" y1="78" x2="198" y2="78" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>

        {/* ========================================================
            6. PHỤ KIỆN LỚP TRƯỚC (phu-kien)
            Thẻ sinh viên đeo cổ + quai balo + tai nghe quàng cổ
            ======================================================== */}
        <g className="phu-kien phu-kien-lop-truoc">
          {/* Quai balo vắt qua vai trái xuống sườn */}
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
              {/* Khóa tăng giảm dây balo */}
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

          {/* Tai nghe quàng quanh cổ (headphones) */}
          {showHeadphones && (
            <g className="tai-nghe-quang-co">
              {/* Vòng đệm quàng sau gáy */}
              <path
                d="M 132 152 Q 150 159 168 152"
                fill="none"
                stroke="#475569"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Củ tai nghe trái */}
              <rect x="127" y="148" width="8" height="12" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
              {/* Củ tai nghe phải */}
              <rect x="165" y="148" width="8" height="12" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
            </g>
          )}

          {/* Dây đeo thẻ sinh viên quanh cổ (lanyard) */}
          {showStudentCard && (
            <g className="the-sinh-vien-group">
              {/* Hai dải dây vải rủ từ cổ xuống ngực */}
              <path
                d="M 143 154 L 149 216 M 157 154 L 151 216"
                fill="none"
                stroke="var(--phu-kien, #2563EB)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Khóa kim loại móc thẻ */}
              <rect
                x="148"
                y="216"
                width="4"
                height="5"
                rx="1"
                fill="#CBD5E1"
                stroke="#64748B"
                strokeWidth="0.8"
              />
              {/* Bao thẻ sinh viên dọc bằng nhựa trong */}
              <rect
                x="142"
                y="221"
                width="16"
                height="24"
                rx="2"
                fill="#FFFFFF"
                stroke="var(--phu-kien, #2563EB)"
                strokeWidth="1.2"
              />
              {/* Ảnh thẻ sinh viên mini */}
              <rect
                x="145"
                y="224"
                width="6"
                height="7"
                rx="1"
                fill="#93C5FD"
              />
              {/* Các vạch tên & MSSV */}
              <line x1="145" y1="234" x2="155" y2="234" stroke="#64748B" strokeWidth="1" />
              <line x1="145" y1="237" x2="153" y2="237" stroke="#94A3B8" strokeWidth="0.8" />
              <line x1="145" y1="240" x2="151" y2="240" stroke="#CBD5E1" strokeWidth="0.8" />
              {/* Vạch màu trường đại học ở đáy thẻ */}
              <rect
                x="142"
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
            7. ĐẠO CỤ HỖ TRỢ CÁC TƯ THẾ (PROPS)
            ======================================================== */}

        {/* 7.1 ĐẠO CỤ XE MÁY (cho tư thế .ngoi-chay-xe) */}
        <g className="dao-cu-xe-may">
          {/* Ghi-đông ngang xe máy */}
          <path
            d="M 90 268 C 105 264, 135 260, 150 260 C 165 260, 195 264, 210 268"
            fill="none"
            stroke="#334155"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Tay nắm cao su hai bên */}
          <rect x="86" y="264" width="16" height="8" rx="2" fill="#0F172A" />
          <rect x="198" y="264" width="16" height="8" rx="2" fill="#0F172A" />
          {/* Đồng hồ công tơ mét giữa đầu xe */}
          <ellipse cx="150" cy="258" rx="14" ry="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="150" cy="258" r="6" fill="#0284C7" opacity="0.7" />
          {/* Gương chiếu hậu trái */}
          <line x1="98" y1="264" x2="90" y2="246" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="88" cy="242" rx="7" ry="5" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.2" />
          {/* Gương chiếu hậu phải */}
          <line x1="202" y1="264" x2="210" y2="246" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="212" cy="242" rx="7" ry="5" fill="#38BDF8" stroke="#1E293B" strokeWidth="1.2" />
        </g>

        {/* 7.2 ĐẠO CỤ BÀN HỌC (cho tư thế .ngoi-ban-hoc) */}
        <g className="dao-cu-ban-hoc">
          {/* Mặt bàn gỗ học bài */}
          <rect x="75" y="324" width="150" height="12" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          <rect x="75" y="336" width="150" height="6" fill="#451A03" />
          {/* Cuốn tập / giáo trình mở ra */}
          <polygon points="126,324 148,321 170,324 168,314 148,312 128,314" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          {/* Cây bút bi */}
          <line x1="172" y1="316" x2="182" y2="322" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          {/* Cốc nước / cà phê sinh viên */}
          <rect x="88" y="312" width="11" height="13" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          {/* Làn khói nước ấm bốc nhẹ */}
          <path d="M 91 308 Q 93 304 92 300 M 96 308 Q 94 304 96 300" fill="none" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" />
        </g>

        {/* 7.3 ĐẠO CỤ ĐIỆN THOẠI (cho tư thế .cui-nhin-dien-thoai) */}
        <g className="dao-cu-dien-thoai">
          {/* Ánh sáng xanh màn hình hắt lên mặt Minh */}
          <polygon
            points="140,234 160,234 174,136 126,136"
            fill="url(#minh-phone-screen-glow)"
          />
          {/* Chiếc điện thoại thông minh trên tay */}
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
          {/* Màn hình phát sáng */}
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
