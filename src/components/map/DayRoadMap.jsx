import React, { useState, useMemo } from 'react';
import defaultQuestionsData from '../../data/questions.json';
import {
  loadSRSData,
  loadLearningProgress,
  loadMistakeBook,
  LEARNING_STEPS
} from '../../core';
import {
  STAGES_CONFIG,
  getMasteryGlowClass,
  getMasteryLabel,
  calculateRoadmapStats
} from './dayRoadMapConfig.js';
import './DayRoadMap.css';

export {
  STAGES_CONFIG,
  getMasteryGlowClass,
  getMasteryLabel,
  calculateRoadmapStats
};

/**
 * Avatar icon Minh
 */
function MinhAvatar({ isFloating = true, size = 44 }) {
  return (
    <div
      className={`minh-avatar-container ${isFloating ? 'floating-anim' : ''}`}
      style={{ width: size, height: size }}
      title="Nhân vật Minh"
    >
      <svg
        viewBox="0 0 100 100"
        className="minh-avatar-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="minhSkin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
          <linearGradient id="minhShirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7bb5e8" />
            <stop offset="100%" stopColor="#4a82b8" />
          </linearGradient>
          <linearGradient id="minhHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id="minhHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Vòng sáng quanh đầu */}
        <circle cx="50" cy="50" r="48" fill="url(#minhHalo)" />
        <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Áo sinh viên */}
        <path d="M 24 88 Q 50 74 76 88 L 82 98 L 18 98 Z" fill="url(#minhShirt)" />
        <path d="M 44 80 L 50 87 L 56 80 Z" fill="#ffffff" />

        {/* Cổ áo & cổ */}
        <rect x="44" y="66" width="12" height="12" fill="url(#minhSkin)" rx="2" />

        {/* Tai */}
        <circle cx="30" cy="52" r="5" fill="#fcd34d" />
        <circle cx="70" cy="52" r="5" fill="#fcd34d" />

        {/* Mặt */}
        <rect x="32" y="36" width="36" height="34" rx="14" fill="url(#minhSkin)" />

        {/* Tóc */}
        <path
          d="M 30 42 C 28 26, 42 22, 50 22 C 60 22, 72 26, 70 42 C 65 34, 55 35, 50 35 C 44 35, 36 34, 30 42 Z"
          fill="url(#minhHair)"
        />
        {/* Mái tóc lệch */}
        <path d="M 36 34 Q 44 38 48 35 Q 40 30 36 34 Z" fill="url(#minhHair)" />

        {/* Đôi mắt sáng */}
        <ellipse cx="43" cy="50" rx="3.5" ry="4.5" fill="#0f172a" />
        <circle cx="44.2" cy="48.5" r="1.3" fill="#ffffff" />
        <ellipse cx="57" cy="50" rx="3.5" ry="4.5" fill="#0f172a" />
        <circle cx="58.2" cy="48.5" r="1.3" fill="#ffffff" />

        {/* Má hồng hiền lành */}
        <circle cx="37" cy="56" r="3.5" fill="#f87171" opacity="0.4" />
        <circle cx="63" cy="56" r="3.5" fill="#f87171" opacity="0.4" />

        {/* Nụ cười */}
        <path d="M 46 58 Q 50 63 54 58" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/**
 * Component chính: Bản đồ một ngày (DayRoadMap)
 */
export default function DayRoadMap({
  questions = defaultQuestionsData.questions,
  srsData: externalSRSData,
  learningProgress: externalLearningProgress,
  mistakeBook: externalMistakeBook,
  currentQuestionId,
  characterName = 'Minh',
  onSelectAction,
  onOpenMistakeBook,
  onSelectQuestion
}) {
  // Đọc dữ liệu nếu không truyền props
  const srsMap = useMemo(() => {
    return externalSRSData || loadSRSData();
  }, [externalSRSData]);

  const stepProgress = useMemo(() => {
    return externalLearningProgress || loadLearningProgress();
  }, [externalLearningProgress]);

  const mistakeData = useMemo(() => {
    return externalMistakeBook || loadMistakeBook();
  }, [externalMistakeBook]);

  // Modal state khi click vào câu / ô
  const [activeModalData, setActiveModalData] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  // Tính toán thống kê toàn bộ 50 ô
  const stats = useMemo(() => {
    return calculateRoadmapStats(questions, srsMap, mistakeData);
  }, [questions, srsMap, mistakeData]);

  // Xác định câu/chặng hiện tại của người chơi Minh
  const effectiveCurrentQuestionId = useMemo(() => {
    if (currentQuestionId && currentQuestionId >= 1 && currentQuestionId <= 20) {
      return currentQuestionId;
    }
    // Tự động: tìm câu đầu tiên có ô chưa thuộc (level < 3)
    for (const q of questions) {
      for (const s of q.slots) {
        const key = `q${q.id}_s${s.slotIndex}`;
        const lvl = srsMap[key]?.masteryLevel || 0;
        if (lvl < 3) {
          return q.id;
        }
      }
    }
    // Nếu tất cả đã >= 3, tìm câu có level < 5
    for (const q of questions) {
      for (const s of q.slots) {
        const key = `q${q.id}_s${s.slotIndex}`;
        const lvl = srsMap[key]?.masteryLevel || 0;
        if (lvl < 5) {
          return q.id;
        }
      }
    }
    return 20; // Đã đạt đỉnh
  }, [currentQuestionId, questions, srsMap]);

  // Phân bổ câu hỏi theo 4 chặng
  const stagesWithQuestions = useMemo(() => {
    return STAGES_CONFIG.map((stage) => {
      const stageQuestions = questions.filter(
        (q) => q.id >= stage.questionRange[0] && q.id <= stage.questionRange[1]
      );
      return {
        ...stage,
        questions: stageQuestions
      };
    });
  }, [questions]);

  // Xử lý mở modal cho câu
  const handleOpenQuestionModal = (question, slotIndex = 0) => {
    setActiveModalData(question);
    setSelectedSlotIndex(slotIndex);
    if (onSelectQuestion) {
      onSelectQuestion(question);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setActiveModalData(null);
  };

  // Kích hoạt action học / thi
  const triggerAction = (mode, step = 1) => {
    if (!activeModalData) return;
    const slot = activeModalData.slots[selectedSlotIndex] || activeModalData.slots[0];
    const payload = {
      mode, // 'learn' | 'exam'
      question: activeModalData,
      slot,
      step: mode === 'learn' ? step : undefined
    };

    if (onSelectAction) {
      onSelectAction(payload);
    } else {
      console.log('Action triggered:', payload);
      alert(
        `Bắt đầu ${mode === 'learn' ? `Học Bậc ${step}: ${LEARNING_STEPS[step - 1]?.name}` : 'Thi'} cho Câu ${activeModalData.id} - Ô ${slot.label}`
      );
    }
    handleCloseModal();
  };

  // Slot đang chọn trong modal
  const activeSlot = activeModalData?.slots[selectedSlotIndex] || activeModalData?.slots[0];
  const activeSlotKey = activeModalData && activeSlot ? `q${activeModalData.id}_s${activeSlot.slotIndex}` : '';
  const activeSlotLevel = activeSlotKey ? srsMap[activeSlotKey]?.masteryLevel || 0 : 0;
  const activeSlotStep = activeSlotKey ? stepProgress[activeSlotKey] || 0 : 0;
  const nextRecommendedStep = Math.min(6, (activeSlotStep || 0) + 1);

  return (
    <div
      className="day-roadmap-root"
      style={{
        '--do-thuoc': stats.masteryRatio
      }}
    >
      {/* 1. Thanh Header sticky */}
      <header className="day-roadmap-header">
        <div className="header-character-info">
          <div className="header-avatar-badge">
            <MinhAvatar isFloating={false} size={36} />
            <div className="character-name-box">
              <span className="character-label">Nhân vật</span>
              <strong className="character-name">{characterName}</strong>
            </div>
          </div>

          <div className="header-metrics">
            <div className="metric-box">
              <span className="metric-title">Tổng độ thuộc</span>
              <div className="metric-bar-wrap">
                <div
                  className="metric-bar-fill"
                  style={{ width: `${stats.masteryPercentage}%` }}
                />
              </div>
              <strong className="metric-value">{stats.masteryPercentage}%</strong>
            </div>

            <div className="metric-box slot-count-box">
              <span className="metric-title">Số ô đã thuộc</span>
              <span className="metric-count-text">
                <strong className="count-highlight">{stats.masteredCount}</strong> / {stats.totalSlots || 50} ô
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn-mistake-book"
          onClick={() => {
            if (onOpenMistakeBook) {
              onOpenMistakeBook();
            } else {
              alert(`Mở Sổ Tiếc Nuối: Bạn có ${stats.unresolvedMistakes} ô cần khắc phục.`);
            }
          }}
          title="Mở Sổ Tiếc Nuối để ôn lại các câu từ hay sai"
        >
          <span className="mistake-icon" aria-hidden="true">📖</span>
          <span className="mistake-btn-text">Sổ Tiếc Nuối</span>
          {stats.unresolvedMistakes > 0 && (
            <span className="mistake-badge">{stats.unresolvedMistakes}</span>
          )}
        </button>
      </header>

      {/* 2. Bản đồ dọc cuộn uốn lượn */}
      <main className="day-roadmap-main">
        {/* Điểm đầu: Sáng phòng trọ */}
        <section className="map-start-node" aria-label="Điểm khởi hành sáng sớm">
          <div className="start-node-card">
            <div className="start-icon-wrap">
              <span className="start-icon" role="img" aria-label="Đồng hồ & phòng trọ">🌅</span>
              <div className="time-badge">05:30 Sáng</div>
            </div>
            <div className="start-node-info">
              <h2 className="start-node-title">Phòng trọ buổi sáng</h2>
              <p className="start-node-desc">
                Tiếng chuông sớm vang lên. Minh thức dậy, bước vào ngày mới cùng 20 lời khải thị.
              </p>
            </div>
          </div>
          <div className="start-trail-connector" />
        </section>

        {/* 4 Chặng nối tiếp nhau */}
        {stagesWithQuestions.map((stage, stageIdx) => {
          const isMinhInThisStage = stage.questions.some(
            (q) => q.id === effectiveCurrentQuestionId
          );

          return (
            <section
              key={stage.id}
              className={`stage-section stage-theme-${stage.id}`}
              style={{
                '--stage-color': stage.color,
                '--stage-accent': stage.accentColor
              }}
            >
              {/* Stage Milestone Banner */}
              <div className="stage-banner">
                <div className="stage-banner-header">
                  <div className="stage-icon-pill">
                    <span className="stage-icon">{stage.id === 1 ? '☕' : stage.id === 2 ? '🏫' : stage.id === 3 ? '💼' : '🌙'}</span>
                    <span className="stage-time">{stage.timeSlot}</span>
                  </div>
                  <h3 className="stage-title">{stage.title}</h3>
                </div>
                <p className="stage-desc">{stage.desc}</p>
              </div>

              {/* Con đường uốn lượn các câu */}
              <div className="stage-road-track">
                {/* SVG path background chạy dọc uốn lượn */}
                <svg
                  className="road-svg-canvas"
                  viewBox="0 0 100 500"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`roadGradient-${stage.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {/* Đường cơ bản */}
                  <path
                    d="M 50 0 C 15 100, 85 200, 50 250 C 15 300, 85 400, 50 500"
                    className="road-svg-base"
                  />
                  {/* Đường sáng rực theo --do-thuoc */}
                  <path
                    d="M 50 0 C 15 100, 85 200, 50 250 C 15 300, 85 400, 50 500"
                    className="road-svg-glow"
                  />
                </svg>

                {/* Danh sách các câu hỏi trong chặng */}
                <div className="question-nodes-flow">
                  {stage.questions.map((question, qIdx) => {
                    const isMinhHere = question.id === effectiveCurrentQuestionId;
                    // Lệch trái phải zic-zac tạo dáng uốn lượn
                    const alignmentPattern = ['align-center', 'align-left', 'align-right', 'align-left', 'align-right'];
                    const alignClass = alignmentPattern[qIdx % alignmentPattern.length];

                    return (
                      <div
                        key={question.id}
                        className={`question-step-node ${alignClass} ${isMinhHere ? 'is-current-minh-node' : ''}`}
                      >
                        {/* Avatar Minh định vị trên câu hiện tại */}
                        {isMinhHere && (
                          <div className="minh-locator-pin" aria-label="Minh đang ở câu này">
                            <div className="minh-pin-tag">
                              <span className="pin-pulse" />
                              <span className="pin-text">Minh đang ở đây</span>
                            </div>
                            <MinhAvatar isFloating={true} size={50} />
                            <div className="pin-pointer" />
                          </div>
                        )}

                        {/* Card câu hỏi */}
                        <div
                          className="question-card"
                          onClick={() => handleOpenQuestionModal(question, 0)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleOpenQuestionModal(question, 0);
                            }
                          }}
                          aria-label={`Câu ${question.id}: ${question.slots.length} ô`}
                        >
                          <div className="question-card-top">
                            <span className="question-number-badge">
                              Câu {question.id}
                            </span>
                            <span className="question-slot-count">
                              {question.slots.length} ô
                            </span>
                          </div>

                          <p className="question-snippet">
                            {question.question.length > 72
                              ? `${question.question.slice(0, 72)}...`
                              : question.question}
                          </p>

                          {/* Hàng các ô tròn ① ② ③ */}
                          <div
                            className="slots-round-row"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {question.slots.map((s, slotIdx) => {
                              const sKey = `q${question.id}_s${s.slotIndex}`;
                              const level = srsMap[sKey]?.masteryLevel || 0;
                              const glowClass = getMasteryGlowClass(level);

                              return (
                                <button
                                  key={s.slotIndex}
                                  type="button"
                                  className={`slot-circle-button ${glowClass}`}
                                  onClick={() => handleOpenQuestionModal(question, slotIdx)}
                                  title={`Ô ${s.label} (${s.title || 'Nội dung'}): Level ${level}/5`}
                                  aria-label={`Ô ${s.label}: Level ${level}/5`}
                                >
                                  <span className="slot-symbol">{s.label}</span>
                                  {level === 5 && (
                                    <span className="divine-sparkle" aria-hidden="true">✦</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* Điểm cuối: Cổng Thiên Đàng / Vầng sáng chân trời */}
        <section className="map-heaven-gate-node" aria-label="Cổng Thiên Đàng và vầng sáng chân trời">
          <div className="heaven-aurora-glow" />
          <div className="heaven-rays-bg" />

          <div className="heaven-gate-card">
            <div className="heaven-crown-icon">
              <svg viewBox="0 0 100 80" className="heaven-gate-svg">
                <defs>
                  <linearGradient id="gateGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                {/* Vòm cổng Thiên Đàng */}
                <path d="M 15 75 L 15 35 Q 50 5 85 35 L 85 75" fill="none" stroke="url(#gateGold)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 28 75 L 28 42 Q 50 20 72 42 L 72 75" fill="none" stroke="url(#gateGold)" strokeWidth="3" />
                {/* Trụ cổng */}
                <rect x="10" y="70" width="10" height="8" rx="2" fill="url(#gateGold)" />
                <rect x="80" y="70" width="10" height="8" rx="2" fill="url(#gateGold)" />
                {/* Ngôi sao / Hào quang đỉnh */}
                <polygon points="50,14 54,24 64,24 56,30 59,40 50,34 41,40 44,30 36,24 46,24" fill="#ffffff" />
                <circle cx="50" cy="27" r="16" fill="url(#minhHalo)" opacity="0.6" />
              </svg>
            </div>

            <h2 className="heaven-gate-title">Cổng Thiên Đàng</h2>
            <div className="heaven-sub-badge">Vầng sáng chân trời vĩnh hằng</div>
            <p className="heaven-gate-desc">
              Khi mọi lời dạy được ghi tạc trong tâm trí, con đường trần thế của Minh khép lại trong ánh hào quang khải hoàn rạng rỡ.
            </p>

            {/* Thanh tiến độ về đích */}
            <div className="heaven-progress-card">
              <div className="heaven-progress-label">
                <span>Ánh sáng cuối đường</span>
                <strong>{stats.masteryPercentage}%</strong>
              </div>
              <div className="heaven-bar-track">
                <div
                  className="heaven-bar-fill"
                  style={{ width: `${stats.masteryPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Popup / Modal chọn chế độ Học / Thi khi bấm vào câu hoặc ô */}
      {activeModalData && (
        <div
          className="roadmap-modal-overlay"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-q-title"
        >
          <div
            className="roadmap-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="modal-header">
              <div>
                <span className="modal-stage-tag">
                  Chặng {activeModalData.stageId}: {STAGES_CONFIG[activeModalData.stageId - 1]?.title.split(':')[1] || ''}
                </span>
                <h3 id="modal-q-title" className="modal-title">
                  Câu hỏi {activeModalData.id}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Đóng bảng"
              >
                ✕
              </button>
            </div>

            {/* Trích dẫn câu hỏi */}
            <div className="modal-question-box">
              <span className="modal-section-label" style={{ color: '#4a82b8', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                ❓ NỘI DUNG CÂU HỎI:
              </span>
              <p className="modal-question-text">{activeModalData.question}</p>
            </div>

            {/* Đáp án chuẩn cả câu */}
            <div className="modal-question-box" style={{ background: '#1e293b', borderLeft: '4px solid #f59e0b', marginTop: 10 }}>
              <span className="modal-section-label" style={{ color: '#fbbf24', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                ✦ ĐÁP ÁN CHUẨN CẢ CÂU:
              </span>
              <div style={{ color: '#f8fafc', fontSize: '0.92rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {activeModalData.fullAnswer || activeModalData.slots.map(s => `${s.label} ${s.answer}`).join('\n')}
              </div>
            </div>

            {/* Các nút hành động chính: Học cả câu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => triggerAction('learn', 1)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7bb5e8 0%, #4a82b8 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✍️</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Học cả câu: Game 1 (Chép lại)</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85, fontWeight: 'normal' }}>Gõ lại toàn bộ câu theo mẫu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => triggerAction('learn', 2)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🧩</span>
                <div style={{ textAlign: 'left' }}>
                  <div>Học cả câu: Game 2 (Xáo từ)</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85, fontWeight: 'normal' }}>Sắp xếp các cụm từ cả câu</div>
                </div>
              </button>
            </div>

            {/* Chọn ô trong câu (Tùy chọn) */}
            <div className="modal-slot-tabs-wrap" style={{ marginTop: 16 }}>
              <label className="modal-section-label">Hoặc chọn chi tiết từng ô nếu muốn:</label>
              <div className="modal-slot-tabs">
                {activeModalData.slots.map((s, idx) => {
                  const sKey = `q${activeModalData.id}_s${s.slotIndex}`;
                  const sLvl = srsMap[sKey]?.masteryLevel || 0;
                  const isSelected = selectedSlotIndex === idx;

                  return (
                    <button
                      key={s.slotIndex}
                      type="button"
                      className={`modal-slot-tab-btn ${isSelected ? 'active' : ''} ${getMasteryGlowClass(sLvl)}`}
                      onClick={() => setSelectedSlotIndex(idx)}
                    >
                      <span className="tab-symbol">{s.label}</span>
                      <span className="tab-title-short">
                        {s.title ? (s.title.length > 18 ? `${s.title.slice(0, 18)}...` : s.title) : `Ô ${s.slotIndex}`}
                      </span>
                      <span className="tab-lvl-badge">Lv.{sLvl}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chi tiết ô đang chọn */}
            {activeSlot && (
              <div className="active-slot-card">
                <div className="active-slot-info-header">
                  <span className="active-slot-pill">
                    Ô {activeSlot.label} ({activeSlot.title || `Ô số ${activeSlot.slotIndex}`})
                  </span>
                  <div className="active-slot-level-indicator">
                    <span className="level-stars">
                      {'★'.repeat(activeSlotLevel)}{'☆'.repeat(5 - activeSlotLevel)}
                    </span>
                    <span className="level-text-label">
                      {getMasteryLabel(activeSlotLevel)}
                    </span>
                  </div>
                </div>

                <div className="active-slot-progress-memo">
                  <span>Tiến độ 6 bậc học: </span>
                  <strong>
                    {activeSlotStep > 0
                      ? `Đã vượt Bậc ${activeSlotStep}/6 (${LEARNING_STEPS[activeSlotStep - 1]?.name})`
                      : 'Chưa bắt đầu bậc nào'}
                  </strong>
                </div>
              </div>
            )}

            {/* Khối chọn chế độ: Học theo bậc hoặc Thi */}
            <div className="modal-actions-container">
              {/* Lựa chọn 1: Học theo 6 bậc */}
              <div className="action-mode-group">
                <div className="mode-group-header">
                  <span className="mode-icon">📚</span>
                  <div>
                    <h4 className="mode-heading">Học theo bậc (1 - 6)</h4>
                    <p className="mode-sub">Từ chép lại, điền từ cho đến tự gõ hoàn toàn</p>
                  </div>
                </div>

                {/* Grid 6 bậc */}
                <div className="learning-steps-grid">
                  {LEARNING_STEPS.map((step) => {
                    const isPassed = activeSlotStep >= step.id;
                    const isRecommended = nextRecommendedStep === step.id;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        className={`btn-step-item ${isPassed ? 'step-passed' : ''} ${isRecommended ? 'step-recommended' : ''}`}
                        onClick={() => triggerAction('learn', step.id)}
                        title={step.desc}
                      >
                        <span className="step-number">{step.id}</span>
                        <div className="step-info">
                          <span className="step-name">{step.name}</span>
                          <span className="step-desc-short">{step.desc}</span>
                        </div>
                        {isPassed && <span className="step-check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Nút hành động nhanh bậc đề xuất */}
                <button
                  type="button"
                  className="btn-primary-action btn-learn-now"
                  onClick={() => triggerAction('learn', nextRecommendedStep)}
                >
                  Bắt đầu học Bậc {nextRecommendedStep}: {LEARNING_STEPS[nextRecommendedStep - 1]?.name}
                </button>
              </div>

              {/* Lựa chọn 2: Thi (Đo độ thuộc SRS) */}
              <div className="action-mode-group exam-mode-group">
                <div className="mode-group-header">
                  <span className="mode-icon">⚔️</span>
                  <div>
                    <h4 className="mode-heading">Chế độ Thi & Đo độ thuộc</h4>
                    <p className="mode-sub">Gõ tự nhớ hoàn toàn không gợi ý để tăng cấp SRS</p>
                  </div>
                </div>

                <div className="exam-buttons-row">
                  <button
                    type="button"
                    className="btn-exam-action btn-exam-slot"
                    onClick={() => triggerAction('exam')}
                  >
                    Thi ô {activeSlot?.label} này
                  </button>
                  <button
                    type="button"
                    className="btn-exam-action btn-exam-full-q"
                    onClick={() => {
                      if (onSelectAction) {
                        onSelectAction({
                          mode: 'exam',
                          question: activeModalData,
                          slot: null,
                          isFullQuestion: true
                        });
                      } else {
                        alert(`Bắt đầu thi toàn bộ Câu ${activeModalData.id} (${activeModalData.slots.length} ô)`);
                      }
                      handleCloseModal();
                    }}
                  >
                    Thi cả Câu {activeModalData.id}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-close-modal"
                onClick={handleCloseModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
