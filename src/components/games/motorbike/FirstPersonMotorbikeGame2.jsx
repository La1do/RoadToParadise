import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import HondaWaveHandlebar from './HondaWaveHandlebar.jsx';
import ParallaxRoadScene from './ParallaxRoadScene.jsx';
import { useMotorbikeAudio } from './useMotorbikeAudio.js';
import { compareAnswer } from '../../../core/gradeEngine.js';
import AnswerDiff from '../../common/AnswerDiff.jsx';
import './FirstPersonMotorbikeGame2.css';

/**
 * FirstPersonMotorbikeGame2 - Game 2 "Xáo từ" góc nhìn thứ nhất chạy xe máy Honda Wave
 *
 * @param {object} props
 * @param {string} [props.tenNhanVat='Minh'] - Tên nhân vật (Minh, sinh viên 21 tuổi)
 * @param {number|string} [props.soCau=1] - Số thứ tự câu hỏi
 * @param {string} [props.questionText] - Tiêu đề / câu hỏi lớn
 * @param {string} [props.dapAnChuan] - Đáp án chuẩn (tiếng Việt có dấu)
 * @param {string[]} [props.cumTu] - Danh sách các cụm từ xáo trộn
 * @param {string[]} [props.theNhieu] - Các thẻ từ gây nhiễu cho mức Khó
 * @param {string} [props.mucDo='de'] - 'de' (cụm) | 'vua' (từng từ) | 'kho' (từ + thẻ nhiễu)
 * @param {number} [props.chang=1] - Chặng cốt truyện (1: sáng sớm, 2: trưa, 3: hoàng hôn, 4: đêm)
 * @param {function} [props.onComplete] - Callback hoàn thành
 * @param {function} [props.onNext] - Callback chuyển tiếp
 */
export default function FirstPersonMotorbikeGame2({
  tenNhanVat = 'Minh',
  soCau = 1,
  questionText = 'Câu hỏi ôn tập buổi sáng',
  dapAnChuan = '',
  cumTu = [],
  theNhieu = [],
  mucDo = 'de',
  chang = 1,
  onComplete,
  onNext
}) {
  // State machine: 'introLenXe' -> 'chay' -> 'nghi' -> 'sapThe' -> 'nhap' -> 'xong'
  const [gameState, setGameState] = useState('introLenXe');

  // Mức độ khó ('de' | 'vua' | 'kho'), tự động tăng khi đúng liên tiếp
  const [currentLevel, setCurrentLevel] = useState(mucDo);
  const [streakCount, setStreakCount] = useState(0);

  // Âm thanh xe máy Web Audio API
  const audio = useMotorbikeAudio();

  // Intro steps: 1 (nhìn xe), 2 (đội mũ), 3 (đề nổ ga), 4 (lăn bánh)
  const [introStep, setIntroStep] = useState(1);
  const [helmetProgress, setHelmetProgress] = useState(0);
  const [handsOnBars, setHandsOnBars] = useState(false);
  const [isRevving, setIsRevving] = useState(false);

  // Tốc độ xe hiển thị trên đồng hồ (km/h)
  const [speed, setSpeed] = useState(0);

  // Giảm chuyển động (prefers-reduced-motion hoặc người dùng chọn)
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Ghi nhớ xem mẫu đáp án (nhấn Esc hoặc nút xem lại)
  const [showSamplePeek, setShowSamplePeek] = useState(false);

  // --- Dữ liệu thẻ từ Game ---
  // Khay ghép trên và rổ thẻ xáo bên dưới
  const [trayItems, setTrayItems] = useState([]);
  const [poolItems, setPoolItems] = useState([]);
  const [wrongShakeId, setWrongShakeId] = useState(null);
  const [failAttempts, setFailAttempts] = useState(0);
  const [hintItemId, setHintItemId] = useState(null);

  // --- Bước gõ củng cố ---
  const [reinforceInput, setReinforceInput] = useState('');
  const [gradeResult, setGradeResult] = useState(null);
  const inputRef = useRef(null);

  // --- Kéo thả Pointer Events (chuột, cảm ứng, bút cảm ứng) ---
  const [draggingItem, setDraggingItem] = useState(null);
  const dragPointerRef = useRef(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

  // Visual Viewport cho bàn phím ảo trên điện thoại
  const [viewportOffset, setViewportOffset] = useState(0);

  // Chuẩn bị danh sách thẻ dựa theo mức độ (Dễ: cụm, Vừa: từ, Khó: từ + nhiễu)
  const preparedCards = useMemo(() => {
    let rawList = [];
    if (currentLevel === 'de') {
      rawList = cumTu && cumTu.length > 0
        ? cumTu
        : (dapAnChuan ? dapAnChuan.split(/[,.;]/).map(s => s.trim()).filter(Boolean) : []);
    } else {
      // Vừa & Khó: xáo theo từng từ
      rawList = dapAnChuan ? dapAnChuan.trim().split(/\s+/) : [];
    }

    if (rawList.length === 0 && dapAnChuan) {
      rawList = dapAnChuan.trim().split(/\s+/);
    }

    // Gắn ID chuẩn thứ tự
    const baseItems = rawList.map((text, idx) => ({
      id: `card-${idx}`,
      orderIndex: idx,
      text: text.trim(),
      isDistractor: false
    }));

    // Nếu mức Khó: thêm 1-2 thẻ nhiễu
    let combined = [...baseItems];
    if (currentLevel === 'kho' && theNhieu && theNhieu.length > 0) {
      const distractors = theNhieu.slice(0, 2).map((text, idx) => ({
        id: `distractor-${idx}`,
        orderIndex: -1,
        text: text.trim(),
        isDistractor: true
      }));
      combined = [...combined, ...distractors];
    }

    // Xáo trộn ngẫu nhiên (Fisher-Yates)
    const shuffled = [...combined];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return {
      correctList: baseItems,
      shuffledList: shuffled,
      targetSentence: dapAnChuan
    };
  }, [dapAnChuan, cumTu, theNhieu, currentLevel]);

  // Khởi tạo thẻ vào pool
  useEffect(() => {
    setTrayItems([]);
    setPoolItems(preparedCards.shuffledList);
    setFailAttempts(0);
    setHintItemId(null);
    setGradeResult(null);
    setReinforceInput('');
  }, [preparedCards]);

  // Visual Viewport API: Đẩy giao diện lên khi mở bàn phím ảo điện thoại
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handleResize = () => {
      const vv = window.visualViewport;
      const offset = window.innerHeight - vv.height;
      setViewportOffset(offset > 120 ? offset : 0);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  // --- TIẾN TRÌNH INTRO 4-5 GIÂY ---
  useEffect(() => {
    if (gameState !== 'introLenXe') return;

    // Bước 1: 0.6s nhìn xe
    const t1 = setTimeout(() => {
      setIntroStep(2);
      setHelmetProgress(1); // Hạ mũ bảo hiểm
      setHandsOnBars(true); // Đặt tay lên tay lái
    }, 1100);

    // Bước 2: 1.8s đề máy & vặn ga
    const t2 = setTimeout(() => {
      setIntroStep(3);
      setIsRevving(true);
      audio.playIgnition();
    }, 2300);

    // Bước 3: 3.2s xe lăn bánh, tăng tốc
    const t3 = setTimeout(() => {
      setIntroStep(4);
      setIsRevving(false);
      audio.startEngine('cruise');
      setSpeed(45);
    }, 3600);

    // Bước 4: 4.8s chuyển vào vòng lặp chạy xe
    const t4 = setTimeout(() => {
      setGameState('chay');
    }, 4900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [gameState, audio]);

  // Khi đang ở trạng thái 'chay' -> sau 1.4s hiện bong bóng suy nghĩ ('nghi')
  useEffect(() => {
    if (gameState === 'chay') {
      const t = setTimeout(() => {
        setGameState('nghi');
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  // Khi ở trạng thái 'nghi' -> sau 1.8s hiện các thẻ từ bay vào ('sapThe')
  useEffect(() => {
    if (gameState === 'nghi') {
      const t = setTimeout(() => {
        setGameState('sapThe');
        audio.setEngineSpeed('focus'); // Giảm tốc độ còn 30-40%
        setSpeed(25);
      }, 1900);
      return () => clearTimeout(t);
    }
  }, [gameState, audio]);

  // Phím tắt bàn phím: 'H' bóp còi, 'Enter' kiểm tra, 'Esc' xem mẫu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          audio.playHorn();
        }
      } else if (e.key === 'Escape') {
        setShowSamplePeek(prev => !prev);
      } else if (e.key === 'Enter' && gameState === 'nhap' && !e.shiftKey) {
        e.preventDefault();
        handleCheckReinforce();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Tự động focus ô nhập liệu khi chuyển sang bước 'nhap'
  useEffect(() => {
    if (gameState === 'nhap') {
      audio.setDucking(true);
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      audio.setDucking(false);
    }
  }, [gameState, audio]);

  // Bỏ qua Intro ngay lập tức
  const handleSkipIntro = () => {
    setHelmetProgress(1);
    setHandsOnBars(true);
    setIsRevving(false);
    audio.startEngine('cruise');
    setSpeed(45);
    setGameState('sapThe');
    audio.setEngineSpeed('focus');
    setSpeed(25);
  };

  // --- POINTER EVENTS CHO KÉO THẢ (Hỗ trợ Touch, Chuột & Stylus) ---
  const handlePointerDownCard = (e, item, source) => {
    // Chỉ kích hoạt khi đang ở phase sapThe
    if (gameState !== 'sapThe') return;
    dragPointerRef.current = {
      item,
      source,
      startX: e.clientX,
      startY: e.clientY
    };
    setDraggingItem(item);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!dragPointerRef.current) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!dragPointerRef.current) return;
    const { item, source, startX, startY } = dragPointerRef.current;
    dragPointerRef.current = null;
    setDraggingItem(null);

    // Tính khoảng cách di chuyển: nếu < 8px thì coi là click/tap
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist < 8) {
      if (source === 'pool') {
        handleCardClickToTray(item);
      } else {
        handleCardClickToPool(item);
      }
      return;
    }

    // Nếu là kéo thả: xác định vị trí thả qua elementFromPoint
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    const trayEl = targetEl ? targetEl.closest('.motorbike-tray-container') : null;
    const poolEl = targetEl ? targetEl.closest('.motorbike-pool-container') : null;

    if (source === 'pool' && trayEl) {
      handleCardClickToTray(item);
    } else if (source === 'tray' && poolEl) {
      handleCardClickToPool(item);
    }
  };

  // Click thẻ ở rổ -> chuyển lên khay
  const handleCardClickToTray = (item) => {
    setPoolItems(prev => prev.filter(c => c.id !== item.id));
    setTrayItems(prev => [...prev, item]);
  };

  // Click thẻ trên khay -> trả về rổ
  const handleCardClickToPool = (item) => {
    setTrayItems(prev => prev.filter(c => c.id !== item.id));
    setPoolItems(prev => [...prev, item]);
  };

  // Đặt lại toàn bộ thẻ
  const handleResetTiles = () => {
    setTrayItems([]);
    setPoolItems(preparedCards.shuffledList);
    setWrongShakeId(null);
  };

  // Xác nhận thứ tự các thẻ trên khay
  const handleVerifyTileOrder = () => {
    const isCountMatch = trayItems.length === preparedCards.correctList.length;
    let isCorrect = isCountMatch;

    if (isCountMatch) {
      for (let i = 0; i < trayItems.length; i++) {
        if (trayItems[i].orderIndex !== i) {
          isCorrect = false;
          break;
        }
      }
    }

    if (isCorrect) {
      // Sắp đúng: các thẻ sáng lên, ghép thành câu rồi chuyển sang 'nhap'
      setFailAttempts(0);
      setHintItemId(null);
      setGameState('nhap');
    } else {
      // Sai: thẻ sai vị trí rung nhẹ, không báo đáp án
      const firstWrong = trayItems.find((item, idx) => item.orderIndex !== idx);
      if (firstWrong) {
        setWrongShakeId(firstWrong.id);
        setTimeout(() => setWrongShakeId(null), 600);
      }

      setFailAttempts(prev => {
        const next = prev + 1;
        // Sau 2 lần sai: gợi ý 1 thẻ
        if (next >= 2) {
          const neededIndex = trayItems.length;
          const needed = preparedCards.correctList[neededIndex];
          if (needed) setHintItemId(needed.id);
        }
        return next;
      });
    }
  };

  // Chấm điểm phần gõ củng cố
  const handleCheckReinforce = () => {
    if (!reinforceInput.trim()) return;
    const result = compareAnswer(reinforceInput, dapAnChuan);
    setGradeResult(result);

    if (result.isExact) {
      // Đúng tuyệt đối -> Xong câu
      setGameState('xong');
      audio.setEngineSpeed('cruise');
      setSpeed(45);

      // Tăng streak và lưu vào localStorage
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      try {
        localStorage.setItem(`motorbike_slot_streak_${soCau}`, String(nextStreak));
        localStorage.setItem(`motorbike_slot_last_${soCau}`, new Date().toISOString());
      } catch {
        // bỏ qua
      }

      // Tự động tăng mức độ khi đúng liên tiếp (streak >= 3)
      if (nextStreak >= 3 && currentLevel === 'de') {
        setCurrentLevel('vua');
      } else if (nextStreak >= 5 && currentLevel === 'vua') {
        setCurrentLevel('kho');
      }

      if (typeof onComplete === 'function') {
        onComplete({
          isPassed: true,
          soCau,
          accuracy: 100,
          userInput: reinforceInput
        });
      }
    }
  };

  return (
    <div
      className={`first-person-motorbike-game state-${gameState} level-${currentLevel}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        '--keyboard-offset': `${viewportOffset}px`,
      }}
    >
      {/* 1. KHUNG CẢNH XE MÁY CON ĐƯỜNG PARALLAX */}
      <ParallaxRoadScene
        chang={chang}
        isFocusMode={gameState === 'sapThe' || gameState === 'nhap'}
        isReducedMotion={isReducedMotion}
      >
        {/* Nút điều khiển âm thanh và chuyển động trên cùng */}
        <div className="motorbike-top-controls">
          <button
            type="button"
            className="ctrl-btn mute-btn"
            onClick={audio.toggleMute}
            title={audio.isMuted ? 'Bật âm thanh xe máy' : 'Tắt âm thanh'}
          >
            {audio.isMuted ? '🔇 Tắt tiếng' : '🔊 Tiếng máy'}
          </button>

          <button
            type="button"
            className="ctrl-btn horn-btn"
            onClick={audio.playHorn}
            title="Bấm còi xe máy (Phím H)"
          >
            🎺 Còi (H)
          </button>

          <button
            type="button"
            className={`ctrl-btn motion-btn ${isReducedMotion ? 'active' : ''}`}
            onClick={() => setIsReducedMotion(prev => !prev)}
            title="Bật/Tắt giảm chuyển động"
          >
            🌀 {isReducedMotion ? 'Êm dịu' : 'Chuyển động'}
          </button>

          {gameState === 'introLenXe' && (
            <button
              type="button"
              className="ctrl-btn skip-intro-btn"
              onClick={handleSkipIntro}
            >
              ⏭ Bỏ qua Intro
            </button>
          )}
        </div>

        {/* Bong bóng suy nghĩ mờ của Minh ở đầu câu */}
        {gameState === 'nghi' && (
          <div className="minh-thought-bubble">
            <span className="bubble-dots">💭</span>
            <p className="bubble-text">"Câu hôm nay là gì nhỉ..."</p>
          </div>
        )}

        {/* Tay lái xe máy Honda Wave ở nửa dưới màn hình */}
        <HondaWaveHandlebar
          speed={speed}
          fuel={0.8}
          gear={gameState === 'introLenXe' && introStep < 3 ? 0 : 4}
          isVibrating={!isReducedMotion && gameState !== 'introLenXe'}
          isRevving={isRevving}
          helmetProgress={helmetProgress}
          handsOnBars={handsOnBars}
          showMirrors={true}
        />
      </ParallaxRoadScene>

      {/* 2. KHU VỰC GAMEPLAY NẰM ĐÈ TRÊN SÂN KHẤU (RESPONSIVE BOTTOM SHEET / SIDE PANEL) */}
      <div className="motorbike-gameplay-panel">
        {/* Tiêu đề câu hỏi */}
        <div className="motorbike-question-header">
          <span className="q-badge">CÂU {soCau} • MỨC {currentLevel.toUpperCase()}</span>
          <h3 className="q-title">{questionText}</h3>
          {showSamplePeek && (
            <div className="q-sample-peek">
              <span className="peek-label">Mẫu đáp án:</span> {dapAnChuan}
            </div>
          )}
        </div>

        {/* GIAI ĐOẠN: SẮP XẾP THẺ (sapThe) */}
        {gameState === 'sapThe' && (
          <div className="motorbike-tiles-stage">
            {/* Khay ghép các thẻ */}
            <div className="motorbike-tray-container">
              <div className="tray-label-row">
                <span className="tray-title">Khay ghép câu của Minh:</span>
                <span className="tray-hint">Kéo thả hoặc chạm thẻ để đưa vào</span>
              </div>

              <div className="motorbike-tray-slots">
                {trayItems.length === 0 ? (
                  <div className="tray-placeholder">Kéo hoặc bấm các mảnh chữ bên dưới vào đây...</div>
                ) : (
                  trayItems.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`motorbike-tile in-tray ${wrongShakeId === item.id ? 'shake-wrong' : ''}`}
                      onPointerDown={(e) => handlePointerDownCard(e, item, 'tray')}
                    >
                      <span className="tile-num">{idx + 1}</span>
                      <span className="tile-text">{item.text}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Rổ các thẻ xáo trộn bay lơ lửng */}
            <div className="motorbike-pool-container">
              <div className="pool-label">Mảnh chữ trong tâm trí:</div>
              <div className="motorbike-pool-tiles">
                {poolItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`motorbike-tile in-pool ${hintItemId === item.id ? 'is-hinted' : ''}`}
                    onPointerDown={(e) => handlePointerDownCard(e, item, 'pool')}
                  >
                    <span className="tile-text">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="motorbike-actions-bar">
              <button
                type="button"
                className="action-btn verify-btn"
                onClick={handleVerifyTileOrder}
                disabled={trayItems.length < preparedCards.correctList.length}
              >
                ✓ Ghép thành câu
              </button>

              <button
                type="button"
                className="action-btn reset-btn"
                onClick={handleResetTiles}
                disabled={trayItems.length === 0}
              >
                Đặt lại
              </button>
            </div>
          </div>
        )}

        {/* GIAI ĐOẠN: GÕ CỦNG CỐ TRÍ NHỚ (nhap) */}
        {gameState === 'nhap' && (
          <div className="motorbike-reinforce-stage">
            <div className="reinforce-banner">
              <span className="banner-icon">✨</span>
              <p className="banner-msg">
                Tuyệt vời! Minh đã nhớ thứ tự. Giờ hãy gõ nhẩm lại cả câu mà không nhìn:
              </p>
            </div>

            <textarea
              ref={inputRef}
              className="motorbike-reinforce-textarea"
              value={reinforceInput}
              onChange={(e) => setReinforceInput(e.target.value)}
              placeholder="Gõ nhẩm lại toàn bộ câu vào đây..."
              rows={3}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              autoComplete="off"
            />

            <div className="reinforce-tools">
              <button
                type="button"
                className="action-btn check-type-btn"
                onClick={handleCheckReinforce}
              >
                Kiểm tra câu gõ (Enter)
              </button>

              <button
                type="button"
                className="action-btn peek-btn"
                onClick={() => setShowSamplePeek(prev => !prev)}
              >
                {showSamplePeek ? 'Ẩn đáp án' : 'Xem lại mẫu (Esc)'}
              </button>
            </div>

            {/* Phân tích kết quả gõ */}
            {gradeResult && !gradeResult.isExact && (
              <div className="grade-diff-card">
                <div className="diff-title">Sửa bài: gạch ngang từ sai / dư, (+ cụm từ) là phần còn thiếu.</div>
                <AnswerDiff
                  diff={gradeResult.diff}
                  userTokensResult={gradeResult.userTokensResult}
                  variant="motorbike"
                />
              </div>
            )}
          </div>
        )}

        {/* GIAI ĐOẠN: HOÀN THÀNH (xong) */}
        {gameState === 'xong' && (
          <div className="motorbike-completed-stage">
            <div className="completed-card">
              <span className="party-icon">🎉</span>
              <h4>Minh đã thuộc làu câu này trên đường tới trường!</h4>
              <p>Đúng tuyệt đối 100% từng dấu tiếng Việt.</p>
              {typeof onNext === 'function' && (
                <button
                  type="button"
                  className="action-btn next-q-btn"
                  onClick={onNext}
                >
                  Tiếp tục câu sau →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thẻ đang được kéo (Floating drag avatar) */}
      {draggingItem && (
        <div
          className="motorbike-floating-drag-card"
          style={{
            transform: `translate3d(${dragPos.x}px, ${dragPos.y}px, 0)`,
          }}
        >
          {draggingItem.text}
        </div>
      )}
    </div>
  );
}
