import React, { useState } from 'react';
import './FirstPersonIntro.css';

/**
 * Màn hình tương tác mở thông báo điện thoại (Interactive Phone Notification)
 *
 * Flow:
 * 1. waiting: Điện thoại rung trên bàn phòng trọ, có sóng rung và hướng dẫn "Chạm vào điện thoại để nhận thông báo".
 * 2. opened: Người dùng chạm vào -> Điện thoại mở sáng, hiện đầy đủ CÂU HỎI và ĐÁP ÁN CHUẨN.
 * 3. Bấm "Bắt đầu học" -> Chuyển sang Game 1 (hoặc callback onStartGame1).
 */
export default function FirstPersonIntro({
  tenNhanVat = 'Minh',
  soCau = 1,
  noiDungCauHoi = 'Đức Chúa Trời ban cho hai loại khải thị ① là gì? trong đó, thời thành đạt khải huyền các đầy tớ của Đức Chúa Trời phải nhận khải thị ② gì? Hãy viết khải thị này ③ được truyền đạt theo quá trình nào?',
  dapAnMau = 'Khải thị khải tượng (lời tiên tri), Khải thị thực thể',
  chang = 1,
  onStartGame1,
  onSkip
}) {
  // Trạng thái: 'waiting' (đang rung chờ bấm) | 'opened' (đã mở xem câu hỏi & đáp án)
  const [isOpened, setIsOpened] = useState(false);

  // Xử lý chạm vào điện thoại để mở thông báo
  const handleOpenPhone = () => {
    if (!isOpened) {
      setIsOpened(true);
    }
  };

  const handleSkip = () => {
    setIsOpened(true);
    if (onSkip) onSkip();
  };

  const handleStartPractice = () => {
    if (onStartGame1) {
      onStartGame1({
        soCau,
        noiDungCauHoi,
        dapAnMau
      });
    }
  };

  return (
    <div
      className={`fp-interactive-container stage-${chang} ${isOpened ? 'is-opened' : 'is-waiting'}`}
      data-opened={isOpened}
    >
      {/* 1. Nền phòng trọ buổi sáng */}
      <div className="fp-room-background">
        <div className="fp-window-light" />
        <div className="fp-dust-motes" />
        <div className="fp-desk-surface" />
      </div>

      {/* Nút Bỏ qua để mở ngay */}
      {!isOpened && (
        <button
          type="button"
          className="fp-skip-btn"
          onClick={handleSkip}
          aria-label="Bỏ qua và xem ngay"
        >
          Mở nhanh ❯❯
        </button>
      )}

      {/* 2. Điện thoại tương tác (không dùng tay) */}
      <div className="fp-phone-stage">
        {/* Chỉ báo hướng dẫn chạm khi chưa mở */}
        {!isOpened && (
          <div className="fp-tap-guide-bubble" onClick={handleOpenPhone}>
            <span className="fp-tap-finger">👆</span>
            <span className="fp-tap-text">Nhấn vào điện thoại để nhận thông báo</span>
          </div>
        )}

        {/* Khung điện thoại */}
        <div
          className={`fp-phone-body ${!isOpened ? 'phone-vibrating' : 'phone-active'}`}
          onClick={handleOpenPhone}
          role="button"
          tabIndex={0}
          aria-label="Điện thoại đang rung thông báo, nhấn để mở"
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') handleOpenPhone();
          }}
        >
          {/* Hiệu ứng sóng rung tỏa ra khi chưa mở */}
          {!isOpened && (
            <div className="fp-vibe-ripples">
              <span className="fp-ripple r1" />
              <span className="fp-ripple r2" />
              <span className="fp-ripple r3" />
            </div>
          )}

          {/* Cụm loa và camera trước */}
          <div className="fp-notch-bar">
            <span className="fp-speaker" />
            <span className="fp-camera" />
          </div>

          {/* Màn hình điện thoại */}
          <div className="fp-screen-content">
            {/* Header thanh trạng thái */}
            <div className="fp-phone-header">
              <span className="fp-clock">06:00</span>
              <span className="fp-carrier">✦ Sống Mỗi Ngày</span>
              <span className="fp-battery">🔋 98%</span>
            </div>

            {/* TRẠNG THÁI 1: MÀN HÌNH KHÓA RUNG CHỜ CHẠM */}
            {!isOpened && (
              <div className="fp-lock-screen">
                <div className="fp-lock-icon">🔒</div>
                <div className="fp-lock-time">06:00</div>
                <div className="fp-lock-date">Sáng sớm phòng trọ</div>

                {/* Banner thông báo nhấp nháy */}
                <div className="fp-lock-banner">
                  <div className="fp-banner-badge">
                    <span>🔔 THÔNG BÁO MỚI</span>
                    <span className="fp-badge-live">Vừa xong</span>
                  </div>
                  <div className="fp-banner-main">
                    Câu kinh hôm nay: <strong>Câu {soCau}</strong>
                  </div>
                  <div className="fp-banner-callaction">
                    👉 Chạm để mở câu hỏi & đáp án
                  </div>
                </div>
              </div>
            )}

            {/* TRẠNG THÁI 2: ĐÃ MỞ - HIỆN CẢ CÂU HỎI VÀ ĐÁP ÁN */}
            {isOpened && (
              <div className="fp-opened-content">
                {/* Tiêu đề thông báo */}
                <div className="fp-opened-banner">
                  <div className="fp-opened-tag">📖 LỜI SỐNG HÔM NAY • CÂU {soCau}</div>
                  <div className="fp-opened-subtitle">Gửi {tenNhanVat} bắt đầu ngày mới</div>
                </div>

                {/* Phần 1: NỘI DUNG CÂU HỎI */}
                <div className="fp-section-card question-card">
                  <div className="fp-card-title">
                    <span className="fp-card-icon">❓</span>
                    <strong>NỘI DUNG CÂU HỎI</strong>
                  </div>
                  <div className="fp-card-body question-text">
                    {noiDungCauHoi}
                  </div>
                </div>

                {/* Phần 2: ĐÁP ÁN CHUẨN */}
                <div className="fp-section-card answer-card">
                  <div className="fp-card-title answer-title">
                    <span className="fp-card-icon">✦</span>
                    <strong>ĐÁP ÁN CHUẨN CẦN NHỚ</strong>
                  </div>
                  <div className="fp-card-body answer-text">
                    {dapAnMau}
                  </div>
                </div>

                {/* Nút bắt đầu thực hành Game 1 */}
                <div className="fp-action-footer">
                  <button
                    type="button"
                    className="fp-start-btn"
                    onClick={e => {
                      e.stopPropagation();
                      handleStartPractice();
                    }}
                  >
                    Bắt đầu học câu này (Game 1: Chép lại) →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
