import React, { useState, useEffect, useRef } from 'react';
import { compareAnswer } from '../../core/gradeEngine.js';
import { getNextWordHint } from '../../core/hintEngine.js';
import './Game1Copy.css';

/**
 * Game 1: "Chép lại" (Copy)
 *
 * @param {object} props
 * @param {object} props.slot - Ô câu hỏi { slotIndex, label, title, answer, phrases }
 * @param {string} [props.questionText] - Nội dung câu hỏi lớn
 * @param {function} [props.onComplete] - Callback khi hoàn thành đúng hoặc nộp ({ isExact, gradeResult, usedHint, userInput })
 * @param {function} [props.onNext] - Callback chuyển sang bài tiếp theo
 * @param {function} [props.onHintUsed] - Callback khi người dùng bấm lấy gợi ý
 */
export default function Game1Copy({
  slot,
  questionText,
  onComplete,
  onNext,
  onHintUsed
}) {
  const targetAnswer = slot?.fullAnswer || slot?.answer || slot?.targetAnswer || '';
  const slotLabel = slot?.id ? `Câu ${slot.id}` : (slot?.label || (slot?.slotIndex ? `Ô ${slot.slotIndex}` : ''));
  const slotTitle = slot?.question || slot?.title || slot?.slotTitle || '';

  const [userInput, setUserInput] = useState('');
  const [gradeResult, setGradeResult] = useState(null);
  const [hint, setHint] = useState(null);
  const [usedHint, setUsedHint] = useState(false);
  const textareaRef = useRef(null);

  // Reset state khi đổi slot
  useEffect(() => {
    setUserInput('');
    setGradeResult(null);
    setHint(null);
    setUsedHint(false);
  }, [slot?.slotIndex, targetAnswer]);

  // Xử lý kiểm tra bài làm
  const handleCheck = () => {
    if (!targetAnswer) return;
    const result = compareAnswer(userInput, targetAnswer);
    setGradeResult(result);

    if (result.isExact && typeof onComplete === 'function') {
      onComplete({
        isExact: true,
        gradeResult: result,
        usedHint,
        userInput
      });
    }
  };

  // Xử lý lấy gợi ý 1 từ
  const handleGetHint = () => {
    if (!targetAnswer) return;
    const h = getNextWordHint(userInput, targetAnswer);
    setHint(h);
    setUsedHint(true);
    if (typeof onHintUsed === 'function') {
      onHintUsed();
    }
  };

  // Thêm từ gợi ý vào ô nhập nếu người dùng muốn
  const handleInsertHint = () => {
    if (!hint?.hintWord) return;
    const trimmed = userInput.trim();
    const updated = trimmed ? `${trimmed} ${hint.hintWord}` : hint.hintWord;
    setUserInput(updated);
    setHint(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Đếm số từ thiếu từ targetTokensResult nếu đã chấm
  const missingCount = gradeResult
    ? gradeResult.targetTokensResult.filter(t => t.status === 'missing').length
    : 0;

  return (
    <div className="game1-container">
      {/* Tiêu đề & Thông tin ô */}
      <div className="game1-header">
        <div className="game1-slot-info">
          {slotLabel && <span className="game1-slot-badge">{slotLabel}</span>}
          {slotTitle && <span className="game1-slot-title">{slotTitle}</span>}
        </div>
        {questionText && <p className="game1-guide">{questionText}</p>}
      </div>

      {/* Khung mẫu hiển thị đáp án chuẩn ở trên - Kiểu chữ to, rõ ràng */}
      <div
        className={`game1-model-card ${
          gradeResult
            ? gradeResult.isExact
              ? 'all-correct'
              : missingCount > 0
              ? 'has-missing'
              : ''
            : ''
        }`}
      >
        <div className="game1-model-label">Đáp án mẫu (Chép lại chính xác):</div>
        <div className="game1-model-text">
          {gradeResult ? (
            <div className="game1-tokens-wrap">
              {gradeResult.targetTokensResult.map((tok, idx) => (
                <span
                  key={idx}
                  className={`game1-target-token ${
                    tok.status === 'missing' ? 'missing' : 'correct'
                  }`}
                  title={tok.status === 'missing' ? 'Từ còn thiếu trong bài làm' : 'Từ đã gõ đúng'}
                >
                  {tok.text}
                </span>
              ))}
            </div>
          ) : (
            <span>{targetAnswer}</span>
          )}
        </div>
      </div>

      {/* Ô nhập câu trả lời - Mobile-first (360-430px), hỗ trợ Telex/VNI */}
      <div className="game1-input-card">
        <label htmlFor="game1-input" className="game1-input-label">
          Ô nhập câu trả lời:
        </label>
        <textarea
          ref={textareaRef}
          id="game1-input"
          className="game1-textarea"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Nhập lại chính xác câu trên..."
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          autoComplete="off"
          rows={3}
        />
      </div>

      {/* Hàng nút bấm */}
      <div className="game1-actions">
        <button
          type="button"
          className="game1-btn game1-btn-primary"
          onClick={handleCheck}
        >
          Kiểm tra
        </button>

        <button
          type="button"
          className="game1-btn game1-btn-hint"
          onClick={handleGetHint}
        >
          Gợi ý 1 từ
        </button>
      </div>

      {/* Hộp gợi ý từ tiếp theo */}
      {hint && (
        <div className="game1-hint-box">
          <div>
            {hint.hintWord ? (
              <>
                Từ tiếp theo: <span className="game1-hint-badge">{hint.hintWord}</span>
                {hint.remainingWordCount > 0 && (
                  <span style={{ marginLeft: 6, fontSize: '0.8rem' }}>
                    (còn {hint.remainingWordCount} từ)
                  </span>
                )}
              </>
            ) : (
              <span>Bạn đã gõ đủ các từ!</span>
            )}
          </div>
          {hint.hintWord && (
            <button
              type="button"
              className="game1-btn-insert"
              onClick={handleInsertHint}
            >
              Chèn từ
            </button>
          )}
        </div>
      )}

      {/* Hiển thị kết quả kiểm tra tức thì */}
      {gradeResult && (
        <div className={`game1-result-box ${gradeResult.isExact ? 'correct' : 'wrong'}`}>
          <div className="game1-result-status">
            <span
              className={`game1-status-badge ${
                gradeResult.isExact ? 'correct' : 'wrong'
              }`}
            >
              {gradeResult.isExact ? 'Chính xác 100%!' : 'Chưa đúng hoàn toàn'}
            </span>
            <span className="game1-accuracy-badge">
              Độ chính xác: {gradeResult.accuracy}%
            </span>
          </div>

          {/* Phân tích bài làm: từ sai tô đỏ nền nhạt (#f8d7da), từ đúng màu xanh lá */}
          <div>
            <div className="game1-analysis-label">Bài làm của bạn:</div>
            <div className="game1-user-tokens">
              {gradeResult.userTokensResult.length > 0 ? (
                gradeResult.userTokensResult.map((tok, idx) => (
                  <span
                    key={idx}
                    className={`game1-user-token ${
                      tok.status === 'correct' ? 'correct' : 'wrong'
                    }`}
                  >
                    {tok.text}
                  </span>
                ))
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  (Chưa nhập từ nào)
                </span>
              )}
            </div>
          </div>

          {/* Nhắc nhở nếu còn thiếu từ */}
          {!gradeResult.isExact && missingCount > 0 && (
            <div className="game1-missing-notice">
              Bạn còn thiếu {missingCount} từ. Hãy chú ý các từ màu vàng ở đáp án mẫu phía trên.
            </div>
          )}

          {/* Nút Tiếp tục nếu đã đúng hoàn toàn */}
          {gradeResult.isExact && typeof onNext === 'function' && (
            <button
              type="button"
              className="game1-btn game1-btn-next"
              onClick={onNext}
            >
              Tiếp tục sang bước tiếp theo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
