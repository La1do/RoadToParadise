import React, { useState, useEffect, useRef, useMemo } from 'react';
import questionsData from '../../data/questions.json';
import { compareAnswer } from '../../core/gradeEngine.js';
import { loadMistakeBook, addExamRecord } from '../../core/storageEngine.js';
import Game2Scramble from '../games/Game2Scramble.jsx';
import './CustomExamReview.css';

/**
 * CustomExamReview - Chế độ Ôn tập Xáo từ & Thi riêng tự chọn
 *
 * Cho phép người dùng:
 * 1. Tùy chọn chế độ: Ôn tập Xáo từ (Scramble) hoặc Thi tính điểm (Exam).
 * 2. Tùy chọn phạm vi câu hỏi: Toàn bộ, theo chặng, ngẫu nhiên N câu, sổ tiếc nuối, hoặc tick chọn từng câu 1..20.
 * 3. Tùy chọn xáo trộn thứ tự và đếm giờ làm bài.
 * 4. Chấm điểm chi tiết từng câu, từng ý (tô đỏ từ sai), thống kê tổng kết.
 * 5. Nút thi lại ngay các câu chưa đúng.
 */
export default function CustomExamReview({ onBackToMap }) {
  const allQuestions = questionsData.questions;

  // View state: 'setup' | 'session' | 'result'
  const [viewState, setViewState] = useState('setup');

  // Cấu hình đợt ôn thi:
  const [mode, setMode] = useState('scramble'); // 'scramble' | 'exam'
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([1, 2, 3, 4, 5]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0); // 0 = Không giới hạn

  // Session state:
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Exam inputs: { [questionId]: { [slotIndex]: text } }
  const [examAnswers, setExamAnswers] = useState({});
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
    setExamAnswers({});
    setElapsedSeconds(0);
    setViewState('session');
  };

  // Cập nhật câu trả lời của một ý trong chế độ thi
  const handleExamInputChange = (qId, slotIndex, value) => {
    setExamAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        [slotIndex]: value
      }
    }));
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

  // Câu hỏi hiện tại trong session
  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];

  return (
    <div className="custom-practice-container">
      {/* ================= 1. MÀN HÌNH THIẾT LẬP (SETUP) ================= */}
      {viewState === 'setup' && (
        <div className="setup-view">
          <header className="setup-header">
            <div className="header-badge">✦ KHÔNG GIAN HỌC TỰ CHỌN</div>
            <h1 className="header-title">Chế Độ Ôn Tập Xáo Từ & Thi Riêng</h1>
            <p className="header-desc">
              Tự do cấu hình bài ôn ghép cụm từ hoặc thi thử tính điểm theo danh sách câu bạn muốn rèn luyện.
            </p>
          </header>

          {/* Chọn chế độ: Xáo từ vs Thi */}
          <section className="setup-section">
            <label className="section-label">1. Chọn hình thức luyện tập:</label>
            <div className="mode-toggle-grid">
              <button
                type="button"
                className={`mode-toggle-btn ${mode === 'scramble' ? 'active-scramble' : ''}`}
                onClick={() => setMode('scramble')}
              >
                <span className="mode-icon">🧩</span>
                <div>
                  <strong>Ôn tập Xáo từ (Scramble)</strong>
                  <p>Luyện kéo thả / chạm ghép các cụm từ theo đúng thứ tự câu</p>
                </div>
              </button>

              <button
                type="button"
                className={`mode-toggle-btn ${mode === 'exam' ? 'active-exam' : ''}`}
                onClick={() => setMode('exam')}
              >
                <span className="mode-icon">📝</span>
                <div>
                  <strong>Chế độ Thi riêng (Real Exam)</strong>
                  <p>Tự gõ từng ý, tính giờ, chấm điểm nghiêm ngặt và tô đỏ chỗ sai</p>
                </div>
              </button>
            </div>
          </section>

          {/* Chọn phạm vi câu hỏi */}
          <section className="setup-section">
            <div className="section-header-flex">
              <label className="section-label">2. Chọn phạm vi câu hỏi ({selectedQuestionIds.length}/20 câu đã chọn):</label>
              <div className="preset-quick-actions">
                <button type="button" className="quick-btn" onClick={() => handleSelectPreset('all')}>Tất cả</button>
                <button type="button" className="quick-btn" onClick={() => handleSelectPreset('clear')}>Bỏ chọn</button>
              </div>
            </div>

            {/* Presets chọn nhanh */}
            <div className="presets-pill-row">
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage1')}>Chặng 1 (1-5)</button>
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage2')}>Chặng 2 (6-10)</button>
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage3')}>Chặng 3 (11-15)</button>
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage4')}>Chặng 4 (16-20)</button>
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random5')}>Ngẫu nhiên 5</button>
              <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random10')}>Ngẫu nhiên 10</button>
              <button type="button" className="preset-pill highlight" onClick={() => handleSelectPreset('mistakeBook')}>📖 Sổ Tiếc Nuối</button>
            </div>

            {/* Grid 20 câu để tick chọn thủ công */}
            <div className="questions-select-grid">
              {allQuestions.map(q => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`q-select-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleToggleQuestionId(q.id)}
                  >
                    <div className="q-card-top">
                      <span className="q-id-badge">Câu {q.id}</span>
                      <span className="q-stage-tag">Chặng {q.stageId}</span>
                    </div>
                    <p className="q-text-snippet">
                      {q.question.length > 55 ? `${q.question.slice(0, 55)}...` : q.question}
                    </p>
                    <div className="q-slots-count">{q.slots.length} ý</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tùy chọn bổ sung */}
          <section className="setup-section options-row">
            <div className="checkbox-option">
              <label>
                <input
                  type="checkbox"
                  checked={isShuffle}
                  onChange={e => setIsShuffle(e.target.checked)}
                />
                <span>🔀 Xáo trộn thứ tự các câu hỏi</span>
              </label>
            </div>

            {mode === 'exam' && (
              <div className="timer-select-wrap">
                <span>⏱️ Giới hạn thời gian:</span>
                <select
                  value={timeLimitMinutes}
                  onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                  className="time-select"
                >
                  <option value={0}>Không giới hạn (tự do)</option>
                  <option value={5}>5 phút</option>
                  <option value={10}>10 phút</option>
                  <option value={15}>15 phút</option>
                  <option value={20}>20 phút</option>
                </select>
              </div>
            )}
          </section>

          {/* Nút bắt đầu */}
          <div className="setup-start-footer">
            <button
              type="button"
              className="start-session-btn"
              onClick={handleStartSession}
              disabled={selectedQuestionIds.length === 0}
            >
              {mode === 'scramble'
                ? `🚀 Bắt đầu Ôn xáo từ (${selectedQuestionIds.length} câu) →`
                : `🏁 Bắt đầu Bài thi (${selectedQuestionIds.length} câu) →`}
            </button>
          </div>
        </div>
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
                {mode === 'scramble' ? '🧩 ÔN XÁO TỪ' : '📝 BÀI THI RIÊNG'}
              </span>
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
            </div>
          </header>

          {/* Thanh nhảy câu nhanh (Quick Question Navigator) */}
          <div className="question-nav-strip">
            {sessionQuestions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswered = mode === 'exam' && examAnswers[q.id] && Object.values(examAnswers[q.id]).some(txt => txt.trim());

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

          {/* NỘI DUNG 1: CHẾ ĐỘ ÔN TẬP XÁO TỪ (SCRAMBLE) */}
          {mode === 'scramble' && (
            <div className="scramble-session-body">
              <Game2Scramble
                key={currentQ.id}
                question={currentQ}
                onNext={() => {
                  if (currentIndex < sessionQuestions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    alert('Chúc mừng bạn đã hoàn thành tất cả các câu xáo từ trong đợt ôn này!');
                    setViewState('setup');
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
                      setViewState('setup');
                    }
                  }}
                >
                  {currentIndex < sessionQuestions.length - 1 ? 'Câu tiếp theo →' : 'Hoàn thành đợt ôn ✓'}
                </button>
              </div>
            </div>
          )}

          {/* NỘI DUNG 2: CHẾ ĐỘ THI RIÊNG (EXAM) */}
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

            <h2 className="result-title">
              {examResultData.overallAccuracy === 100
                ? 'Xuất Sắc! Bạn Đã Thuộc Lòng 100%!'
                : `Hoàn Thành Bài Thi (${examResultData.perfectQuestionsCount}/${examResultData.totalQuestions} câu đạt 100%)`}
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
              className="action-btn switch-scramble"
              onClick={handleSwitchToScrambleForThese}
            >
              🧩 Chuyển sang Ôn xáo từ các câu này
            </button>

            <button
              type="button"
              className="action-btn new-setup"
              onClick={() => setViewState('setup')}
            >
              ⚙️ Thiết lập đợt ôn thi mới
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
                    <span className="q-badge">Câu {q.id}</span>
                    <strong className="q-status">
                      {r.isPerfect ? '✓ Đúng 100%' : `Độ chính xác: ${r.accuracy}%`}
                    </strong>
                  </div>

                  <p className="q-title-bold">{q.question}</p>

                  {/* Chi tiết từng ý */}
                  <div className="result-slots-breakdown">
                    {r.slotResults.map(sr => (
                      <div key={sr.slot.slotIndex} className="slot-diff-row">
                        <div className="slot-diff-header">
                          <span className="slot-tag">{sr.slot.label}</span>
                          <strong>{sr.slot.title || `Ý số ${sr.slot.slotIndex}`}</strong>
                          <span className={`diff-pill ${sr.grade.isExact ? 'exact' : 'wrong'}`}>
                            {sr.grade.isExact ? 'Chính xác' : `${sr.grade.accuracy}%`}
                          </span>
                        </div>

                        {/* Đáp án bạn gõ */}
                        <div className="diff-content-box">
                          <div className="diff-line">
                            <span className="line-label">Bạn đã gõ:</span>
                            <div className="tokens-display">
                              {sr.grade.userTokensResult.length > 0 ? (
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

                          {/* Đáp án chuẩn */}
                          {!sr.grade.isExact && (
                            <div className="diff-line target">
                              <span className="line-label">Đáp án chuẩn:</span>
                              <div className="tokens-display">
                                {sr.grade.targetTokensResult.map((tok, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`token ${tok.status === 'correct' ? 'tok-target-ok' : 'tok-missing'}`}
                                  >
                                    {tok.text}
                                  </span>
                                ))}
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
