import React, { useState, useEffect, useRef } from 'react';
import questionsData from '../../data/questions.json';
import { compareAnswer } from '../../core/gradeEngine.js';
import { loadMistakeBook, addExamRecord } from '../../core/storageEngine.js';
import Game1Copy from '../games/Game1Copy.jsx';
import Game2Scramble from '../games/Game2Scramble.jsx';
import StickerReaction from '../common/StickerReaction.jsx';
import './CustomExamReview.css';

/**
 * CustomExamReview - Chế độ Ôn tập & Thi riêng tự chọn
 *
 * Hỗ trợ 3 chế độ:
 * 1. ✍️ Ôn tập Chép lại (Copy): Gõ từng ý theo mẫu, có nút ẩn/hiện đáp án tham khảo để tự nhớ.
 * 2. 🧩 Ôn tập Xáo từ (Scramble): Kéo thả/chạm ghép cụm từ lưới 2x2.
 * 3. 📝 Chế độ Thi riêng (Real Exam): Thi tính điểm, có đồng hồ đếm giờ, lưu lịch sử.
 *
 * Tính năng nổi bật:
 * - Chế độ ẩn / hiện đáp án tham khảo linh hoạt (nút toggle 👁️ / 🙈).
 * - Lưu bài làm khi nhảy qua lại giữa các câu hỏi, không bị mất dữ liệu.
 * - Tự do chọn phạm vi câu hỏi: Toàn bộ 20 câu, theo chặng, ngẫu nhiên hoặc tick chọn thủ công.
 */
export default function CustomExamReview({ onBackToMap }) {
  const allQuestions = questionsData.questions;

  // View state: 'setup' | 'session' | 'result'
  const [viewState, setViewState] = useState('setup');

  // Cấu hình đợt ôn thi:
  const [mode, setMode] = useState('copy'); // 'copy' | 'scramble' | 'exam'
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([1, 2, 3, 4, 5]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0); // 0 = Không giới hạn
  const [showReferenceAnswer, setShowReferenceAnswer] = useState(true); // Ẩn / hiện đáp án tham khảo
  const [mobilePopup, setMobilePopup] = useState(null); // null | 'mode' | 'questions'

  // Session state:
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lưu câu trả lời theo từng chế độ để chuyển câu không mất bài:
  // Copy answers: { [questionId]: { [slotIndex]: text } }
  const [copyAnswers, setCopyAnswers] = useState({});
  // Exam inputs: { [questionId]: { [slotIndex]: text } }
  const [examAnswers, setExamAnswers] = useState({});
  // Scramble states: { [questionId]: { slotStates, summary } }
  const [scrambleProgress, setScrambleProgress] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Result state:
  const [examResultData, setExamResultData] = useState(null);

  // Timer ref
  const timerRef = useRef(null);

  // Đếm giờ trong phiên làm bài
  useEffect(() => {
    if (viewState === 'session') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  // Format giây thành mm:ss
  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chọn nhanh theo preset
  const handleSelectPreset = (presetType) => {
    switch (presetType) {
      case 'all':
        setSelectedQuestionIds(allQuestions.map(q => q.id));
        break;
      case 'stage1':
        setSelectedQuestionIds([1, 2, 3, 4, 5]);
        break;
      case 'stage2':
        setSelectedQuestionIds([6, 7, 8, 9, 10]);
        break;
      case 'stage3':
        setSelectedQuestionIds([11, 12, 13, 14, 15]);
        break;
      case 'stage4':
        setSelectedQuestionIds([16, 17, 18, 19, 20]);
        break;
      case 'random5': {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        setSelectedQuestionIds(shuffled.slice(0, 5).map(q => q.id).sort((a, b) => a - b));
        break;
      }
      case 'random10': {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        setSelectedQuestionIds(shuffled.slice(0, 10).map(q => q.id).sort((a, b) => a - b));
        break;
      }
      case 'mistakeBook': {
        const book = loadMistakeBook();
        const failedKeys = Object.keys(book?.slots || {});
        const qIdSet = new Set();
        failedKeys.forEach(k => {
          const match = k.match(/^q(\d+)/);
          if (match) qIdSet.add(Number(match[1]));
        });
        const ids = Array.from(qIdSet).sort((a, b) => a - b);
        setSelectedQuestionIds(ids.length > 0 ? ids : [1, 2, 3]);
        break;
      }
      case 'clear':
        setSelectedQuestionIds([]);
        break;
      default:
        break;
    }
  };

  // Toggle chọn một câu cụ thể
  const handleToggleQuestionId = (id) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id].sort((a, b) => a - b);
      }
    });
  };

  // Bắt đầu phiên làm bài
  const handleStartSession = () => {
    if (selectedQuestionIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 câu hỏi để bắt đầu.');
      return;
    }

    let qList = allQuestions.filter(q => selectedQuestionIds.includes(q.id));
    if (isShuffle) {
      qList = [...qList].sort(() => 0.5 - Math.random());
    }

    setSessionQuestions(qList);
    setCurrentIndex(0);
    setCopyAnswers({});
    setExamAnswers({});
    setScrambleProgress({});
    setElapsedSeconds(0);
    setViewState('session');
  };

  // Lưu câu trả lời chế độ Chép lại
  const handleCopyStateChange = (qId, inputs) => {
    setCopyAnswers(prev => ({
      ...prev,
      [qId]: inputs
    }));
  };

  // Cập nhật câu trả lời chế độ Thi
  const handleExamInputChange = (qId, slotIndex, value) => {
    setExamAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        [slotIndex]: value
      }
    }));
  };

  // Cập nhật trạng thái chế độ Xáo từ
  const handleScrambleStateChange = (qId, state) => {
    setScrambleProgress(prev => ({
      ...prev,
      [qId]: state
    }));
  };

  // Nộp bài và tổng kết cho chế độ Chép lại
  const handleSubmitCopy = () => {
    const results = [];
    let totalScore = 0;
    let perfectQuestionsCount = 0;

    sessionQuestions.forEach(q => {
      const qAnswers = copyAnswers[q.id] || {};
      const slotResults = [];
      let qCorrectSlots = 0;

      q.slots.forEach(s => {
        const userText = qAnswers[s.slotIndex] || '';
        const grade = compareAnswer(userText, s.answer);
        slotResults.push({
          slot: s,
          userInput: userText,
          grade
        });
        if (grade.isExact) qCorrectSlots++;
      });

      const isQuestionPerfect = qCorrectSlots === q.slots.length;
      if (isQuestionPerfect) perfectQuestionsCount++;

      const questionAccuracy = Math.round(
        slotResults.reduce((acc, curr) => acc + curr.grade.accuracy, 0) / q.slots.length
      );
      totalScore += questionAccuracy;

      results.push({
        question: q,
        isPerfect: isQuestionPerfect,
        accuracy: questionAccuracy,
        slotResults
      });
    });

    const overallAccuracy = Math.round(totalScore / sessionQuestions.length);

    setExamResultData({
      mode: 'copy',
      totalQuestions: sessionQuestions.length,
      perfectQuestionsCount,
      overallAccuracy,
      elapsedSeconds,
      results,
      completedAt: new Date().toISOString()
    });
    setViewState('result');
  };

  // Hoàn thành đợt ôn xáo từ và tổng kết
  const handleSubmitScramble = () => {
    const results = [];
    let totalScore = 0;
    let perfectQuestionsCount = 0;

    sessionQuestions.forEach(q => {
      const qState = scrambleProgress[q.id];
      const slotResults = [];
      let qCorrectSlots = 0;

      q.slots.forEach(s => {
        const sState = qState?.slotStates?.[s.slotIndex];
        const isCorrect = sState?.result?.isCorrect || false;
        if (isCorrect) qCorrectSlots++;

        const userArrangedText = sState?.trayItems?.map(it => it.text).join(' ') || '';
        const targetAns = s?.answer || s?.targetAnswer || '';
        const gradeDiff = compareAnswer(userArrangedText, targetAns);
        slotResults.push({
          slot: s,
          userInput: userArrangedText,
          grade: {
            isExact: isCorrect,
            accuracy: isCorrect ? 100 : 0,
            userTokensResult: userArrangedText ? userArrangedText.split(' ').map(t => ({ text: t, status: isCorrect ? 'correct' : 'wrong' })) : [],
            targetTokensResult: targetAns ? targetAns.split(' ').map(t => ({ text: t, status: isCorrect ? 'correct' : 'missing' })) : [],
            diff: gradeDiff.diff
          }
        });
      });

      const isQuestionPerfect = qCorrectSlots === q.slots.length;
      if (isQuestionPerfect) perfectQuestionsCount++;

      const questionAccuracy = Math.round((qCorrectSlots / q.slots.length) * 100);
      totalScore += questionAccuracy;

      results.push({
        question: q,
        isPerfect: isQuestionPerfect,
        accuracy: questionAccuracy,
        slotResults
      });
    });

    const overallAccuracy = Math.round(totalScore / sessionQuestions.length);

    setExamResultData({
      mode: 'scramble',
      totalQuestions: sessionQuestions.length,
      perfectQuestionsCount,
      overallAccuracy,
      elapsedSeconds,
      results,
      completedAt: new Date().toISOString()
    });
    setViewState('result');
  };

  // Nộp bài thi và tính điểm
  const handleSubmitExam = () => {
    const results = [];
    let totalScore = 0;
    let perfectQuestionsCount = 0;

    sessionQuestions.forEach(q => {
      const qAnswers = examAnswers[q.id] || {};
      const slotResults = [];
      let qCorrectSlots = 0;

      q.slots.forEach(s => {
        const userText = qAnswers[s.slotIndex] || '';
        const grade = compareAnswer(userText, s.answer);
        slotResults.push({
          slot: s,
          userInput: userText,
          grade
        });
        if (grade.isExact) qCorrectSlots++;
      });

      const isQuestionPerfect = qCorrectSlots === q.slots.length;
      if (isQuestionPerfect) perfectQuestionsCount++;

      const questionAccuracy = Math.round(
        slotResults.reduce((acc, curr) => acc + curr.grade.accuracy, 0) / q.slots.length
      );
      totalScore += questionAccuracy;

      results.push({
        question: q,
        isPerfect: isQuestionPerfect,
        accuracy: questionAccuracy,
        slotResults
      });
    });

    const overallAccuracy = Math.round(totalScore / sessionQuestions.length);

    const summaryData = {
      mode: 'exam',
      totalQuestions: sessionQuestions.length,
      perfectQuestionsCount,
      overallAccuracy,
      elapsedSeconds,
      results,
      completedAt: new Date().toISOString()
    };

    // Lưu vào lịch sử bài thi
    addExamRecord(summaryData);

    setExamResultData(summaryData);
    setViewState('result');
  };

  // Thi lại các câu bị sai
  const handleRetryWrongQuestions = () => {
    if (!examResultData) return;
    const wrongIds = examResultData.results
      .filter(r => !r.isPerfect)
      .map(r => r.question.id);

    if (wrongIds.length === 0) {
      alert('Tất cả các câu đều đạt 100%! Không có câu nào bị sai.');
      return;
    }

    setSelectedQuestionIds(wrongIds);
    setMode('exam');
    setViewState('setup');
  };

  // Chuyển sang ôn xáo từ các câu này
  const handleSwitchToScrambleForThese = () => {
    if (!examResultData) return;
    const ids = examResultData.results.map(r => r.question.id);
    setSelectedQuestionIds(ids);
    setMode('scramble');
    setViewState('setup');
  };

  // Chuyển sang ôn chép lại các câu này
  const handleSwitchToCopyForThese = () => {
    if (!examResultData) return;
    const ids = examResultData.results.map(r => r.question.id);
    setSelectedQuestionIds(ids);
    setMode('copy');
    setViewState('setup');
  };

  // Câu hỏi hiện tại trong session
  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];

  return (
    <div className="custom-practice-container">
      {/* ================= 1. MÀN HÌNH THIẾT LẬP (SETUP) ================= */}
      {viewState === 'setup' && (
        <>
          {/* A. BỐ CỤC 2 CỘT CHO LAPTOP & IPAD (>= 820px) */}
          <div className="setup-grid-container">
            {/* Cột trái: Tiêu đề, Chế độ, Tùy chọn & Nút bắt đầu */}
            <div className="setup-col-left">
              <header className="setup-header-compact">
                <div className="setup-header-row">
                  <div>
                    <div className="header-badge">✦ KHÔNG GIAN HỌC TỰ CHỌN</div>
                    <h1 className="header-title-compact">🎯 Ôn Tập & Thi Riêng</h1>
                  </div>
                  <img
                    src="/stickers/cheer.png"
                    alt="Anh em thi thử nhé 0.0"
                    className="setup-static-sticker"
                    draggable="false"
                  />
                </div>
              </header>

              <div className="setup-section mode-section">
                <label className="section-label">1. Hình thức ({mode === 'copy' ? 'Chép lại' : mode === 'scramble' ? 'Xáo từ' : 'Thi riêng'}):</label>
                <div className="mode-toggle-grid three-modes">
                  <button type="button" className={`mode-toggle-btn ${mode === 'copy' ? 'active-copy' : ''}`} onClick={() => setMode('copy')}>
                    <span className="mode-icon">✍️</span>
                    <div><strong>Chép lại</strong><p>Gõ từng ý, hỗ trợ gợi ý</p></div>
                  </button>
                  <button type="button" className={`mode-toggle-btn ${mode === 'scramble' ? 'active-scramble' : ''}`} onClick={() => setMode('scramble')}>
                    <span className="mode-icon">🧩</span>
                    <div><strong>Xáo từ</strong><p>Kéo ghép lưới 2x2</p></div>
                  </button>
                  <button type="button" className={`mode-toggle-btn ${mode === 'exam' ? 'active-exam' : ''}`} onClick={() => setMode('exam')}>
                    <span className="mode-icon">📝</span>
                    <div><strong>Thi riêng</strong><p>Tự nhớ & chấm điểm</p></div>
                  </button>
                </div>
              </div>

              <div className="setup-section options-section">
                <label className="section-label">3. Tùy chọn:</label>
                <div className="options-stacked">
                  <label className="checkbox-option">
                    <input type="checkbox" checked={isShuffle} onChange={e => setIsShuffle(e.target.checked)} />
                    <span>🔀 Xáo trộn thứ tự các câu hỏi</span>
                  </label>
                  {mode === 'copy' && (
                    <label className="checkbox-option">
                      <input type="checkbox" checked={showReferenceAnswer} onChange={e => setShowReferenceAnswer(e.target.checked)} />
                      <span>👁️ Mở sẵn đáp án tham khảo</span>
                    </label>
                  )}
                  {mode === 'exam' && (
                    <div className="timer-select-wrap">
                      <span>⏱️ Thời gian:</span>
                      <select value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))} className="time-select">
                        <option value={0}>Tự do</option>
                        <option value={5}>5 phút</option>
                        <option value={10}>10 phút</option>
                        <option value={15}>15 phút</option>
                        <option value={20}>20 phút</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="setup-start-wrap">
                  <button type="button" className="start-session-btn" onClick={handleStartSession} disabled={selectedQuestionIds.length === 0}>
                    {mode === 'copy'
                      ? `🚀 Bắt đầu Chép lại (${selectedQuestionIds.length} câu) →`
                      : mode === 'scramble'
                      ? `🚀 Bắt đầu Xáo từ (${selectedQuestionIds.length} câu) →`
                      : `🏁 Bắt đầu Bài thi (${selectedQuestionIds.length} câu) →`}
                  </button>
                </div>
              </div>
            </div>

            {/* Cột phải: Presets và danh sách câu hỏi */}
            <div className="setup-col-right">
              <div className="setup-section questions-section">
                <div className="section-header-flex">
                  <label className="section-label">2. Phạm vi câu hỏi ({selectedQuestionIds.length}/20 câu đã chọn):</label>
                  <div className="preset-quick-actions">
                    <button type="button" className="quick-btn" onClick={() => handleSelectPreset('all')}>Tất cả</button>
                    <button type="button" className="quick-btn" onClick={() => handleSelectPreset('clear')}>Bỏ chọn</button>
                  </div>
                </div>

                <div className="presets-pill-row">
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage1')}>Chặng 1 (1-5)</button>
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage2')}>Chặng 2 (6-10)</button>
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage3')}>Chặng 3 (11-15)</button>
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage4')}>Chặng 4 (16-20)</button>
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random5')}>Ngẫu nhiên 5</button>
                  <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random10')}>Ngẫu nhiên 10</button>
                  <button type="button" className="preset-pill highlight" onClick={() => handleSelectPreset('mistakeBook')}>📖 Sổ Tiếc Nuối</button>
                </div>

                <div className="questions-select-grid">
                  {allQuestions.map(q => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    const hintText = q.slots[0]?.title || q.question;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        className={`q-select-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleToggleQuestionId(q.id)}
                        title={`Câu ${q.id}: ${hintText}`}
                      >
                        <div className="q-card-top">
                          <span className="q-id-badge">Câu {q.id}</span>
                          <span className="q-stage-tag">Chặng {q.stageId}</span>
                        </div>
                        <p className="q-hint-text">{hintText}</p>
                        <div className="q-slots-count">{q.slots.length} ý</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* B. BỐ CỤC SIÊU GỌN DẠNG POP-UP CHO MOBILE (< 820px) */}
          <div className="setup-mobile-view">
            <header className="setup-header-compact">
              <div className="setup-header-row">
                <div>
                  <div className="header-badge">✦ KHÔNG GIAN HỌC TỰ CHỌN</div>
                  <h1 className="header-title-compact">🎯 Ôn Tập & Thi Riêng</h1>
                </div>
                <img
                  src="/stickers/cheer.png"
                  alt="Anh em thi thử nhé 0.0"
                  className="setup-static-sticker"
                  draggable="false"
                />
              </div>
            </header>

            {/* Trigger 1: Chọn hình thức */}
            <div className="mobile-trigger-card" onClick={() => setMobilePopup('mode')}>
              <div className="trigger-left">
                <span className="trigger-icon">{mode === 'copy' ? '✍️' : mode === 'scramble' ? '🧩' : '📝'}</span>
                <div className="trigger-info">
                  <span className="trigger-label">1. Hình thức học:</span>
                  <strong className="trigger-val">
                    {mode === 'copy' ? '✍️ Chép lại (Copy)' : mode === 'scramble' ? '🧩 Xáo từ (Scramble)' : '📝 Thi riêng (Exam)'}
                  </strong>
                </div>
              </div>
              <span className="trigger-arrow-badge">Đổi ›</span>
            </div>

            {/* Trigger 2: Chọn câu hỏi */}
            <div className="mobile-trigger-card" onClick={() => setMobilePopup('questions')}>
              <div className="trigger-left">
                <span className="trigger-icon">📚</span>
                <div className="trigger-info">
                  <span className="trigger-label">2. Phạm vi câu hỏi:</span>
                  <strong className="trigger-val">
                    {selectedQuestionIds.length === 20 ? 'Tất cả 20 câu' : `Đã chọn: ${selectedQuestionIds.length}/20 câu`}
                  </strong>
                </div>
              </div>
              <span className="trigger-arrow-badge">Chọn ›</span>
            </div>

            {/* Tùy chọn */}
            <div className="setup-section options-section mobile-options-box">
              <label className="section-label">3. Tùy chọn nhanh:</label>
              <div className="options-stacked">
                <label className="checkbox-option">
                  <input type="checkbox" checked={isShuffle} onChange={e => setIsShuffle(e.target.checked)} />
                  <span>🔀 Xáo trộn thứ tự các câu</span>
                </label>
                {mode === 'copy' && (
                  <label className="checkbox-option">
                    <input type="checkbox" checked={showReferenceAnswer} onChange={e => setShowReferenceAnswer(e.target.checked)} />
                    <span>👁️ Mở sẵn đáp án tham khảo</span>
                  </label>
                )}
                {mode === 'exam' && (
                  <div className="timer-select-wrap">
                    <span>⏱️ Thời gian:</span>
                    <select value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))} className="time-select">
                      <option value={0}>Tự do</option>
                      <option value={5}>5 phút</option>
                      <option value={10}>10 phút</option>
                      <option value={15}>15 phút</option>
                      <option value={20}>20 phút</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Nút Bắt đầu */}
            <div className="setup-start-wrap">
              <button type="button" className="start-session-btn" onClick={handleStartSession} disabled={selectedQuestionIds.length === 0}>
                {mode === 'copy'
                  ? `🚀 Bắt đầu Chép lại (${selectedQuestionIds.length} câu) →`
                  : mode === 'scramble'
                  ? `🚀 Bắt đầu Xáo từ (${selectedQuestionIds.length} câu) →`
                  : `🏁 Bắt đầu Bài thi (${selectedQuestionIds.length} câu) →`}
              </button>
            </div>
          </div>

          {/* POPUP 1: CHỌN HÌNH THỨC (MOBILE) */}
          {mobilePopup === 'mode' && (
            <div className="mobile-modal-overlay" onClick={() => setMobilePopup(null)}>
              <div className="mobile-modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="mobile-modal-header">
                  <h3>Chọn Hình Thức Học</h3>
                  <button type="button" className="mobile-modal-close" onClick={() => setMobilePopup(null)}>✕</button>
                </div>
                <div className="mobile-modal-body">
                  <button
                    type="button"
                    className={`mobile-mode-opt ${mode === 'copy' ? 'selected' : ''}`}
                    onClick={() => { setMode('copy'); setMobilePopup(null); }}
                  >
                    <span className="opt-icon">✍️</span>
                    <div className="opt-desc">
                      <strong>Ôn tập Chép lại (Copy)</strong>
                      <p>Gõ lại từng ý với gợi ý từ và ẩn/hiện đáp án mẫu</p>
                    </div>
                    {mode === 'copy' && <span className="opt-check">✓</span>}
                  </button>

                  <button
                    type="button"
                    className={`mobile-mode-opt ${mode === 'scramble' ? 'selected' : ''}`}
                    onClick={() => { setMode('scramble'); setMobilePopup(null); }}
                  >
                    <span className="opt-icon">🧩</span>
                    <div className="opt-desc">
                      <strong>Ôn tập Xáo từ (Scramble)</strong>
                      <p>Luyện kéo ghép các cụm từ theo lưới 2x2 cố định</p>
                    </div>
                    {mode === 'scramble' && <span className="opt-check">✓</span>}
                  </button>

                  <button
                    type="button"
                    className={`mobile-mode-opt ${mode === 'exam' ? 'selected' : ''}`}
                    onClick={() => { setMode('exam'); setMobilePopup(null); }}
                  >
                    <span className="opt-icon">📝</span>
                    <div className="opt-desc">
                      <strong>Chế độ Thi riêng (Real Exam)</strong>
                      <p>Tự gõ từng ý, đếm giờ, chấm điểm nghiêm ngặt</p>
                    </div>
                    {mode === 'exam' && <span className="opt-check">✓</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POPUP 2: CHỌN PHẠM VI CÂU HỎI (MOBILE) */}
          {mobilePopup === 'questions' && (
            <div className="mobile-modal-overlay" onClick={() => setMobilePopup(null)}>
              <div className="mobile-modal-sheet sheet-large" onClick={e => e.stopPropagation()}>
                <div className="mobile-modal-header">
                  <div>
                    <h3>Chọn Phạm Vi Câu Hỏi</h3>
                    <span className="modal-sub">Đã chọn: {selectedQuestionIds.length}/20 câu</span>
                  </div>
                  <button type="button" className="mobile-modal-close" onClick={() => setMobilePopup(null)}>✕</button>
                </div>

                <div className="mobile-modal-body">
                  <div className="presets-pill-row compact-presets">
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('all')}>Tất cả</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('clear')}>Bỏ chọn</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage1')}>C1 (1-5)</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage2')}>C2 (6-10)</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage3')}>C3 (11-15)</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage4')}>C4 (16-20)</button>
                    <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random5')}>Ngẫu nhiên 5</button>
                    <button type="button" className="preset-pill highlight" onClick={() => handleSelectPreset('mistakeBook')}>📖 Sổ Tiếc Nuối</button>
                  </div>

                  {/* Lưới 20 ô số vuông lớn siêu dễ chạm (5 cột x 4 hàng) */}
                  <div className="mobile-num-grid">
                    {allQuestions.map(q => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      const hint = q.slots[0]?.title || q.question;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={`mobile-num-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleQuestionId(q.id)}
                          title={`Câu ${q.id}: ${hint}`}
                        >
                          <span className="chip-num">{q.id}</span>
                          <span className="chip-stage">Chặng {q.stageId}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mobile-modal-footer">
                  <button
                    type="button"
                    className="start-session-btn"
                    onClick={() => setMobilePopup(null)}
                  >
                    ✓ Hoàn tất ({selectedQuestionIds.length} câu)
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= 2. MÀN HÌNH PHIÊN LÀM BÀI (SESSION) ================= */}
      {viewState === 'session' && (
        <div className="session-view">
          {/* Thanh Header phiên làm bài */}
          <header className="session-header-bar">
            <div className="session-header-left">
              <button
                type="button"
                className="exit-btn"
                onClick={() => setViewState('setup')}
              >
                ✕ Thoát
              </button>
              <span className="session-mode-badge">
                {mode === 'copy' && '✍️ ÔN CHÉP LẠI'}
                {mode === 'scramble' && '🧩 ÔN XÁO TỪ'}
                {mode === 'exam' && '📝 BÀI THI RIÊNG'}
              </span>

              {/* Nút ẩn/hiện đáp án tham khảo: CHỈ HIỆN Ở CHẾ ĐỘ CHÉP LẠI (COPY) */}
              {mode === 'copy' && (
                <button
                  type="button"
                  className="toggle-ref-action-btn"
                  onClick={() => setShowReferenceAnswer(prev => !prev)}
                  title={showReferenceAnswer ? "Ẩn đáp án tham khảo để tự nhớ" : "Hiện đáp án tham khảo"}
                >
                  {showReferenceAnswer ? '🙈 Ẩn đáp án' : '👁️ Hiện đáp án'}
                </button>
              )}
            </div>

            <div className="session-header-center">
              <span className="question-counter">
                Câu {currentIndex + 1} / {sessionQuestions.length} (Câu gốc #{currentQ.id})
              </span>
              <div className="session-timer">⏱️ {formatTimer(elapsedSeconds)}</div>
            </div>

            <div className="session-header-right">
              {mode === 'exam' && (
                <button
                  type="button"
                  className="submit-exam-quick-btn"
                  onClick={handleSubmitExam}
                >
                  Nộp bài thi 🏁
                </button>
              )}
              {mode === 'scramble' && (
                <button
                  type="button"
                  className="submit-exam-quick-btn"
                  onClick={handleSubmitScramble}
                >
                  Hoàn thành đợt ôn 🏁
                </button>
              )}
              {mode === 'copy' && (
                <button
                  type="button"
                  className="submit-exam-quick-btn"
                  onClick={handleSubmitCopy}
                >
                  Tổng kết đợt ôn 🏁
                </button>
              )}
            </div>
          </header>

          {/* Thanh nhảy câu nhanh (Quick Question Navigator) */}
          <div className="question-nav-strip">
            {sessionQuestions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              let hasAnswered = false;
              if (mode === 'exam') {
                hasAnswered = examAnswers[q.id] && Object.values(examAnswers[q.id]).some(txt => txt && txt.trim());
              } else if (mode === 'copy') {
                hasAnswered = copyAnswers[q.id] && Object.values(copyAnswers[q.id]).some(txt => txt && txt.trim());
              } else if (mode === 'scramble') {
                hasAnswered = scrambleProgress[q.id]?.summary?.isAllExact ||
                  (scrambleProgress[q.id]?.slotStates &&
                   Object.values(scrambleProgress[q.id].slotStates).some(st => st.trayItems?.length > 0));
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  className={`nav-pill ${isCurrent ? 'is-current' : ''} ${hasAnswered ? 'is-answered' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {q.id}
                </button>
              );
            })}
          </div>

          {/* Hộp đáp án tham khảo (CHỈ HIỆN Ở CHẾ ĐỘ CHÉP LẠI KHI NGƯỜI DÙNG BẬT) */}
          {mode === 'copy' && showReferenceAnswer && (
            <div className="floating-ref-drawer">
              <div className="floating-ref-header">
                <span className="floating-ref-tag">👁️ ĐÁP ÁN THAM KHẢO (CÂU #{currentQ.id})</span>
                <button
                  type="button"
                  className="floating-ref-close-btn"
                  onClick={() => setShowReferenceAnswer(false)}
                  title="Ẩn"
                >
                  ✕ Ẩn
                </button>
              </div>
              <div className="floating-ref-body">
                {currentQ.slots.map(s => (
                  <div key={s.slotIndex} className="floating-ref-row">
                    <span className="ref-slot-pill">{s.label}</span>
                    <strong className="ref-slot-title">{s.title || `Ý ${s.slotIndex}`}:</strong>
                    <span className="ref-slot-answer">{s.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= CHẾ ĐỘ 1: ÔN TẬP CHÉP LẠI (COPY) ================= */}
          {mode === 'copy' && (
            <div className="copy-session-body">
              <Game1Copy
                key={currentQ.id}
                question={currentQ}
                initialInputs={copyAnswers[currentQ.id]}
                initialShowReference={showReferenceAnswer}
                onStateChange={inputs => handleCopyStateChange(currentQ.id, inputs)}
                onNext={() => {
                  if (currentIndex < sessionQuestions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    handleSubmitCopy();
                  }
                }}
              />

              {/* Điều hướng câu trước / câu sau */}
              <div className="session-nav-footer">
                <button
                  type="button"
                  className="nav-btn prev"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                >
                  ← Câu trước
                </button>

                <button
                  type="button"
                  className="nav-btn next"
                  onClick={() => {
                    if (currentIndex < sessionQuestions.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    } else {
                      handleSubmitCopy();
                    }
                  }}
                >
                  {currentIndex < sessionQuestions.length - 1 ? 'Câu tiếp theo →' : 'Tổng kết đợt ôn ✓'}
                </button>
              </div>
            </div>
          )}

          {/* ================= CHẾ ĐỘ 2: ÔN TẬP XÁO TỪ (SCRAMBLE) ================= */}
          {mode === 'scramble' && (
            <div className="scramble-session-body">
              <Game2Scramble
                key={currentQ.id}
                question={currentQ}
                initialState={scrambleProgress[currentQ.id]}
                onStateChange={state => handleScrambleStateChange(currentQ.id, state)}
                onNext={() => {
                  if (currentIndex < sessionQuestions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    handleSubmitScramble();
                  }
                }}
              />

              {/* Điều hướng câu trước / câu sau */}
              <div className="session-nav-footer">
                <button
                  type="button"
                  className="nav-btn prev"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                >
                  ← Câu trước
                </button>

                <button
                  type="button"
                  className="nav-btn next"
                  onClick={() => {
                    if (currentIndex < sessionQuestions.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    } else {
                      handleSubmitScramble();
                    }
                  }}
                >
                  {currentIndex < sessionQuestions.length - 1 ? 'Câu tiếp theo →' : 'Hoàn thành đợt ôn ✓'}
                </button>
              </div>
            </div>
          )}

          {/* ================= CHẾ ĐỘ 3: THI RIÊNG (EXAM) ================= */}
          {mode === 'exam' && (
            <div className="exam-session-body">
              <div className="exam-question-card">
                <div className="exam-q-badge-row">
                  <span className="exam-q-badge">CÂU {currentQ.id}</span>
                  <span className="exam-q-stage">Chặng {currentQ.stageId}</span>
                </div>
                <h2 className="exam-q-text">{currentQ.question}</h2>
              </div>

              {/* Tách riêng từng ô input cho từng ý của câu hỏi */}
              <div className="exam-slots-inputs">
                {currentQ.slots.map((s, sIdx) => {
                  const currentVal = examAnswers[currentQ.id]?.[s.slotIndex] || '';

                  return (
                    <div key={s.slotIndex} className="exam-slot-input-card">
                      <div className="exam-slot-header">
                        <span className="exam-slot-tag">{s.label || `Ý ${sIdx + 1}`}</span>
                        <strong>{s.title || `Ý số ${sIdx + 1}`}</strong>
                      </div>

                      <textarea
                        className="exam-slot-textarea"
                        rows={3}
                        value={currentVal}
                        onChange={e => handleExamInputChange(currentQ.id, s.slotIndex, e.target.value)}
                        placeholder={`Nhập câu trả lời cho ý ${s.label || sIdx + 1}...`}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Điều hướng và Nộp bài */}
              <div className="session-nav-footer">
                <button
                  type="button"
                  className="nav-btn prev"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                >
                  ← Câu trước
                </button>

                {currentIndex < sessionQuestions.length - 1 ? (
                  <button
                    type="button"
                    className="nav-btn next"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                  >
                    Câu tiếp theo →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="nav-btn finish"
                    onClick={handleSubmitExam}
                  >
                    Nộp bài thi & Xem kết quả 🏁
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. MÀN HÌNH KẾT QUẢ THI (RESULT) ================= */}
      {viewState === 'result' && examResultData && (
        <div className="result-view">
          <header className="result-header">
            <div className="score-circle-wrap">
              <div className="score-big-number">{examResultData.overallAccuracy}%</div>
              <div className="score-label">Độ chính xác tổng thể</div>
            </div>

            <div className="result-featured-sticker-wrap">
              <StickerReaction
                type={
                  examResultData.overallAccuracy === 100
                    ? 'determined'
                    : examResultData.overallAccuracy === 0
                    ? 'wake_up'
                    : examResultData.overallAccuracy >= 75
                    ? 'cheer'
                    : examResultData.overallAccuracy >= 50
                    ? 'thinking'
                    : examResultData.overallAccuracy >= 25
                    ? 'shocked'
                    : 'angry'
                }
                text={
                  examResultData.overallAccuracy === 100
                    ? 'Xuất sắc tuyệt đối! Bạn đã thuộc lòng 100%!'
                    : examResultData.overallAccuracy === 0
                    ? 'Tỉnh táo lên! Cố lên nào, đừng bỏ trống chứ!'
                    : examResultData.overallAccuracy >= 75
                    ? 'Khá lắm anh em ơi! Cố thêm xíu nữa là đạt 100%!'
                    : examResultData.overallAccuracy >= 50
                    ? 'Hơi lú một chút! Gãi đầu xem lại các câu sai nhé!'
                    : examResultData.overallAccuracy >= 25
                    ? 'Ối làng nước ơi!! Nhầm lẫn nhiều câu quá!'
                    : 'Quạu thật đấy! Phải phục thù thi lại ngay!'
                }
                size="lg"
                layout="horizontal"
                animate={examResultData.overallAccuracy === 100 ? 'bounce' : examResultData.overallAccuracy < 50 ? 'shake' : 'pop'}
              />
            </div>

            <h2 className="result-title">
              {examResultData.overallAccuracy === 100
                ? 'Xuất Sắc! Bạn Đã Thuộc Lòng 100%!'
                : `Hoàn Thành Đợt Luyện (${examResultData.perfectQuestionsCount}/${examResultData.totalQuestions} câu đạt 100%)`}
            </h2>

            <div className="result-stats-row">
              <span className="stat-pill">⏱️ Thời gian: {formatTimer(examResultData.elapsedSeconds)}</span>
              <span className="stat-pill">📝 Số câu: {examResultData.totalQuestions} câu</span>
              <span className="stat-pill">
                {examResultData.perfectQuestionsCount === examResultData.totalQuestions ? '🌟 Tuyệt đối' : '⚠️ Có chỗ cần sửa'}
              </span>
            </div>
          </header>

          {/* Nút hành động sau khi thi */}
          <div className="result-actions-bar">
            {examResultData.perfectQuestionsCount < examResultData.totalQuestions && (
              <button
                type="button"
                className="action-btn retry-wrong"
                onClick={handleRetryWrongQuestions}
              >
                🔄 Thi lại các câu làm sai
              </button>
            )}

            <button
              type="button"
              className="action-btn switch-copy"
              onClick={handleSwitchToCopyForThese}
            >
              ✍️ Ôn chép lại các câu này
            </button>

            <button
              type="button"
              className="action-btn switch-scramble"
              onClick={handleSwitchToScrambleForThese}
            >
              🧩 Ôn xáo từ các câu này
            </button>

            <button
              type="button"
              className="action-btn new-setup"
              onClick={() => setViewState('setup')}
            >
              ⚙️ Thiết lập đợt mới
            </button>
          </div>

          {/* Chi tiết từng câu hỏi và phân tích lỗi */}
          <div className="result-details-list">
            <h3 className="details-heading">Phân Tích Chi Tiết Từng Câu:</h3>

            {examResultData.results.map((r, rIdx) => {
              const q = r.question;

              return (
                <div key={q.id} className={`result-q-card ${r.isPerfect ? 'q-perfect' : 'q-has-error'}`}>
                  <div className="result-q-top">
                    <div className="result-q-meta">
                      <span className="q-badge">Câu {q.id}</span>
                      <strong className="q-status">
                        {r.isPerfect ? '✓ Đúng 100%' : `Độ chính xác: ${r.accuracy}%`}
                      </strong>
                    </div>
                    <StickerReaction
                      type={
                        r.isPerfect
                          ? 'determined'
                          : r.accuracy === 0
                          ? 'wake_up'
                          : r.accuracy < 40
                          ? 'angry'
                          : 'shocked'
                      }
                      text={
                        r.isPerfect
                          ? 'Đúng 100%!'
                          : r.accuracy === 0
                          ? 'Tỉnh táo lên! Đừng bỏ trống chứ!'
                          : r.accuracy < 40
                          ? 'Quạu ghê!'
                          : 'Ái chà sai rồi!'
                      }
                      size="sm"
                      layout="badge"
                      animate={r.isPerfect ? 'bounce' : 'shake'}
                    />
                  </div>

                  <p className="q-title-bold">{q.question}</p>

                  {/* Chi tiết từng ý */}
                  <div className="result-slots-breakdown">
                    {r.slotResults.map(sr => (
                      <div key={sr.slot.slotIndex} className={`slot-diff-row ${sr.grade.isExact ? 'is-exact-slot' : 'is-wrong-slot'}`}>
                        <div className="slot-diff-header">
                          <div className="slot-diff-title-wrap">
                            <span className="slot-tag">{sr.slot.label}</span>
                            <span className="slot-title">{sr.slot.title || `Ý số ${sr.slot.slotIndex}`}</span>
                          </div>
                          <span className={`diff-pill ${sr.grade.isExact ? 'exact' : 'wrong'}`}>
                            {sr.grade.isExact ? '✓ Chính xác 100%' : `Đúng: ${sr.grade.accuracy}%`}
                          </span>
                        </div>

                        {/* Nội dung bài làm & sửa bài */}
                        <div className="diff-content-box">
                          <div className="diff-line">
                            <span className="line-label">
                              {sr.grade.isExact ? 'Bài làm của bạn:' : 'Sửa bài trực tiếp (xanh: từ đúng • gạch ngang: từ dư • vàng: từ đúng thay thế):'}
                            </span>
                            <div className="tokens-display">
                              {sr.grade.diff && sr.grade.diff.length > 0 ? (
                                sr.grade.diff.map((item, tIdx) => {
                                  if (item.type === 'correct') {
                                    return (
                                      <span key={tIdx} className="token tok-correct" title="Từ đúng">
                                        {item.text}
                                      </span>
                                    );
                                  }
                                  if (item.type === 'wrong') {
                                    return (
                                      <span key={tIdx} className="token tok-wrong" title="Từ dư / sai (gạch bỏ)">
                                        {item.text}
                                      </span>
                                    );
                                  }
                                  return (
                                    <span key={tIdx} className="token tok-missing" title="Thế vào từ đúng">
                                      {item.text}
                                    </span>
                                  );
                                })
                              ) : sr.grade.userTokensResult && sr.grade.userTokensResult.length > 0 ? (
                                sr.grade.userTokensResult.map((tok, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`token ${tok.status === 'correct' ? 'tok-correct' : 'tok-wrong'}`}
                                  >
                                    {tok.text}
                                  </span>
                                ))
                              ) : (
                                <span className="empty-text">(Chưa nhập câu trả lời)</span>
                              )}
                            </div>
                          </div>

                          {/* Hiện đáp án chuẩn ở dưới bản full nguyên mẫu đầy đủ dấu câu , . () → */}
                          {!sr.grade.isExact && (
                            <div className="diff-line target-full">
                              <span className="line-label">✦ Đáp án chuẩn nguyên mẫu (đầy đủ dấu câu):</span>
                              <div className="full-answer-text">
                                {sr.slot?.answer || sr.slot?.targetAnswer || ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
