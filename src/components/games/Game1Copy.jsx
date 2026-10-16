import React, { useState, useEffect } from 'react';
import { compareAnswer } from '../../core/gradeEngine.js';
import { getNextWordHint } from '../../core/hintEngine.js';
import StickerReaction, { formatWithUserName } from '../common/StickerReaction.jsx';
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
  onToggleReference,
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

  // Reset state CHỈ KHI ĐỔI CÂU HỎI (targetQuestion.id thay đổi).
  // Tuyệt đối không đưa initialInputs vào dependency vì khi gõ, initialInputs thay đổi liên tục sẽ làm reset ẩn/hiện đáp án!
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetQuestion?.id]);

  // Đồng bộ khi prop initialShowReference từ component cha thay đổi
  useEffect(() => {
    if (initialShowReference !== undefined) {
      setShowReference(initialShowReference);
      const nextMap = {};
      slots.forEach(s => { nextMap[s.slotIndex] = initialShowReference; });
      setSlotRefVisibility(nextMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialShowReference]);

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
              if (typeof onToggleReference === 'function') {
                onToggleReference(nextVal);
              }
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
                  <div className="slot-result-badge-wrap">
                    <StickerReaction
                      type={
                        !currentVal.trim()
                          ? 'wake_up'
                          : result.isExact
                          ? 'determined'
                          : result.accuracy < 40
                          ? 'angry'
                          : 'shocked'
                      }
                      text={
                        !currentVal.trim()
                          ? 'Tỉnh táo lên! Cố lên nào, đừng bỏ trống chứ!'
                          : result.isExact
                          ? 'Đúng 100%!'
                          : `Sai rồi (${result.accuracy}%)`
                      }
                      size="sm"
                      layout="badge"
                      animate={result.isExact ? 'bounce' : 'shake'}
                    />
                    <span className={`slot-status-badge ${result.isExact ? 'badge-exact' : 'badge-wrong'}`}>
                      {!currentVal.trim()
                        ? '✕ Bỏ trống'
                        : result.isExact
                        ? '✓ Chính xác'
                        : `✕ Chưa đúng (${result.accuracy}%)`}
                    </span>
                  </div>
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
                  <StickerReaction
                    type="thinking"
                    text={`Gãi đầu tìm từ: "${slotHint.hintWord}"`}
                    size="sm"
                    layout="badge"
                    animate="wiggle"
                  />
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

              {/* Phân tích kết quả chấm điểm từng ý: từ đúng xanh lá, từ dư gạch đi, thế vào từ đúng màu vàng */}
              {result && !result.isExact && (
                <div className="slot-diff-box">
                  <div className="slot-diff-reaction-row">
                    <StickerReaction
                      type={!currentVal.trim() ? 'wake_up' : result.accuracy < 40 ? 'angry' : 'shocked'}
                      text={
                        !currentVal.trim()
                          ? 'Tỉnh táo lên! Cố lên nào, đừng bỏ trống chứ!'
                          : result.accuracy < 40
                          ? 'Quạu ghê! Xem lại các từ gạch đỏ nhé!'
                          : 'Ối làng nước ơi sai mất rồi!!'
                      }
                      size="sm"
                      layout="badge"
                      animate="shake"
                    />
                  </div>

                  <div className="diff-section">
                    <span className="diff-label">Sửa bài trực tiếp (xanh: từ đúng • gạch ngang: từ dư • vàng: từ đúng thay thế):</span>
                    <div className="diff-tokens-row">
                      {result.diff && result.diff.length > 0 ? (
                        result.diff.map((item, idx) => {
                          if (item.type === 'correct') {
                            return (
                              <span key={idx} className="token-chip token-correct" title="Từ đúng">
                                {item.text}
                              </span>
                            );
                          }
                          if (item.type === 'wrong') {
                            return (
                              <span key={idx} className="token-chip token-wrong" title="Từ dư / sai (gạch bỏ)">
                                {item.text}
                              </span>
                            );
                          }
                          return (
                            <span key={idx} className="token-chip token-missing" title="Thế vào từ đúng">
                              {item.text}
                            </span>
                          );
                        })
                      ) : (
                        <span className="empty-text">(Chưa nhập câu trả lời)</span>
                      )}
                    </div>
                  </div>

                  {/* Hiện đáp án ở dưới bản full nguyên mẫu có đầy đủ dấu câu , . () → */}
                  <div className="diff-full-answer-box">
                    <span className="diff-full-answer-label">✦ Đáp án chuẩn nguyên mẫu:</span>
                    <p className="diff-full-answer-text">{s?.answer || s?.fullAnswer || ''}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bảng tổng kết & Nút kiểm tra toàn bộ câu */}
      <footer className="game1-footer">
        {summary && (() => {
          const isAllBlank = slots.every(s => !(inputs[s.slotIndex] || '').trim());
          const mascotType = summary.isAllExact
            ? 'determined'
            : isAllBlank
            ? 'wake_up'
            : 'shocked';
          const quoteText = summary.isAllExact
            ? 'Đỉnh nóc kịch trần! Đúng 100%!'
            : isAllBlank
            ? 'Tỉnh táo lên! Cố lên nào, đừng bỏ trống chứ!'
            : 'Ối giời ơi! Có từ chưa đúng, hãy sửa lại nhé!';

          return (
            <div className={`game1-summary-bar ${summary.isAllExact ? 'summary-passed' : 'summary-pending'}`}>
              <div className="summary-mascot-col">
                <img
                  src={`/stickers/${mascotType}.png`}
                  alt="Mascot reaction"
                  className="summary-mascot-img"
                  draggable="false"
                />
              </div>
              <div className="summary-text-col">
                <div className="summary-quote-bubble">
                  "{formatWithUserName(quoteText)}"
                </div>
                <strong className="summary-headline">
                  {summary.isAllExact
                    ? `Xuất sắc! Bạn đã gõ đúng toàn bộ ${summary.totalCount}/${summary.totalCount} ý!`
                    : `Đã đúng ${summary.correctCount}/${summary.totalCount} ý (Độ chính xác: ${summary.avgAccuracy}%)`}
                </strong>
                <div className="summary-subline">
                  {summary.isAllExact ? 'Có thể tiếp tục sang câu tiếp theo.' : 'Hãy xem lại các từ màu đỏ để sửa lại.'}
                </div>
              </div>
            </div>
          );
        })()}

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
