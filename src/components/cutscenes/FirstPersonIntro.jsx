import React, { useState, useEffect, useRef } from 'react';
import './FirstPersonIntro.css';

/**
 * Cảnh mở đầu góc nhìn thứ nhất (First-Person POV Intro)
 *
 * Flow 6-8s:
 * 1. idle / vibrate: Phòng trọ sáng sớm, điện thoại nằm thấp rung nhẹ
 * 2. handIn: Bàn tay góc nhìn thứ nhất trượt lên cầm điện thoại
 * 3. screenOn: Điện thoại dừng giữa màn hình, nghiêng 6°, màn hình sáng, thông báo trượt xuống
 * 4. zoom: Điện thoại phóng to (scale 1 -> 2.2), nền phòng tăng blur
 * 5. chat: Tin nhắn mở ra, chữ hiện nguyên văn noiDungCauHoi
 * 6. input: Khung tin nhắn thu lên đầu làm khung mẫu, ô nhập trượt lên từ dưới và autoFocus -> Bắt đầu Game 1
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
  // State machine: 'vibrate' -> 'handIn' -> 'screenOn' -> 'zoom' -> 'chat' -> 'input'
  const [animState, setAnimState] = useState('vibrate');
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef(null);
  const timerRef = useRef([]);

  const clearAllTimers = () => {
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];
  };

  useEffect(() => {
    // Sequence tự động chuyển state
    const t1 = setTimeout(() => setAnimState('handIn'), 1200);
    const t2 = setTimeout(() => setAnimState('screenOn'), 2400);
    const t3 = setTimeout(() => setAnimState('zoom'), 3800);
    const t4 = setTimeout(() => setAnimState('chat'), 4800);
    const t5 = setTimeout(() => setAnimState('input'), 6600);

    timerRef.current = [t1, t2, t3, t4, t5];

    return () => clearAllTimers();
  }, []);

  // Khi chuyển sang state input: tự động focus ô gõ
  useEffect(() => {
    if (animState === 'input') {
      const focusTimer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(focusTimer);
    }
  }, [animState]);

  // Nút Bỏ qua: nhảy thẳng đến state input
  const handleSkip = () => {
    clearAllTimers();
    setAnimState('input');
    if (onSkip) onSkip();
  };

  const handleStartTyping = e => {
    e.preventDefault();
    if (onStartGame1) {
      onStartGame1({
        soCau,
        userInput,
        dapAnMau
      });
    }
  };

  return (
    <div
      className={`fp-intro-container stage-${chang} state-${animState}`}
      data-state={animState}
    >
      {/* Nút Bỏ qua luôn có sẵn, touch target >= 44px */}
      {animState !== 'input' && (
        <button
          type="button"
          className="fp-skip-btn"
          onClick={handleSkip}
          aria-label="Bỏ qua cảnh mở đầu"
        >
          Bỏ qua ❯❯
        </button>
      )}

      {/* 1. Nền phòng trọ buổi sáng + ô cửa sổ ánh sáng hắt */}
      <div className="fp-room-background">
        <div className="fp-window-light" />
        <div className="fp-dust-motes" />
        <div className="fp-desk-surface" />
      </div>

      {/* 2. Cánh tay & Điện thoại góc nhìn thứ nhất */}
      <div className="fp-first-person-rig">
        {/* Bàn tay SVG flat vươn từ dưới cổ tay lên */}
        <div className="fp-hand-wrapper">
          <svg
            className="fp-hand-svg"
            viewBox="0 0 320 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fpSkin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="60%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fdba74" />
              </linearGradient>
              <linearGradient id="fpShadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#c2410c" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Cổ tay và cẳng tay vươn lên */}
            <path
              d="M 60 400 L 90 260 C 95 240, 110 220, 130 210 L 150 200 L 190 210 C 210 220, 225 240, 230 260 L 260 400 Z"
              fill="url(#fpSkin)"
            />
            {/* Lòng bàn tay & bóng cel-shading */}
            <path
              d="M 90 260 C 95 230, 115 210, 140 205 L 180 205 C 205 210, 225 230, 230 260 Z"
              fill="url(#fpShadow)"
            />

            {/* Các ngón tay ôm viền sau điện thoại */}
            {/* Ngón út */}
            <path
              d="M 75 250 C 65 240, 60 210, 75 195 C 85 185, 100 190, 105 210 L 95 255 Z"
              fill="url(#fpSkin)"
              stroke="#fb923c"
              strokeWidth="1.5"
            />
            {/* Ngón áp út */}
            <path
              d="M 85 220 C 75 200, 70 170, 85 155 C 95 145, 110 150, 115 175 L 105 225 Z"
              fill="url(#fpSkin)"
              stroke="#fb923c"
              strokeWidth="1.5"
            />
            {/* Ngón giữa */}
            <path
              d="M 105 190 C 95 170, 95 135, 110 120 C 122 110, 135 118, 138 145 L 125 195 Z"
              fill="url(#fpSkin)"
              stroke="#fb923c"
              strokeWidth="1.5"
            />
            {/* Ngón trỏ */}
            <path
              d="M 130 170 C 125 150, 128 120, 145 108 C 158 100, 170 108, 170 135 L 155 180 Z"
              fill="url(#fpSkin)"
              stroke="#fb923c"
              strokeWidth="1.5"
            />

            {/* Ngón cái đặt ở mép phải/trước điện thoại */}
            <path
              d="M 220 250 C 235 230, 248 190, 238 170 C 228 152, 210 160, 205 185 L 198 230 Z"
              fill="url(#fpSkin)"
              stroke="#fb923c"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Thân điện thoại Smartphone */}
        <div className="fp-phone-device">
          <div className="fp-phone-speaker" />
          <div className="fp-phone-camera" />

          {/* Màn hình điện thoại */}
          <div className="fp-phone-screen">
            {/* Thanh trạng thái đỉnh máy */}
            <div className="fp-status-bar">
              <span className="fp-status-time">06:00</span>
              <div className="fp-status-icons">
                <span className="fp-icon-wifi">📶</span>
                <span className="fp-icon-battery">🔋 98%</span>
              </div>
            </div>

            {/* 3. Banner thông báo trượt xuống */}
            <div className="fp-notification-card">
              <div className="fp-noti-header">
                <span className="fp-noti-badge">🔔 LỜI SỐNG HÔM NAY</span>
                <span className="fp-noti-time">Vừa xong</span>
              </div>
              <div className="fp-noti-title">
                Chào {tenNhanVat}, câu kinh hôm nay: <strong>Câu {soCau}</strong>
              </div>
              <div className="fp-noti-hint">Chạm để mở nguyên văn bài học</div>
            </div>

            {/* 4 & 5. Khung tin nhắn chat hiện nguyên văn noiDungCauHoi */}
            <div className="fp-chat-view">
              <div className="fp-chat-bubble">
                <div className="fp-chat-sender">
                  <span>✦ Thầy gửi {tenNhanVat} • Câu {soCau}</span>
                </div>
                <div className="fp-chat-text">
                  {noiDungCauHoi}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Chế độ Input / Bắt đầu Game 1 (Chép lại) */}
      <div className="fp-game1-panel">
        {/* Khung mẫu thu nhỏ cố định ở trên đỉnh */}
        <div className="fp-reference-card">
          <div className="fp-ref-badge">MẪU CÂU {soCau} • ĐÁP ÁN CHUẨN</div>
          <div className="fp-ref-text">{dapAnMau}</div>
        </div>

        {/* Form nhập liệu trượt từ dưới lên */}
        <form className="fp-input-form" onSubmit={handleStartTyping}>
          <div className="fp-input-label">
            <span>✍️ Hãy nhẩm lại và gõ chính xác:</span>
          </div>

          <textarea
            ref={inputRef}
            className="fp-textarea"
            rows={3}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Gõ đáp án chuẩn vào đây..."
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <button type="submit" className="fp-submit-btn">
            Bắt đầu kiểm tra Game 1 →
          </button>
        </form>
      </div>
    </div>
  );
}
