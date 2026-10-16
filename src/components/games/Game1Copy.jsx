import React, { useState, useEffect } from 'react';
import { compareAnswer } from '../../core/gradeEngine.js';
import { getNextWordHint } from '../../core/hintEngine.js';
import './Game1Copy.css';

/**
 * Game 1: "Chép lại" (Copy) - Tách riêng từng ô input cho từng ý của câu hỏi
 *
 * @param {object} props
 * @param {object} props.question - Đối tượng câu hỏi đầy đủ ({ id, stageId, question, slots, fullAnswer })
 * @param {object} [props.slot] - Tương thích ngược nếu truyền slot lẻ
 * @param {function} [props.onComplete] - Callback khi hoàn thành đúng toàn bộ các ý
 * @param {function} [props.onNext] - Callback chuyển sang câu tiếp theo
 */
export default function Game1Copy({
  question,
  slot,
  questionText,
  initialInputs,
  onStateChange,
  initialShowReference = true,
  onComplete,
  onNext
}) {
  // Chuẩn hóa dữ liệu: Lấy danh sách các ý (slots)
  const targetQuestion = question || (slot ? {
    id: slot.questionId || 1,
    question: questionText || slot.questionText || '',
    slots: [slot]
  } : null);

  const slots = targetQuestion?.slots && targetQuestion.slots.length > 0
    ? targetQuestion.slots
    : [{ slotIndex: 1, label: '①', title: '', answer: targetQuestion?.fullAnswer || targetQuestion?.answer || '' }];

  // State: lưu giá trị gõ của từng ý { [slotIndex]: text }
  const [inputs, setInputs] = useState(() => initialInputs || {});
  // State: ẩn / hiện đáp án tham khảo (chung & độc lập từng ý)
  const [showReference, setShowReference] = useState(initialShowReference ?? true);
  const [slotRefVisibility, setSlotRefVisibility] = useState({});

  // Kiểm tra riêng từng ý: nếu ý này đã được bấm ẩn/hiện thì dùng giá trị của nó, nếu chưa thì theo showReference chung
  const isSlotRefVisible = (slotIndex) => {
    if (slotRefVisibility[slotIndex] !== undefined) {
      return slotRefVisibility[slotIndex];
    }
    return showReference;
  };

  // Bấm ẩn/hiện ở ý nào thì CHỈ thay đổi đúng ý đó
  const toggleSlotRef = (slotIndex) => {
    setSlotRefVisibility(prev => ({
      ...prev,
      [slotIndex]: !isSlotRefVisible(slotIndex)
    }));
  };

  // State: kết quả chấm điểm từng ý { [slotIndex]: GradeResult }
  const [gradeResults, setGradeResults] = useState({});
  // State: gợi ý từng ý { [slotIndex]: Hint }
  const [hints, setHints] = useState({});
  // State: đánh dấu đã dùng gợi ý ở ý nào
  const [usedHints, setUsedHints] = useState({});
  // Tổng kết sau khi kiểm tra
  const [summary, setSummary] = useState(null);

  // Reset state khi đổi câu hỏi (nếu không có initialInputs lưu trước)
  useEffect(() => {
    setInputs(initialInputs || {});
    setGradeResults({});
    setHints({});
    setUsedHints({});
    setSummary(null);
    setSlotRefVisibility({});
    if (initialShowReference !== undefined) {
      setShowReference(initialShowReference);
    }
  }, [targetQuestion?.id, initialInputs, initialShowReference]);

  const handleInputChange = (slotIndex, value) => {
    setInputs(prev => {
      const next = { ...prev, [slotIndex]: value };
      if (typeof onStateChange === 'function') {
        onStateChange(next);
      }
      return next;
    });
    // Xóa kết quả chấm cũ của ô này khi người dùng gõ lại
    if (gradeResults[slotIndex]) {
      setGradeResults(prev => {
        const next = { ...prev };
        delete next[slotIndex];
        return next;
      });
    }
  };

  // Lấy gợi ý cho một ý cụ thể
  const handleGetHintForSlot = (slotItem) => {
    const currentText = inputs[slotItem.slotIndex] || '';
    const h = getNextWordHint(currentText, slotItem.answer);
    setHints(prev => ({ ...prev, [slotItem.slotIndex]: h }));
    setUsedHints(prev => ({ ...prev, [slotItem.slotIndex]: true }));
  };

  // Điền từ gợi ý vào ô
  const handleInsertHint = (slotItem) => {
    const h = hints[slotItem.slotIndex];
    if (!h?.hintWord) return;
    const currentText = inputs[slotItem.slotIndex] || '';
    const newText = currentText ? `${currentText.trim()} ${h.hintWord}` : h.hintWord;
    handleInputChange(slotItem.slotIndex, newText);
    setHints(prev => ({ ...prev, [slotItem.slotIndex]: null }));
  };

  // Chấm điểm riêng một ý
  const handleCheckSingleSlot = (slotItem) => {
    const text = inputs[slotItem.slotIndex] || '';
    const result = compareAnswer(text, slotItem.answer);
    setGradeResults(prev => ({ ...prev, [slotItem.slotIndex]: result }));
  };

  // Chấm điểm TOÀN BỘ các ý của câu hỏi
  const handleCheckAll = () => {
    const newResults = {};
    let correctCount = 0;
    let totalAccuracy = 0;

    slots.forEach(s => {
      const text = inputs[s.slotIndex] || '';
      const result = compareAnswer(text, s.answer);
      newResults[s.slotIndex] = result;
      if (result.isExact) correctCount++;
      totalAccuracy += result.accuracy;
    });

    setGradeResults(newResults);

    const isAllExact = correctCount === slots.length;
    const avgAccuracy = Math.round(totalAccuracy / slots.length);

    const sumData = {
      isAllExact,
      correctCount,
      totalCount: slots.length,
      avgAccuracy
    };
    setSummary(sumData);

    if (isAllExact && typeof onComplete === 'function') {
      onComplete({
        isExact: true,
        summary: sumData,
        gradeResults: newResults
      });
    }
  };

  if (!targetQuestion) {
    return <div className="game1-container">Không tìm thấy câu hỏi</div>;
  }

  return (
    <div className="game1-container responsive-view">
      {/* 1. Header câu hỏi */}
      <header className="game1-header">
        <div className="game1-badge-row">
          <span className="game1-chapter-badge">CHẶNG {targetQuestion.stageId || 1}</span>
          <span className="game1-question-pill">CÂU HỎI {targetQuestion.id} ({slots.length} Ý CẦN GÕ)</span>
          <button
            type="button"
            className="game1-toggle-reference-btn"
            onClick={() => {
              const nextVal = !showReference;
              setShowReference(nextVal);
              const nextMap = {};
              slots.forEach(s => { nextMap[s.slotIndex] = nextVal; });
              setSlotRefVisibility(nextMap);
            }}
            title={showReference ? "Ẩn đáp án tham khảo của tất cả các ý" : "Hiện đáp án tham khảo của tất cả các ý"}
          >
            {showReference ? '🙈 Ẩn mẫu tất cả' : '👁️ Hiện mẫu tất cả'}
          </button>
        </div>
        <h2 className="game1-question-title">{targetQuestion.question}</h2>
      </header>

      {/* 2. Danh sách các ý cần gõ - Mỗi ý có một ô input riêng */}
      <div className="game1-slots-list">
        {slots.map((s, index) => {
          const sIndex = s.slotIndex;
          const currentVal = inputs[sIndex] || '';
          const result = gradeResults[sIndex];
          const slotHint = hints[sIndex];
          const isThisRefVisible = isSlotRefVisible(sIndex);

          return (
            <div
              key={sIndex}
              className={`game1-slot-card ${result ? (result.isExact ? 'slot-passed' : 'slot-failed') : ''}`}
            >
              {/* Header của từng ý */}
              <div className="slot-card-header">
                <div className="slot-label-group">
                  <span className="slot-tag-pill">{s.label || `Ý ${index + 1}`}</span>
                  <strong className="slot-title-text">{s.title || `Ý số ${index + 1}`}</strong>
                </div>

                {result && (
                  <span className={`slot-status-badge ${result.isExact ? 'badge-exact' : 'badge-wrong'}`}>
                    {result.isExact ? '✓ Chính xác' : `✕ Chưa đúng (${result.accuracy}%)`}
                  </span>
                )}
              </div>

              {/* Mẫu đáp án chuẩn của ý này (Bậc 1: Chép lại) - ẩn/hiện ĐỘC LẬP TỪNG Ý */}
              {isThisRefVisible ? (
                <div className="slot-sample-box">
                  <div className="sample-box-header">
                    <span className="sample-mini-label">Mẫu đáp án chuẩn:</span>
                    <button
                      type="button"
                      className="sample-hide-inline-btn"
                      onClick={() => toggleSlotRef(sIndex)}
                      title="Tạm ẩn đáp án của riêng ý này để tự gõ"
                    >
                      Ẩn mẫu ý này
                    </button>
                  </div>
                  <p className="sample-text-content">{s.answer}</p>
                </div>
              ) : (
                <div
                  className="slot-sample-box sample-hidden-box"
                  onClick={() => toggleSlotRef(sIndex)}
                  title="Bấm vào đây để hiện đáp án của riêng ý này"
                >
                  <span className="sample-hidden-msg">
                    🙈 Đáp án ý này đang ẩn (Chạm vào đây để xem mẫu)
                  </span>
                </div>
              )}

              {/* Ô gõ riêng cho ý này */}
              <div className="slot-input-wrap">
                <textarea
                  className={`slot-textarea ${result ? (result.isExact ? 'border-success' : 'border-error') : ''}`}
                  rows={2}
                  value={currentVal}
                  onChange={e => handleInputChange(sIndex, e.target.value)}
                  placeholder={`Gõ lại chính xác nội dung ý ${s.label || index + 1}...`}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />

                {/* Thanh công cụ phụ trợ cho từng ý */}
                <div className="slot-tools-bar">
                  <button
                    type="button"
                    className="slot-hint-btn"
                    onClick={() => handleGetHintForSlot(s)}
                  >
                    💡 Gợi ý 1 từ
                  </button>

                  <button
                    type="button"
                    className="slot-single-check-btn"
                    onClick={() => handleCheckSingleSlot(s)}
                  >
                    Kiểm tra ý này
                  </button>
                </div>
              </div>

              {/* Hiển thị gợi ý nếu có */}
              {slotHint && (
                <div className="slot-hint-box">
                  <div className="hint-message">
                    💡 Từ tiếp theo: <strong>"{slotHint.hintWord}"</strong> (Còn {slotHint.remainingWordCount} từ)
                  </div>
                  <button
                    type="button"
                    className="hint-fill-btn"
                    onClick={() => handleInsertHint(s)}
                  >
                    Chèn từ này vào ô
                  </button>
                </div>
              )}

              {/* Phân tích kết quả chấm điểm từng ý (Tô đỏ từ sai, tô vàng từ thiếu) */}
              {result && !result.isExact && (
                <div className="slot-diff-box">
                  <div className="diff-section">
                    <span className="diff-label">Từ bạn đã gõ (tô đỏ chỗ sai):</span>
                    <div className="diff-tokens-row">
                      {result.userTokensResult.map((tok, idx) => (
                        <span
                          key={idx}
                          className={`token-chip ${tok.status === 'correct' ? 'token-correct' : 'token-wrong'}`}
                        >
                          {tok.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="diff-section">
                    <span className="diff-label">Từ còn thiếu trong đáp án chuẩn:</span>
                    <div className="diff-tokens-row">
                      {result.targetTokensResult.map((tok, idx) => (
                        <span
                          key={idx}
                          className={`token-chip ${tok.status === 'correct' ? 'token-neutral' : 'token-missing'}`}
                        >
                          {tok.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bảng tổng kết & Nút kiểm tra toàn bộ câu */}
      <footer className="game1-footer">
        {summary && (
          <div className={`game1-summary-bar ${summary.isAllExact ? 'summary-passed' : 'summary-pending'}`}>
            <span className="summary-icon">{summary.isAllExact ? '🎉' : '⚠️'}</span>
            <div className="summary-text">
              <strong>
                {summary.isAllExact
                  ? `Xuất sắc! Bạn đã gõ đúng toàn bộ ${summary.totalCount}/${summary.totalCount} ý!`
                  : `Đã đúng ${summary.correctCount}/${summary.totalCount} ý (Độ chính xác: ${summary.avgAccuracy}%)`}
              </strong>
              <div>{summary.isAllExact ? 'Có thể tiếp tục sang câu tiếp theo.' : 'Hãy xem lại các từ màu đỏ để sửa lại.'}</div>
            </div>
          </div>
        )}

        <div className="game1-main-actions">
          <button
            type="button"
            className="game1-check-all-btn"
            onClick={handleCheckAll}
          >
            ✓ Kiểm tra tất cả các ý
          </button>

          {summary?.isAllExact && onNext && (
            <button
              type="button"
              className="game1-next-btn"
              onClick={onNext}
            >
              Tiếp tục bài tiếp theo →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
