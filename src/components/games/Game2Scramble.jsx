import React, { useState, useEffect } from 'react';
import { generateStep2Arrange, evaluateStep2Arrange } from '../../core/learningStepEngine.js';
import { compareAnswer } from '../../core/gradeEngine.js';
import './Game2Scramble.css';

/**
 * Game 2: "Xáo từ / Xếp cụm" (Phrase Arrange)
 *
 * @param {object} props
 * @param {object} props.slot - Ô câu hỏi { slotIndex, label, title, answer, phrases }
 * @param {string} [props.questionText] - Nội dung câu hỏi lớn
 * @param {function} [props.onComplete] - Callback khi hoàn thành cả 2 bước (xếp + gõ củng cố)
 * @param {function} [props.onNext] - Callback chuyển sang câu tiếp theo
 */
export default function Game2Scramble({
  slot,
  questionText,
  onComplete,
  onNext
}) {
  const targetAnswer = slot?.fullAnswer || slot?.answer || slot?.targetAnswer || '';
  const slotLabel = slot?.id ? `Câu ${slot.id}` : (slot?.label || (slot?.slotIndex ? `Ô ${slot.slotIndex}` : ''));
  const slotTitle = slot?.question || slot?.title || slot?.slotTitle || '';

  // Dữ liệu sắp xếp cụm sinh ra từ slot
  const [exerciseData, setExerciseData] = useState(() => generateStep2Arrange(slot || { answer: '' }));
  const [trayItems, setTrayItems] = useState([]);
  const [poolItems, setPoolItems] = useState([]);
  const [arrangeError, setArrangeError] = useState(null);

  // Giai đoạn: 'arranging' (xếp thẻ) -> 'reinforce' (gõ củng cố)
  const [phase, setPhase] = useState('arranging');
  const [reinforceInput, setReinforceInput] = useState('');
  const [reinforceGrade, setReinforceGrade] = useState(null);

  // Khởi tạo lại bài tập khi slot thay đổi
  useEffect(() => {
    if (slot && (slot.fullAnswer || slot.answer || slot.targetAnswer)) {
      const ex = generateStep2Arrange(slot);
      setExerciseData(ex);
      setTrayItems([]);
      setPoolItems(ex.shuffledItems || []);
      setArrangeError(null);
      setPhase('arranging');
      setReinforceInput('');
      setReinforceGrade(null);
    }
  }, [slot?.slotIndex, targetAnswer]);

  // Click thẻ ở hàng dưới: bay lên khay ghép
  const handleSelectPoolCard = (item) => {
    setPoolItems(prev => prev.filter(c => c.id !== item.id));
    setTrayItems(prev => [...prev, item]);
    setArrangeError(null);
  };

  // Click thẻ trên khay ghép: trả về hàng dưới
  const handleRemoveTrayCard = (item) => {
    setTrayItems(prev => prev.filter(c => c.id !== item.id));
    setPoolItems(prev => [...prev, item]);
    setArrangeError(null);
  };

  // Đặt lại toàn bộ thẻ về hàng dưới
  const handleResetArrangement = () => {
    if (!exerciseData) return;
    setTrayItems([]);
    setPoolItems(exerciseData.shuffledItems || []);
    setArrangeError(null);
  };

  // Xác nhận thứ tự các cụm đã xếp
  const handleConfirmOrder = () => {
    if (!exerciseData) return;
    const selectedIds = trayItems.map(item => item.id);
    const evalResult = evaluateStep2Arrange(selectedIds, exerciseData.correctOrderIds);

    if (evalResult.isCorrect) {
      setArrangeError(null);
      setPhase('reinforce'); // Chuyển sang bước gõ củng cố
    } else {
      setArrangeError('Thứ tự chưa chuẩn xác! Bấm vào thẻ trên khay để tháo ra và thử lại.');
    }
  };

  // Chấm điểm phần gõ củng cố
  const handleCheckReinforce = () => {
    if (!targetAnswer) return;
    const grade = compareAnswer(reinforceInput, targetAnswer);
    setReinforceGrade(grade);

    if (grade.isExact && typeof onComplete === 'function') {
      onComplete({
        isPassed: true,
        arrangeCorrect: true,
        reinforceGrade: grade,
        userInput: reinforceInput
      });
    }
  };

  const totalCount = exerciseData?.totalPhrases || 0;
  const isAllPlaced = trayItems.length === totalCount && totalCount > 0;

  return (
    <div className="game2-container">
      {/* Header thông tin ô */}
      <div className="game2-header">
        <div className="game2-slot-info">
          {slotLabel && <span className="game2-slot-badge">{slotLabel}</span>}
          {slotTitle && <span className="game2-slot-title">{slotTitle}</span>}
        </div>
        {questionText && <p className="game2-instruction">{questionText}</p>}
      </div>

      {/* Giai đoạn 1: Xáo từ / Xếp cụm */}
      {phase === 'arranging' && (
        <div>
          {/* Khay ghép ở trên */}
          <div className="game2-tray-section">
            <div className="game2-tray-label">
              <span>Khay ghép ({trayItems.length}/{totalCount} cụm)</span>
              {trayItems.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  (Bấm thẻ để gỡ bỏ)
                </span>
              )}
            </div>
            <div
              className={`game2-tray-box ${isAllPlaced ? 'is-complete' : ''} ${
                arrangeError ? 'is-error' : ''
              }`}
            >
              {trayItems.length === 0 ? (
                <div className="game2-tray-empty">
                  Bấm các thẻ bên dưới để ghép câu vào đây
                </div>
              ) : (
                trayItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className="game2-card game2-card-tray"
                    onClick={() => handleRemoveTrayCard(item)}
                    title="Bấm để trả về dưới"
                  >
                    <span className="game2-card-index">{idx + 1}</span>
                    {item.text}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Báo lỗi nếu xác nhận sai */}
          {arrangeError && (
            <div className="game2-error-banner">
              <span>{arrangeError}</span>
            </div>
          )}

          {/* Hàng thẻ từ xáo trộn ở dưới */}
          <div className="game2-pool-section">
            <div className="game2-pool-label">Các cụm từ cần sắp xếp:</div>
            <div className="game2-pool-box">
              {poolItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className="game2-card game2-card-pool"
                  onClick={() => handleSelectPoolCard(item)}
                  title="Bấm để đưa lên khay"
                >
                  {item.text}
                </button>
              ))}
              {poolItems.length === 0 && (
                <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                  Đã chọn hết các cụm từ! Hãy bấm "Xác nhận thứ tự".
                </span>
              )}
            </div>
          </div>

          {/* Hàng nút bấm: Xác nhận & Đặt lại */}
          <div className="game2-actions">
            <button
              type="button"
              className="game2-btn game2-btn-confirm"
              onClick={handleConfirmOrder}
              disabled={!isAllPlaced}
            >
              Xác nhận thứ tự
            </button>

            <button
              type="button"
              className="game2-btn game2-btn-reset"
              onClick={handleResetArrangement}
              disabled={trayItems.length === 0}
            >
              Đặt lại
            </button>
          </div>
        </div>
      )}

      {/* Giai đoạn 2: Ô nhập củng cố để gõ nhẩm lại cả câu mà không nhìn */}
      {phase === 'reinforce' && (
        <div className="game2-reinforce-card">
          <div className="game2-reinforce-header">
            <span className="game2-reinforce-badge">Đã xếp cụm chính xác!</span>
            <h4 className="game2-reinforce-title">Bước gõ củng cố trí nhớ</h4>
            <p className="game2-reinforce-subtitle">
              Không nhìn lại đáp án, hãy gõ nhẩm lại cả câu bạn vừa ghép vào ô dưới đây:
            </p>
          </div>

          <textarea
            className="game2-reinforce-textarea"
            value={reinforceInput}
            onChange={e => setReinforceInput(e.target.value)}
            placeholder="Gõ nhẩm lại đầy đủ câu vào đây..."
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            autoComplete="off"
            rows={3}
          />

          <div className="game2-reinforce-actions">
            <button
              type="button"
              className="game2-btn game2-btn-grade-reinforce"
              onClick={handleCheckReinforce}
            >
              Kiểm tra câu gõ
            </button>
          </div>

          {/* Kết quả kiểm tra câu gõ củng cố */}
          {reinforceGrade && (
            <div
              className={`game2-reinforce-result ${
                reinforceGrade.isExact ? 'correct' : 'wrong'
              }`}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {reinforceGrade.isExact
                  ? 'Tuyệt vời! Bạn đã thuộc chính xác 100%!'
                  : `Độ chính xác: ${reinforceGrade.accuracy}% - Còn từ chưa đúng`}
              </div>

              {/* Hiển thị từ đúng / từ sai */}
              <div className="game2-tokens-wrap">
                {reinforceGrade.userTokensResult.map((tok, idx) => (
                  <span
                    key={idx}
                    className={`game2-token ${
                      tok.status === 'correct' ? 'correct' : 'wrong'
                    }`}
                  >
                    {tok.text}
                  </span>
                ))}
              </div>

              {reinforceGrade.isExact && typeof onNext === 'function' && (
                <button
                  type="button"
                  className="game2-btn game2-btn-next-step"
                  onClick={onNext}
                >
                  Tiếp tục
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
