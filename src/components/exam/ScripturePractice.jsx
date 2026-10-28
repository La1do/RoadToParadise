import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseScripture as importedParseScripture, buildScriptureSlots as importedBuildScriptureSlots } from '../../core/scriptureEngine.js';
import { compareAnswer, tokenize } from '../../core/gradeEngine.js';
import StickerReaction from '../common/StickerReaction.jsx';
import AnswerInputCompanion from '../common/AnswerInputCompanion.jsx';
import AnswerDiff from '../common/AnswerDiff.jsx';
import './ScripturePractice.css';

/**
 * Fallback parser in case peer scriptureEngine is not yet mounted.
 * Follows exact contract:
 * parseScripture(text) -> { verses: [{ number, text }], warnings: [] }
 */
export function fallbackParseScripture(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Văn bản Kinh Thánh dán vào không được để trống.');
  }

  const lines = text.trim().split(/\r?\n+/);
  const verses = [];
  const warnings = [];
  let lastNum = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Matches e.g. "1. Text", "1 Text", "1: Text", "Câu 1: Text", "1:1 Text"
    const match = line.match(/^(?:câu\s+)?(?:(\d+)[:.](\d+)|(\d+))[.:\s\t-]+(.*)$/i);
    if (match) {
      const num = parseInt(match[2] || match[3] || match[1], 10);
      const textPart = match[4].trim();
      if (lastNum > 0 && num !== lastNum + 1) {
        warnings.push(`Câu ${num} không nối tiếp câu ${lastNum}.`);
      }
      lastNum = num;
      verses.push({ number: num, text: textPart });
    } else {
      if (verses.length > 0) {
        verses[verses.length - 1].text += ' ' + line;
      }
    }
  }

  if (verses.length === 0) {
    throw new Error('Không nhận diện được số thứ tự câu kinh nào từ văn bản. Vui lòng đảm bảo mỗi câu bắt đầu bằng số thứ tự (ví dụ: 1, 2, 3...).');
  }

  return { verses, warnings };
}

/**
 * Fallback slot builder:
 * buildScriptureSlots(verses, selectedNumbers, layout='paragraph'|'verse', abbreviation, chapter)
 * returns [{ id, label, answer }] with max 1200 words / slot.
 */
export function fallbackBuildScriptureSlots(verses, selectedNumbers, layout = 'paragraph', abbreviation = 'Kh', chapter = 1) {
  const selectedSet = new Set((selectedNumbers || []).map(Number));
  const selectedVerses = (verses || [])
    .filter(v => selectedSet.has(v.number))
    .sort((a, b) => a.number - b.number);

  if (selectedVerses.length === 0) return [];

  const abbr = (abbreviation || 'Kh').trim();
  const chap = Number(chapter) || 1;

  if (layout === 'verse') {
    return selectedVerses.map(v => ({
      id: `${abbr}-${chap}-${v.number}`,
      label: `${abbr} ${chap}:${v.number}`,
      answer: v.text.trim()
    }));
  }

  // Paragraph layout: contiguous selected verses grouped together
  const slots = [];
  let currentRange = [];

  for (const v of selectedVerses) {
    if (currentRange.length === 0) {
      currentRange.push(v);
    } else {
      const prev = currentRange[currentRange.length - 1];
      if (v.number === prev.number + 1) {
        currentRange.push(v);
      } else {
        slots.push(makeParagraphSlot(currentRange, abbr, chap));
        currentRange = [v];
      }
    }
  }

  if (currentRange.length > 0) {
    slots.push(makeParagraphSlot(currentRange, abbr, chap));
  }

  return slots;
}

function makeParagraphSlot(range, abbr, chap) {
  const first = range[0].number;
  const last = range[range.length - 1].number;
  const label = first === last ? `${abbr} ${chap}:${first}` : `${abbr} ${chap}:${first}~${last}`;
  const id = `${abbr}-${chap}-${first}-${last}`;
  const answer = range.map(v => v.text.trim()).join(' ');
  return { id, label, answer };
}

export function executeParseScripture(text) {
  if (typeof importedParseScripture === 'function') {
    try {
      return importedParseScripture(text);
    } catch (err) {
      throw err;
    }
  }
  return fallbackParseScripture(text);
}

export function executeBuildScriptureSlots(verses, selectedNumbers, layout, abbreviation, chapter) {
  if (typeof importedBuildScriptureSlots === 'function') {
    try {
      const result = importedBuildScriptureSlots(verses, selectedNumbers, layout, abbreviation, chapter);
      if (Array.isArray(result) && result.length > 0) return result;
    } catch {
      // fallback
    }
  }
  return fallbackBuildScriptureSlots(verses, selectedNumbers, layout, abbreviation, chapter);
}

/**
 * Safety guard: counts tokens using tokenize from gradeEngine (not whitespace alone)
 */
export function validateUserAnswerTokens(userInput, maxWords = 1200) {
  const tokens = tokenize(userInput || '');
  if (tokens.length > maxWords) {
    return {
      valid: false,
      tokenCount: tokens.length,
      error: `Nội dung bài làm có ${tokens.length} từ, vượt quá giới hạn ${maxWords} từ. Vui lòng rút ngắn nội dung hoặc chọn phạm vi câu nhỏ hơn để so sánh chính xác.`
    };
  }
  return { valid: true, tokenCount: tokens.length, error: null };
}

/**
 * Clamps user text for LCS safety before calling compareAnswer
 */
export function clampUserTextForLCS(userInput, maxWords = 1200, maxChars = 15000) {
  if (!userInput || typeof userInput !== 'string') return '';
  let str = userInput;
  if (str.length > maxChars) {
    str = str.slice(0, maxChars);
  }
  const tokens = tokenize(str);
  if (tokens.length > maxWords) {
    return tokens.slice(0, maxWords).join(' ');
  }
  return str;
}

export function formatTimerSeconds(totalSec) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ScripturePractice({ onBackToMap }) {
  // Navigation / View state: 'setup' | 'session' | 'result'
  const [viewState, setViewState] = useState('setup');

  // Book & Chapter configuration
  const [book, setBook] = useState('Khải huyền');
  const [abbreviation, setAbbreviation] = useState('Kh');
  const [chapter, setChapter] = useState(1);

  // Source text & parsing
  const [sourceText, setSourceText] = useState('');
  const [lastParsedSource, setLastParsedSource] = useState('');
  const [parsedVerses, setParsedVerses] = useState([]);
  const [parseWarnings, setParseWarnings] = useState([]);
  const [parseError, setParseError] = useState(null);

  // Selection
  const [selectedVerseNumbers, setSelectedVerseNumbers] = useState([]);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  // Mode & Layout
  const [mode, setMode] = useState('practice'); // 'practice' | 'exam'
  const [layout, setLayout] = useState('paragraph'); // 'paragraph' | 'verse'
  const [showReference, setShowReference] = useState(true);

  // Active session
  const [sessionSlots, setSessionSlots] = useState([]);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [slotGrades, setSlotGrades] = useState({});
  const [slotErrors, setSlotErrors] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  // Validation before session
  const [validationError, setValidationError] = useState(null);

  // Results
  const [resultData, setResultData] = useState(null);

  // Timer ref
  const timerRef = useRef(null);

  // Is parsed text out of sync with current sourceText?
  const isStaleParse = useMemo(() => {
    return sourceText.trim() !== '' && lastParsedSource !== '' && sourceText !== lastParsedSource;
  }, [sourceText, lastParsedSource]);

  // Timer effect for session
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

  // Handle parse scripture button
  const handleParseScripture = () => {
    setParseError(null);
    setParseWarnings([]);
    setValidationError(null);

    if (!sourceText.trim()) {
      setParseError('Vui lòng dán văn bản Kinh Thánh vào ô trước khi bấm phân tích.');
      return;
    }

    try {
      const result = executeParseScripture(sourceText);
      const verses = result?.verses || [];
      const warnings = result?.warnings || [];

      if (!verses || verses.length === 0) {
        setParseError('Không nhận diện được câu kinh nào từ văn bản.');
        return;
      }

      setParsedVerses(verses);
      setParseWarnings(warnings);
      setLastParsedSource(sourceText);
      // Automatically select all parsed verses initially if none selected
      setSelectedVerseNumbers(verses.map(v => v.number));
      if (verses.length > 0) {
        setRangeFrom(verses[0].number);
        setRangeTo(verses[verses.length - 1].number);
      }
    } catch (err) {
      setParseError(err.message || 'Lỗi phân tích văn bản Kinh Thánh.');
    }
  };

  // Selection handlers
  const handleToggleVerse = (num) => {
    setSelectedVerseNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const handleSelectAll = () => {
    setSelectedVerseNumbers(parsedVerses.map(v => v.number));
  };

  const handleClearSelection = () => {
    setSelectedVerseNumbers([]);
  };

  const handleAddRange = () => {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (isNaN(from) || isNaN(to) || from <= 0 || to <= 0) {
      alert('Vui lòng nhập số câu hợp lệ cho khoảng cần chọn.');
      return;
    }
    const start = Math.min(from, to);
    const end = Math.max(from, to);

    const availableNumbers = new Set(parsedVerses.map(v => v.number));
    const toAdd = [];
    for (let i = start; i <= end; i++) {
      if (availableNumbers.has(i)) {
        toAdd.push(i);
      }
    }

    setSelectedVerseNumbers(prev => {
      const combined = new Set([...prev, ...toAdd]);
      return Array.from(combined).sort((a, b) => a - b);
    });
  };

  // Editable preview handlers
  const handleEditVerseNumber = (index, newNumberStr) => {
    const newNum = parseInt(newNumberStr, 10);
    setParsedVerses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], number: isNaN(newNum) ? '' : newNum };
      return updated;
    });
  };

  const handleEditVerseText = (index, newText) => {
    setParsedVerses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated;
    });
  };

  const handleDeleteVerse = (index) => {
    const target = parsedVerses[index];
    setParsedVerses(prev => prev.filter((_, i) => i !== index));
    if (target) {
      setSelectedVerseNumbers(prev => prev.filter(n => n !== target.number));
    }
  };

  const handleAddNewVerse = () => {
    const lastVerse = parsedVerses[parsedVerses.length - 1];
    const nextNum = lastVerse ? (Number(lastVerse.number) || 0) + 1 : 1;
    const newVerse = { number: nextNum, text: '' };
    setParsedVerses(prev => [...prev, newVerse]);
    setSelectedVerseNumbers(prev => [...prev, nextNum]);
  };

  // Preview generated slots in setup view
  const previewSlots = useMemo(() => {
    if (parsedVerses.length === 0 || selectedVerseNumbers.length === 0) return [];
    return executeBuildScriptureSlots(parsedVerses, selectedVerseNumbers, layout, abbreviation, chapter);
  }, [parsedVerses, selectedVerseNumbers, layout, abbreviation, chapter]);

  // Validation before starting session
  const validateBeforeStart = () => {
    if (!book.trim()) {
      return 'Tên sách không được để trống.';
    }
    if (!abbreviation.trim()) {
      return 'Tên viết tắt của sách không được để trống.';
    }
    const chapNum = Number(chapter);
    if (isNaN(chapNum) || chapNum <= 0) {
      return 'Số chương phải là số nguyên dương lớn hơn 0.';
    }
    if (parsedVerses.length === 0) {
      return 'Chưa có câu kinh nào được phân tích. Vui lòng dán văn bản và bấm Phân tích câu.';
    }
    if (isStaleParse) {
      return 'Văn bản đã dán đã bị thay đổi so với bản phân tích trước đó. Vui lòng bấm "Phân tích câu" để đồng bộ lại.';
    }
    if (selectedVerseNumbers.length === 0) {
      return 'Vui lòng chọn ít nhất 1 câu kinh để bắt đầu ôn thi.';
    }

    // Check for empty or duplicate verse numbers in preview
    const seenNumbers = new Set();
    const duplicateNumbers = new Set();
    for (const v of parsedVerses) {
      if (v.number === '' || isNaN(v.number) || v.number <= 0) {
        return 'Tất cả các câu kinh phải có số thứ tự là số nguyên dương.';
      }
      if (seenNumbers.has(v.number)) {
        duplicateNumbers.add(v.number);
      }
      seenNumbers.add(v.number);

      if (!v.text || !v.text.trim()) {
        return `Nội dung của câu ${v.number} đang để trống. Vui lòng nhập nội dung hoặc xóa câu này.`;
      }
    }

    if (duplicateNumbers.size > 0) {
      return `Số câu bị trùng lặp: câu ${Array.from(duplicateNumbers).join(', ')}. Mỗi câu phải có số thứ tự duy nhất.`;
    }

    const slots = executeBuildScriptureSlots(parsedVerses, selectedVerseNumbers, layout, abbreviation, chapter);
    if (!slots || slots.length === 0) {
      return 'Không tạo được phần làm bài nào từ các câu đã chọn. Vui lòng kiểm tra lại danh sách chọn câu.';
    }

    return null;
  };

  // Start session
  const handleStartSession = () => {
    const error = validateBeforeStart();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    const slots = executeBuildScriptureSlots(parsedVerses, selectedVerseNumbers, layout, abbreviation, chapter);
    setSessionSlots(slots);
    setCurrentSlotIndex(0);
    setUserAnswers({});
    setSlotGrades({});
    setSlotErrors({});
    setElapsedSeconds(0);
    setSessionKey(prev => prev + 1);
    setViewState('session');
  };

  // Handle user input in session textarea
  const handleSlotInputChange = (slotId, text) => {
    setUserAnswers(prev => ({
      ...prev,
      [slotId]: text
    }));

    // Clear previous error when typing
    if (slotErrors[slotId]) {
      setSlotErrors(prev => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }

    // In practice mode, if previously graded, clear grade so companion returns to typing
    if (mode === 'practice' && slotGrades[slotId]) {
      setSlotGrades(prev => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    }
  };

  // Practice mode: check single slot
  const handleCheckSlot = (slot) => {
    const text = userAnswers[slot.id] || '';
    const validation = validateUserAnswerTokens(text, 1200);

    if (!validation.valid) {
      setSlotErrors(prev => ({
        ...prev,
        [slot.id]: validation.error
      }));
      return;
    }

    const clamped = clampUserTextForLCS(text, 1200);
    const grade = compareAnswer(clamped, slot.answer);
    setSlotGrades(prev => ({
      ...prev,
      [slot.id]: grade
    }));
  };

  // Reset single slot in practice mode
  const handleResetSlot = (slotId) => {
    setUserAnswers(prev => ({
      ...prev,
      [slotId]: ''
    }));
    setSlotGrades(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setSlotErrors(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  // Submit / finalize session (for both Exam and Practice completion)
  const handleSubmitSession = () => {
    // Check if any slot has excessive words
    let hasTokenError = false;
    const newErrors = {};

    sessionSlots.forEach(slot => {
      const val = userAnswers[slot.id] || '';
      const v = validateUserAnswerTokens(val, 1200);
      if (!v.valid) {
        hasTokenError = true;
        newErrors[slot.id] = v.error;
      }
    });

    if (hasTokenError) {
      setSlotErrors(newErrors);
      alert('Một số phần làm bài có độ dài vượt quá 1200 từ. Vui lòng rút ngắn lại trước khi nộp bài.');
      return;
    }

    let totalScore = 0;
    let perfectSlotsCount = 0;
    const slotResults = [];

    sessionSlots.forEach(slot => {
      const userText = userAnswers[slot.id] || '';
      const clamped = clampUserTextForLCS(userText, 1200);
      const grade = compareAnswer(clamped, slot.answer);

      // CRITICAL: A slot is ONLY perfect if grade.isExact is true.
      // compareAnswer can produce accuracy: 100 even with extra wrong words when isExact is false!
      const isSlotPerfect = Boolean(grade && grade.isExact);

      if (isSlotPerfect) {
        perfectSlotsCount++;
      }
      totalScore += grade.accuracy;

      slotResults.push({
        slot,
        userInput: userText,
        grade,
        isPerfect: isSlotPerfect
      });
    });

    const overallAccuracy = sessionSlots.length > 0
      ? Math.round(totalScore / sessionSlots.length)
      : 0;

    setResultData({
      mode,
      totalSlots: sessionSlots.length,
      perfectSlotsCount,
      overallAccuracy,
      elapsedSeconds,
      slotResults,
      book,
      chapter
    });

    setViewState('result');
  };

  // Retry only wrong slots
  const handleRetryWrongSlots = () => {
    if (!resultData) return;

    // Filter to only slots where isPerfect is false
    const wrongSlots = resultData.slotResults
      .filter(r => !r.isPerfect)
      .map(r => r.slot);

    if (wrongSlots.length === 0) {
      alert('Tất cả các phần đều đã đạt 100%! Không có phần nào bị sai.');
      return;
    }

    setSessionSlots(wrongSlots);
    setCurrentSlotIndex(0);
    // Clear answers and grades for these slots
    const newAnswers = { ...userAnswers };
    const newGrades = { ...slotGrades };
    wrongSlots.forEach(s => {
      newAnswers[s.id] = '';
      delete newGrades[s.id];
    });
    setUserAnswers(newAnswers);
    setSlotGrades(newGrades);
    setSlotErrors({});
    setElapsedSeconds(0);
    setSessionKey(prev => prev + 1);
    setViewState('session');
  };

  // Retry all slots
  const handleRetryAllSlots = () => {
    setCurrentSlotIndex(0);
    setUserAnswers({});
    setSlotGrades({});
    setSlotErrors({});
    setElapsedSeconds(0);
    setSessionKey(prev => prev + 1);
    setViewState('session');
  };

  // Current slot in session
  const currentSlot = sessionSlots[currentSlotIndex] || null;
  const currentSlotValue = currentSlot ? (userAnswers[currentSlot.id] || '') : '';
  const currentSlotGrade = currentSlot ? slotGrades[currentSlot.id] : null;
  const currentSlotTokenCount = useMemo(() => {
    return tokenize(currentSlotValue).length;
  }, [currentSlotValue]);

  return (
    <div className="scripture-practice" role="region" aria-label="Luyện tập và thi câu Kinh Thánh">
      {/* =========================================================================
          1. MÀN HÌNH THIẾT LẬP (SETUP VIEW)
         ========================================================================= */}
      {viewState === 'setup' && (
        <div className="sp-setup">
          <header className="sp-header">
            {onBackToMap && (
              <button
                type="button"
                className="sp-btn sp-btn--outline sp-back-nav"
                onClick={onBackToMap}
                aria-label="Quay lại trang chính"
              >
                ← Về bản đồ
              </button>
            )}
            <div className="sp-header__intro">
              <h1 className="sp-title">Học và Thi Câu Kinh Tự Chọn</h1>
              <p className="sp-subtitle">
                Dán văn bản Kinh Thánh từ bản dịch của bạn, chọn các câu cần ôn và luyện trí nhớ.
              </p>
              <div className="sp-help-notice" role="note">
                <span className="sp-help-icon" aria-hidden="true">✦</span>
                <span>
                  Lưu ý: Dữ liệu câu kinh tự dán chỉ lưu trong phiên làm việc hiện tại của trình duyệt, không lưu vĩnh viễn trên máy chủ.
                </span>
              </div>
            </div>
          </header>

          {validationError && (
            <div className="sp-alert sp-alert--danger" role="alert">
              <strong>Không thể bắt đầu:</strong> {validationError}
            </div>
          )}

          <div className="sp-setup-grid">
            {/* Cột trái: Thông tin sách, hình thức và bố cục */}
            <div className="sp-setup-col sp-setup-col--left">
              <section className="sp-card sp-card--config">
                <h2 className="sp-card__title">1. Thông tin Sách & Chương</h2>

                <div className="sp-form-row">
                  <div className="sp-form-group">
                    <label htmlFor="sp-book-name" className="sp-label">Tên sách:</label>
                    <input
                      id="sp-book-name"
                      type="text"
                      className="sp-input"
                      value={book}
                      onChange={e => setBook(e.target.value)}
                      placeholder="Ví dụ: Khải huyền"
                    />
                  </div>

                  <div className="sp-form-group">
                    <label htmlFor="sp-book-abbr" className="sp-label">Viết tắt:</label>
                    <input
                      id="sp-book-abbr"
                      type="text"
                      className="sp-input"
                      value={abbreviation}
                      onChange={e => setAbbreviation(e.target.value)}
                      placeholder="Ví dụ: Kh"
                    />
                  </div>

                  <div className="sp-form-group">
                    <label htmlFor="sp-chapter-num" className="sp-label">Chương:</label>
                    <input
                      id="sp-chapter-num"
                      type="number"
                      min="1"
                      className="sp-input"
                      value={chapter}
                      onChange={e => setChapter(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                  </div>
                </div>
              </section>

              <section className="sp-card sp-card--mode">
                <h2 className="sp-card__title">2. Chế độ Luyện tập</h2>
                <div className="sp-mode-selector" role="radiogroup" aria-label="Chọn chế độ ôn tập hoặc thi">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={mode === 'practice'}
                    className={`sp-mode-btn ${mode === 'practice' ? 'is-active' : ''}`}
                    onClick={() => setMode('practice')}
                  >
                    <span className="sp-mode-btn__badge">Ôn tập</span>
                    <strong className="sp-mode-btn__heading">Ôn tập câu kinh</strong>
                    <span className="sp-mode-btn__desc">
                      Gõ từng phần, có thể mở câu gốc tham khảo và kiểm tra kết quả ngay.
                    </span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={mode === 'exam'}
                    className={`sp-mode-btn ${mode === 'exam' ? 'is-active' : ''}`}
                    onClick={() => setMode('exam')}
                  >
                    <span className="sp-mode-btn__badge">Thi thử</span>
                    <strong className="sp-mode-btn__heading">Bài thi câu kinh</strong>
                    <span className="sp-mode-btn__desc">
                      Tự nhớ hoàn toàn, không có đáp án trước khi nộp, có đồng hồ tính giờ.
                    </span>
                  </button>
                </div>
              </section>

              <section className="sp-card sp-card--layout">
                <h2 className="sp-card__title">3. Bố cục Chia phần (Layout)</h2>
                <div className="sp-layout-selector" role="radiogroup" aria-label="Chọn bố cục đoạn hoặc từng câu">
                  <label className={`sp-radio-card ${layout === 'paragraph' ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="sp-layout"
                      value="paragraph"
                      checked={layout === 'paragraph'}
                      onChange={() => setLayout('paragraph')}
                    />
                    <div className="sp-radio-card__body">
                      <strong>Theo đoạn (Khối liên tiếp) - Mặc định</strong>
                      <p>Gộp các câu liên tiếp được chọn thành một ô nhập (ví dụ: {abbreviation || 'Kh'} {chapter}:1~8).</p>
                    </div>
                  </label>

                  <label className={`sp-radio-card ${layout === 'verse' ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="sp-layout"
                      value="verse"
                      checked={layout === 'verse'}
                      onChange={() => setLayout('verse')}
                    />
                    <div className="sp-radio-card__body">
                      <strong>Từng câu riêng biệt</strong>
                      <p>Mỗi câu kinh đã chọn là một ô nhập riêng biệt (ví dụ: {abbreviation || 'Kh'} {chapter}:1).</p>
                    </div>
                  </label>
                </div>
              </section>

              <div className="sp-start-action">
                <button
                  type="button"
                  className="sp-btn sp-btn--primary sp-btn--large sp-btn--block"
                  onClick={handleStartSession}
                >
                  {mode === 'practice'
                    ? `Bắt đầu Ôn tập (${previewSlots.length} phần) →`
                    : `Bắt đầu Bài thi (${previewSlots.length} phần) →`}
                </button>
              </div>
            </div>

            {/* Cột phải: Dán văn bản, phân tích và chọn câu */}
            <div className="sp-setup-col sp-setup-col--right">
              <section className="sp-card sp-card--paste">
                <div className="sp-card__header-flex">
                  <h2 className="sp-card__title">4. Dán Văn bản Kinh Thánh</h2>
                  {parsedVerses.length > 0 && (
                    <span className="sp-badge sp-badge--neutral">
                      Đã phân tích: {parsedVerses.length} câu
                    </span>
                  )}
                </div>

                <p className="sp-field-hint">
                  Dán nội dung đoạn Kinh Thánh từ tài liệu của bạn. Mỗi câu nên bắt đầu bằng số thứ tự (ví dụ: 1 Sự mặc thị...).
                </p>

                <textarea
                  className="sp-textarea sp-source-paste-area"
                  rows={6}
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                  placeholder="Dán đoạn Kinh Thánh vào đây...&#10;1 Sự mặc thị của Đức Chúa Jêsus Christ...&#10;2 Giăng đã làm chứng về lời Đức Chúa Trời...&#10;3 Phước cho kẻ đọc và nghe lời tiên tri..."
                  aria-label="Văn bản Kinh Thánh dán vào"
                />

                <div className="sp-paste-actions">
                  <button
                    type="button"
                    className="sp-btn sp-btn--primary"
                    onClick={handleParseScripture}
                  >
                    Phân tích câu
                  </button>

                  {sourceText && (
                    <button
                      type="button"
                      className="sp-btn sp-btn--ghost"
                      onClick={() => {
                        setSourceText('');
                        setLastParsedSource('');
                        setParsedVerses([]);
                        setSelectedVerseNumbers([]);
                        setParseError(null);
                        setParseWarnings([]);
                      }}
                    >
                      Xóa văn bản dán
                    </button>
                  )}
                </div>

                {isStaleParse && (
                  <div className="sp-alert sp-alert--warning" role="alert">
                    <strong>Văn bản đã thay đổi:</strong> Nội dung trong ô dán khác với danh sách câu đã phân tích. Vui lòng bấm &ldquo;Phân tích câu&rdquo; để đồng bộ lại.
                  </div>
                )}

                {parseError && (
                  <div className="sp-alert sp-alert--danger" role="alert">
                    {parseError}
                  </div>
                )}

                {parseWarnings.length > 0 && (
                  <div className="sp-alert sp-alert--info" role="status">
                    <strong>Ghi chú phân tích:</strong>
                    <ul>
                      {parseWarnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Danh sách câu đã phân tích & Chọn câu */}
              {parsedVerses.length > 0 && (
                <section className="sp-card sp-card--verses-selector">
                  <div className="sp-card__header-flex">
                    <h2 className="sp-card__title">5. Chọn Câu & Chỉnh Sửa Xem Trước</h2>
                    <span className="sp-badge sp-badge--primary">
                      Đã chọn {selectedVerseNumbers.length} / {parsedVerses.length} câu
                    </span>
                  </div>

                  <div className="sp-selection-toolbar">
                    <div className="sp-toolbar-group">
                      <button
                        type="button"
                        className="sp-btn sp-btn--sm sp-btn--outline"
                        onClick={handleSelectAll}
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="sp-btn sp-btn--sm sp-btn--outline"
                        onClick={handleClearSelection}
                      >
                        Bỏ chọn
                      </button>
                    </div>

                    <div className="sp-range-picker">
                      <span className="sp-range-label">Từ câu:</span>
                      <input
                        type="number"
                        min="1"
                        className="sp-input sp-input--sm sp-range-input"
                        value={rangeFrom}
                        onChange={e => setRangeFrom(e.target.value)}
                        aria-label="Từ câu số"
                      />
                      <span className="sp-range-label">Đến:</span>
                      <input
                        type="number"
                        min="1"
                        className="sp-input sp-input--sm sp-range-input"
                        value={rangeTo}
                        onChange={e => setRangeTo(e.target.value)}
                        aria-label="Đến câu số"
                      />
                      <button
                        type="button"
                        className="sp-btn sp-btn--sm sp-btn--secondary"
                        onClick={handleAddRange}
                      >
                        Thêm khoảng
                      </button>
                    </div>
                  </div>

                  <div className="sp-verses-table-wrap">
                    <table className="sp-verses-table" aria-label="Bảng các câu kinh đã phân tích">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}>Chọn</th>
                          <th style={{ width: 72 }}>Số câu</th>
                          <th>Nội dung câu kinh</th>
                          <th style={{ width: 44 }}>Xóa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedVerses.map((verse, idx) => {
                          const isSelected = selectedVerseNumbers.includes(verse.number);
                          return (
                            <tr key={idx} className={isSelected ? 'is-selected' : ''}>
                              <td className="sp-col-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleVerse(verse.number)}
                                  aria-label={`Chọn câu ${verse.number}`}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  className="sp-input sp-input--sm sp-verse-num-input"
                                  value={verse.number}
                                  onChange={e => handleEditVerseNumber(idx, e.target.value)}
                                  aria-label={`Số thứ tự câu ${idx + 1}`}
                                />
                              </td>
                              <td>
                                <textarea
                                  className="sp-textarea sp-verse-text-input"
                                  rows={2}
                                  value={verse.text}
                                  onChange={e => handleEditVerseText(idx, e.target.value)}
                                  aria-label={`Nội dung câu ${verse.number}`}
                                />
                              </td>
                              <td className="sp-col-center">
                                <button
                                  type="button"
                                  className="sp-btn-icon sp-btn-icon--danger"
                                  onClick={() => handleDeleteVerse(idx)}
                                  aria-label={`Xóa câu ${verse.number}`}
                                  title="Xóa câu này"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="sp-add-verse-wrap">
                    <button
                      type="button"
                      className="sp-btn sp-btn--sm sp-btn--ghost"
                      onClick={handleAddNewVerse}
                    >
                      + Thêm một câu mới
                    </button>
                  </div>
                </section>
              )}

              {/* Xem trước các phần sẽ chia (Preview slots) */}
              {previewSlots.length > 0 && (
                <section className="sp-card sp-card--slots-preview">
                  <h2 className="sp-card__title">6. Xem Trước Các Phần Sẽ Làm Bài ({previewSlots.length} phần)</h2>
                  <div className="sp-slots-preview-grid">
                    {previewSlots.map((slot, sIdx) => {
                      const words = tokenize(slot.answer).length;
                      return (
                        <div key={slot.id} className="sp-slot-chip">
                          <span className="sp-slot-chip__index">#{sIdx + 1}</span>
                          <strong className="sp-slot-chip__label">{slot.label}</strong>
                          <span className="sp-slot-chip__words">{words} từ</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MÀN HÌNH PHIÊN LÀM BÀI (SESSION VIEW)
         ========================================================================= */}
      {viewState === 'session' && currentSlot && (
        <div className="sp-session" key={sessionKey}>
          {/* Header bar của phiên làm bài */}
          <header className="sp-session-header">
            <div className="sp-session-header__left">
              <button
                type="button"
                className="sp-btn sp-btn--sm sp-btn--outline"
                onClick={() => {
                  const hasAnsweredAny = Object.values(userAnswers).some(t => t && t.trim());
                  if (hasAnsweredAny) {
                    if (confirm('Bạn có bài làm chưa lưu. Bạn có chắc muốn quay lại trang thiết lập không?')) {
                      setViewState('setup');
                    }
                  } else {
                    setViewState('setup');
                  }
                }}
              >
                ← Thiết lập
              </button>

              <span className={`sp-badge ${mode === 'exam' ? 'sp-badge--danger' : 'sp-badge--primary'}`}>
                {mode === 'exam' ? 'BÀI THI CÂU KINH' : 'ÔN TẬP CÂU KINH'}
              </span>

              {mode === 'practice' && (
                <button
                  type="button"
                  className="sp-btn sp-btn--sm sp-btn--ghost sp-ref-toggle-btn"
                  onClick={() => setShowReference(prev => !prev)}
                >
                  {showReference ? 'Ẩn câu gốc' : 'Hiện câu gốc'}
                </button>
              )}
            </div>

            <div className="sp-session-header__center">
              <span className="sp-session-counter">
                Phần {currentSlotIndex + 1} / {sessionSlots.length}
              </span>
              <div className="sp-session-timer" aria-label="Thời gian làm bài">
                Thời gian: {formatTimerSeconds(elapsedSeconds)}
              </div>
            </div>

            <div className="sp-session-header__right">
              {mode === 'exam' ? (
                <button
                  type="button"
                  className="sp-btn sp-btn--primary sp-btn--sm"
                  onClick={handleSubmitSession}
                >
                  Nộp bài thi
                </button>
              ) : (
                <button
                  type="button"
                  className="sp-btn sp-btn--primary sp-btn--sm"
                  onClick={handleSubmitSession}
                >
                  Tổng kết ôn tập
                </button>
              )}
            </div>
          </header>

          {/* Dải điều hướng các phần (Nav strip) */}
          <nav className="sp-nav-strip" aria-label="Danh sách các phần làm bài">
            {sessionSlots.map((slot, idx) => {
              const isCurrent = idx === currentSlotIndex;
              const hasText = Boolean(userAnswers[slot.id]?.trim());
              const isChecked = Boolean(slotGrades[slot.id]);
              const isExact = Boolean(slotGrades[slot.id]?.isExact);

              let statusClass = '';
              if (mode === 'practice' && isChecked) {
                statusClass = isExact ? 'is-exact' : 'is-wrong';
              } else if (hasText) {
                statusClass = 'is-answered';
              }

              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`sp-nav-pill ${isCurrent ? 'is-current' : ''} ${statusClass}`}
                  onClick={() => setCurrentSlotIndex(idx)}
                  aria-label={`Chuyển đến ${slot.label}`}
                >
                  <span className="sp-nav-pill__num">{idx + 1}</span>
                  <span className="sp-nav-pill__text">{slot.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Thân phiên làm bài cho phần hiện tại */}
          <main className="sp-session-body">
            <div className="sp-slot-card">
              <div className="sp-slot-card__meta">
                <span className="sp-slot-card__tag">
                  Phần {currentSlotIndex + 1} / {sessionSlots.length}
                </span>
                <h2 className="sp-slot-card__heading">
                  {book} {chapter} ({currentSlot.label})
                </h2>
              </div>

              {/* Trong chế độ ôn tập, hiển thị câu gốc nếu bật toggle */}
              {mode === 'practice' && (
                <div className="sp-practice-ref-box">
                  {showReference ? (
                    <div className="sp-ref-content">
                      <div className="sp-ref-content__header">
                        <strong className="sp-ref-title">Câu gốc tham khảo ({currentSlot.label}):</strong>
                      </div>
                      <p className="sp-ref-text">{currentSlot.answer}</p>
                    </div>
                  ) : (
                    <div className="sp-ref-hidden-hint">
                      <span>Câu gốc đang được ẩn để bạn tự nhớ lại. Bấm &ldquo;Hiện câu gốc&rdquo; nếu bạn muốn xem lại mẫu.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ô nhập bài làm tích hợp AnswerInputCompanion */}
              <div className="sp-input-container">
                <label htmlFor={`sp-slot-input-${currentSlot.id}`} className="sp-label">
                  Nhập nội dung cho {currentSlot.label}:
                </label>

                <AnswerInputCompanion
                  value={currentSlotValue}
                  grade={mode === 'practice' ? currentSlotGrade : undefined}
                  exam={mode === 'exam'}
                >
                  <textarea
                    id={`sp-slot-input-${currentSlot.id}`}
                    className="sp-textarea sp-slot-textarea"
                    rows={6}
                    value={currentSlotValue}
                    onChange={e => handleSlotInputChange(currentSlot.id, e.target.value)}
                    placeholder={`Nhập đoạn Kinh Thánh cho ${currentSlot.label}...`}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-label={`Bài làm cho ${currentSlot.label}`}
                  />
                </AnswerInputCompanion>

                <div className="sp-input-footer">
                  <span className={`sp-token-counter ${currentSlotTokenCount > 1200 ? 'is-overflow' : ''}`}>
                    {currentSlotTokenCount} / 1200 từ
                  </span>
                </div>

                {slotErrors[currentSlot.id] && (
                  <div className="sp-alert sp-alert--danger" role="alert">
                    {slotErrors[currentSlot.id]}
                  </div>
                )}
              </div>

              {/* Các thao tác kiểm tra trong chế độ ôn tập */}
              {mode === 'practice' && (
                <div className="sp-practice-actions">
                  <button
                    type="button"
                    className="sp-btn sp-btn--primary"
                    onClick={() => handleCheckSlot(currentSlot)}
                  >
                    Kiểm tra phần này
                  </button>

                  <button
                    type="button"
                    className="sp-btn sp-btn--outline"
                    onClick={() => handleResetSlot(currentSlot.id)}
                  >
                    Làm lại phần này
                  </button>
                </div>
              )}

              {/* Hiển thị diff sửa lỗi trong chế độ ôn tập sau khi bấm kiểm tra */}
              {mode === 'practice' && currentSlotGrade && (
                <div className="sp-slot-feedback">
                  <div className="sp-slot-feedback__header">
                    <strong>Kết quả kiểm tra:</strong>
                    <span className={`sp-badge ${currentSlotGrade.isExact ? 'sp-badge--success' : 'sp-badge--danger'}`}>
                      {currentSlotGrade.isExact
                        ? 'Chính xác hoàn toàn 100%'
                        : currentSlotGrade.accuracy === 100
                        ? 'Đúng từ nhưng có từ thừa'
                        : `Đúng: ${currentSlotGrade.accuracy}%`}
                    </span>
                  </div>

                  <div className="sp-diff-box">
                    <AnswerDiff
                      diff={currentSlotGrade.diff}
                      userTokensResult={currentSlotGrade.userTokensResult}
                      variant="exam"
                    />
                  </div>

                  {!currentSlotGrade.isExact && (
                    <div className="sp-target-answer-box">
                      <span className="sp-target-answer-label">✦ Đáp án chuẩn nguyên mẫu:</span>
                      <p className="sp-target-answer-text">{currentSlot.answer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Điều hướng chuyển phần trước / sau */}
            <div className="sp-session-nav-actions">
              <button
                type="button"
                className="sp-btn sp-btn--outline"
                disabled={currentSlotIndex === 0}
                onClick={() => setCurrentSlotIndex(prev => Math.max(0, prev - 1))}
              >
                ← Phần trước
              </button>

              {currentSlotIndex < sessionSlots.length - 1 ? (
                <button
                  type="button"
                  className="sp-btn sp-btn--primary"
                  onClick={() => setCurrentSlotIndex(prev => prev + 1)}
                >
                  Phần tiếp theo →
                </button>
              ) : (
                <button
                  type="button"
                  className="sp-btn sp-btn--primary"
                  onClick={handleSubmitSession}
                >
                  {mode === 'exam' ? 'Nộp bài thi' : 'Tổng kết đợt ôn'}
                </button>
              )}
            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          3. MÀN HÌNH KẾT QUẢ & SỬA BÀI (RESULT VIEW)
         ========================================================================= */}
      {viewState === 'result' && resultData && (
        <div className="sp-result">
          <header className="sp-result-header">
            <div className="sp-score-circle">
              <div className="sp-score-number">{resultData.overallAccuracy}%</div>
              <div className="sp-score-label">Độ chính xác tổng thể</div>
            </div>

            <div className="sp-result-reaction">
              <StickerReaction
                type={
                  resultData.overallAccuracy === 100 && resultData.perfectSlotsCount === resultData.totalSlots
                    ? 'determined'
                    : resultData.overallAccuracy === 0
                    ? 'wake_up'
                    : resultData.overallAccuracy >= 75
                    ? 'cheer'
                    : resultData.overallAccuracy >= 50
                    ? 'thinking'
                    : resultData.overallAccuracy >= 25
                    ? 'shocked'
                    : 'angry'
                }
                text={
                  resultData.overallAccuracy === 100 && resultData.perfectSlotsCount === resultData.totalSlots
                    ? 'Xuất sắc tuyệt đối! Bạn đã thuộc lòng 100% các câu kinh này!'
                    : resultData.overallAccuracy === 0
                    ? 'Tỉnh táo lên! Đừng bỏ trống bài làm chứ!'
                    : resultData.overallAccuracy >= 75
                    ? 'Khá lắm! Cố gắng thêm chút nữa là đạt điểm tối đa!'
                    : resultData.overallAccuracy >= 50
                    ? 'Hơi lú một chút! Hãy xem lại các chỗ gạch đỏ và từ còn thiếu nhé!'
                    : resultData.overallAccuracy >= 25
                    ? 'Còn nhầm lẫn nhiều từ! Cần ôn luyện thêm!'
                    : 'Cần đọc kỹ lại đoạn Kinh Thánh này!'
                }
                size="lg"
                layout="horizontal"
                animate={resultData.overallAccuracy === 100 ? 'bounce' : resultData.overallAccuracy < 50 ? 'shake' : 'pop'}
              />
            </div>

            <h2 className="sp-result-title">
              {resultData.overallAccuracy === 100 && resultData.perfectSlotsCount === resultData.totalSlots
                ? 'Xuất Sắc! Bạn Đã Thuộc Lòng 100%!'
                : `Hoàn Thành Đợt Luyện (${resultData.perfectSlotsCount}/${resultData.totalSlots} phần đạt 100%)`}
            </h2>

            <div className="sp-result-stats-row">
              <span className="sp-stat-pill">Thời gian: {formatTimerSeconds(resultData.elapsedSeconds)}</span>
              <span className="sp-stat-pill">Số phần: {resultData.totalSlots} phần</span>
              <span className="sp-stat-pill">
                {resultData.perfectSlotsCount === resultData.totalSlots ? 'Hoàn hảo tuyệt đối' : 'Có chỗ cần sửa'}
              </span>
            </div>
          </header>

          {/* Thanh tác vụ kết quả */}
          <div className="sp-result-actions">
            {resultData.perfectSlotsCount < resultData.totalSlots && (
              <button
                type="button"
                className="sp-btn sp-btn--primary"
                onClick={handleRetryWrongSlots}
              >
                Làm lại các phần chưa đúng
              </button>
            )}

            <button
              type="button"
              className="sp-btn sp-btn--outline"
              onClick={handleRetryAllSlots}
            >
              Làm lại toàn bộ
            </button>

            <button
              type="button"
              className="sp-btn sp-btn--secondary"
              onClick={() => {
                setViewState('setup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Quay lại trang thiết lập
            </button>
          </div>

          {/* Chi tiết từng phần và sửa lỗi */}
          <section className="sp-result-details">
            <h3 className="sp-result-details__heading">Phân tích chi tiết từng phần</h3>

            <div className="sp-result-cards-list">
              {resultData.slotResults.map((r, rIdx) => {
                const s = r.slot;
                const g = r.grade;

                return (
                  <div
                    key={s.id}
                    className={`sp-result-card ${r.isPerfect ? 'is-perfect' : 'has-errors'}`}
                  >
                    <div className="sp-result-card__top">
                      <div className="sp-result-card__meta">
                        <span className="sp-badge sp-badge--neutral">#{rIdx + 1}</span>
                        <strong className="sp-result-card__label">{s.label}</strong>
                      </div>

                      <span className={`sp-badge ${r.isPerfect ? 'sp-badge--success' : g.accuracy === 100 ? 'sp-badge--warning' : 'sp-badge--danger'}`}>
                        {r.isPerfect
                          ? '✓ Chính xác 100%'
                          : g.accuracy === 100
                          ? 'Có từ thừa (Đúng 100% ý chính)'
                          : `Độ chính xác: ${g.accuracy}%`}
                      </span>
                    </div>

                    <div className="sp-result-card__body">
                      <div className="sp-result-line">
                        <span className="sp-result-line__label">
                          {r.isPerfect
                            ? 'Bài làm của bạn:'
                            : 'Sửa bài trực tiếp (xanh: từ đúng • gạch ngang: từ sai/thừa • (+ cụm từ): phần còn thiếu):'}
                        </span>
                        <div className="sp-diff-box">
                          <AnswerDiff
                            diff={g.diff}
                            userTokensResult={g.userTokensResult}
                            variant="exam"
                          />
                        </div>
                      </div>

                      {!r.isPerfect && (
                        <div className="sp-result-line sp-result-line--target">
                          <span className="sp-result-line__label">✦ Đáp án chuẩn nguyên mẫu (đầy đủ dấu câu):</span>
                          <p className="sp-target-answer-text">{s.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
