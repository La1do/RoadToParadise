import React from 'react';
import './GameResultModal.css';

/**
 * GameResultModal - Màn kết quả sau khi hoàn thành một lượt học hoặc thi
 *
 * @param {object} props
 * @param {boolean} [props.isOpen=true] - Trạng thái hiển thị modal
 * @param {string} [props.title] - Tiêu đề modal (VD: "Kết quả học tập", "Kết quả thi")
 * @param {string} [props.subtitle] - Phụ đề
 * @param {object} [props.gradeResult] - Kết quả chấm điểm 1 câu từ compareAnswer
 * @param {object} [props.examSummary] - Kết quả tổng kết phiên thi từ summarizeExam
 * @param {object} [props.result] - Đối tượng kết quả chung (gradeResult hoặc examSummary)
 * @param {number} [props.accuracy] - Phần trăm chính xác ghi đè
 * @param {number} [props.correctCount] - Số từ/ô đúng
 * @param {number} [props.wrongCount] - Số từ/ô sai
 * @param {number} [props.missingCount] - Số từ thiếu
 * @param {string[]} [props.wrongWords] - Danh sách từ sai tùy chỉnh
 * @param {Array} [props.wrongSlots] - Danh sách các ô làm sai
 * @param {string} [props.continueLabel="Tiếp tục"] - Nhãn nút tiếp tục ("Tiếp tục" / "Sang ô tiếp theo" / "Trở về bản đồ")
 * @param {function} [props.onContinue] - Callback khi bấm "Tiếp tục"
 * @param {function} [props.onReviewWrong] - Callback khi bấm "Ôn lại các ô sai"
 * @param {function} [props.onClose] - Callback khi đóng modal
 */
export default function GameResultModal({
  isOpen = true,
  title,
  subtitle,
  gradeResult,
  examSummary,
  result,
  accuracy: overrideAccuracy,
  correctCount: overrideCorrect,
  wrongCount: overrideWrong,
  missingCount: overrideMissing,
  wrongWords: overrideWrongWords,
  wrongSlots: overrideWrongSlots,
  continueLabel = 'Tiếp tục',
  onContinue,
  onReviewWrong,
  onClose
}) {
  if (!isOpen) return null;

  const data = examSummary || gradeResult || result || {};
  const isExamMode = Boolean(examSummary || (data.totalSlots !== undefined));

  // Tính toán độ chính xác
  let calculatedAccuracy = 0;
  if (overrideAccuracy !== undefined) {
    calculatedAccuracy = overrideAccuracy;
  } else if (isExamMode) {
    calculatedAccuracy = data.averageAccuracy ?? 0;
  } else {
    calculatedAccuracy = data.accuracy ?? 0;
  }

  // Tính số lượng đúng / sai / thiếu
  let correct = 0;
  let wrong = 0;
  let missing = 0;
  let extractedWrongWords = [];
  let calculatedWrongSlots = overrideWrongSlots || data.wrongSlots || [];

  if (isExamMode) {
    correct = overrideCorrect ?? (data.correctCount ?? 0);
    wrong = overrideWrong ?? (data.wrongCount ?? 0);
    missing = overrideMissing ?? 0;

    // Trích xuất các từ sai từ danh sách ô sai trong phiên thi
    if (calculatedWrongSlots.length > 0) {
      for (const item of calculatedWrongSlots) {
        const tokens = item.submission?.gradeResult?.userTokensResult || [];
        for (const t of tokens) {
          if (t.status === 'wrong') {
            extractedWrongWords.push(t.text);
          }
        }
      }
    }
  } else {
    // Chế độ 1 câu / ô học
    correct = overrideCorrect ?? (data.matchedCount ?? 0);
    const userTokens = data.userTokensResult || [];
    const wrongTokens = userTokens.filter(t => t.status === 'wrong');
    wrong = overrideWrong ?? wrongTokens.length;

    const targetTokens = data.targetTokensResult || [];
    const missingTokens = targetTokens.filter(t => t.status === 'missing');
    missing = overrideMissing ?? missingTokens.length;

    extractedWrongWords = wrongTokens.map(t => t.text);
  }

  // Danh sách từ sai (loại bỏ trùng lặp)
  const displayWrongWords = Array.from(
    new Set(overrideWrongWords || extractedWrongWords || [])
  );

  const isPerfect = calculatedAccuracy === 100 && wrong === 0 && missing === 0;
  const hasMistakes = wrong > 0 || missing > 0 || displayWrongWords.length > 0 || calculatedWrongSlots.length > 0;

  // Xác định class màu cho điểm số
  let accuracyColorClass = 'high';
  if (calculatedAccuracy < 60) {
    accuracyColorClass = 'low';
  } else if (calculatedAccuracy < 85) {
    accuracyColorClass = 'medium';
  }

  const defaultTitle = isPerfect
    ? 'Hoàn thành xuất sắc!'
    : isExamMode
    ? 'Kết quả bài thi'
    : 'Kết quả lượt học';

  const defaultSubtitle = isPerfect
    ? 'Bạn đã nhớ và làm đúng 100% không một lỗi sai.'
    : hasMistakes
    ? 'Hãy kiểm tra các từ sai bên dưới để ôn tập củng cố lại.'
    : 'Bạn đã hoàn thành phiên học.';

  return (
    <div className="result-modal-overlay" role="dialog" aria-modal="true">
      <div className="result-modal-dialog">
        {/* Header */}
        <div className="result-modal-header">
          <div className={`result-modal-badge ${isPerfect ? 'success' : 'needs-work'}`}>
            {isPerfect ? '✓' : '!'}
          </div>
          <h3 className="result-modal-title">{title || defaultTitle}</h3>
          <p className="result-modal-subtitle">{subtitle || defaultSubtitle}</p>
        </div>

        {/* Điểm phần trăm độ chính xác */}
        <div className="result-score-card">
          <div className={`result-accuracy-value ${accuracyColorClass}`}>
            {calculatedAccuracy}%
          </div>
          <div className="result-accuracy-label">Độ chính xác</div>
        </div>

        {/* Thống kê: Đúng / Sai / Thiếu */}
        <div className="result-stats-grid">
          <div className="result-stat-box stat-correct">
            <div className="result-stat-count">{correct}</div>
            <div className="result-stat-name">{isExamMode ? 'Ô đúng' : 'Từ đúng'}</div>
          </div>

          <div className="result-stat-box stat-wrong">
            <div className="result-stat-count">{wrong}</div>
            <div className="result-stat-name">{isExamMode ? 'Ô sai' : 'Từ sai'}</div>
          </div>

          <div className="result-stat-box stat-missing">
            <div className="result-stat-count">{missing}</div>
            <div className="result-stat-name">{isExamMode ? 'Chưa nộp' : 'Từ thiếu'}</div>
          </div>
        </div>

        {/* Danh sách từ sai được tô đỏ nổi bật */}
        {displayWrongWords.length > 0 && (
          <div className="result-wrong-section">
            <div className="result-wrong-header">
              <span>Các từ làm sai cần chú ý:</span>
            </div>
            <div className="result-wrong-tokens">
              {displayWrongWords.map((word, idx) => (
                <span key={idx} className="result-wrong-token">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách các ô làm sai (nếu thi nhiều ô) */}
        {calculatedWrongSlots.length > 0 && (
          <div className="result-wrong-slots">
            <div className="result-wrong-slots-title">
              Các ô chưa đạt ({calculatedWrongSlots.length} ô):
            </div>
            {calculatedWrongSlots.map((item, idx) => (
              <div key={idx} className="result-wrong-slot-item">
                <strong>{item.slot?.label || `Ô ${idx + 1}`}:</strong>{' '}
                {item.slot?.slotTitle || item.slot?.targetAnswer || 'Chưa hoàn thành'}
              </div>
            ))}
          </div>
        )}

        {/* Nút bấm hành động */}
        <div className="result-modal-actions">
          {/* Nút "Ôn lại các ô sai" (nếu có lỗi sai) */}
          {hasMistakes && typeof onReviewWrong === 'function' && (
            <button
              type="button"
              className="result-btn result-btn-review"
              onClick={onReviewWrong}
            >
              Ôn lại các ô sai
            </button>
          )}

          {/* Nút "Tiếp tục" (sang ô tiếp theo hoặc trở về bản đồ) */}
          <button
            type="button"
            className="result-btn result-btn-continue"
            onClick={onContinue || onClose}
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
