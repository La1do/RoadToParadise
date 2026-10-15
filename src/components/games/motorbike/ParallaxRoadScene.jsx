import React from 'react';

/**
 * ParallaxRoadScene - Cảnh con đường parallax góc nhìn thứ nhất
 * Hoàn toàn bằng CSS keyframes (chỉ animate transform và opacity).
 *
 * Các lớp chiều sâu:
 * 1. Bầu trời & Mây (Sky & Clouds) đổi tông theo chặng (sáng sớm -> trưa -> chiều tà -> đêm)
 * 2. Đường chân trời thành phố / rặng cây xa (Distant skyline)
 * 3. Hàng cây ven đường & cột điện trượt ra rìa
 * 4. Mặt đường phối cảnh hội tụ & vạch sơn trắng tiến về phía người lái
 * 5. Đốm nắng loang qua tán cây chiếu xuống mặt đường
 */
export default function ParallaxRoadScene({
  chang = 1, // 1: sáng sớm, 2: trưa nắng gắt, 3: hoàng hôn chiều tà, 4: đêm phán xét
  isFocusMode = false, // Giảm tốc độ còn 30-40% và blur nhẹ khi người chơi đang sắp thẻ/gõ
  isReducedMotion = false, // Tùy chọn giảm chuyển động cho người nhạy cảm tiền đình
  children,
}) {
  return (
    <div
      className={`parallax-road-viewport chang-${chang} ${
        isFocusMode ? 'is-focus-mode' : ''
      } ${isReducedMotion ? 'reduced-motion' : ''}`}
    >
      {/* LỚP 1: BẦU TRỜI & ÁNH SÁNG MÔI TRƯỜNG */}
      <div className="layer-sky">
        <div className="sky-sun" />
        <div className="sky-clouds" />
      </div>

      {/* LỚP 2: ĐƯỜNG CHÂN TRỜI XA (Núi / Cao ốc xa xôi trôi chậm) */}
      <div className="layer-horizon">
        <div className="horizon-silhouette" />
      </div>

      {/* LỚP 3: CẢNH VẬT VEN ĐƯỜNG TRƯỢT RA RÌA (Nhà cửa, cột điện, cây xanh) */}
      <div className="layer-roadside-scenery">
        {/* Hàng cây & cột điện bên trái */}
        <div className="scenery-side scenery-left">
          <div className="tree-element tree-1" />
          <div className="pole-element pole-1" />
          <div className="tree-element tree-2" />
        </div>
        {/* Hàng cây & nhà phố bên phải */}
        <div className="scenery-side scenery-right">
          <div className="tree-element tree-3" />
          <div className="pole-element pole-2" />
          <div className="house-element house-1" />
        </div>
      </div>

      {/* LỚP 4: MẶT ĐƯỜNG PHỐI CẢNH HỘI TỤ (Con đường nhựa hướng về người lái) */}
      <div className="layer-road-perspective">
        {/* Vỉa hè hai bên */}
        <div className="curb curb-left" />
        <div className="curb curb-right" />

        {/* Mặt đường nhựa & vạch kẻ đường tiến tới liên tục */}
        <div className="road-surface">
          <div className="road-lane-stripes" />
        </div>

        {/* Lớp bóng nắng loang lổ qua vòm lá rọi xuống đường */}
        <div className="sunlight-dapples" />
      </div>

      {/* LỚP PHỦ MỜ TẬP TRUNG (Focus dim overlay khi đang xếp thẻ / gõ bài) */}
      <div className="layer-focus-backdrop" />

      {/* VÙNG CHỨA CÁC THÀNH PHẦN NỘI DUNG (Tay lái xe & Thẻ bài Game) */}
      <div className="road-scene-content">
        {children}
      </div>
    </div>
  );
}
