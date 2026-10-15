import React, { useState, useEffect, useRef } from 'react';
import { generateStep2Arrange, evaluateStep2Arrange } from '../../core/learningStepEngine.js';
import { compareAnswer } from '../../core/gradeEngine.js';
import './Game2Scramble.css';

/**
 * Game 2: "Xáo từ / Xếp cụm" (Phrase Arrange) — kéo thả (drag & drop)
 *
 * Mỗi ý của câu hỏi là một card riêng (giống Game 1 "Chép lại"):
 * - Khay ghép phía trên: thả thẻ vào đây để ghép câu đúng thứ tự.
 * - Hàng thẻ xáo trộn phía dưới: kéo thẻ lên khay (hoặc bấm để đưa lên).
 * - Thẻ trên khay kéo được để đổi chỗ; bấm thẻ trên khay để trả về hàng dưới.
 * Xếp đúng ý nào thì ý đó mở bước gõ củng cố trí nhớ.
 *
 * @param {object} props
 * @param {object} [props.question] - Câu hỏi đầy đủ ({ id, stageId, question, slots })
 * @param {object} [props.slot] - Tương thích ngược: truyền 1 slot lẻ
 * @param {string} [props.questionText] - Nội dung câu hỏi lớn (khi truyền slot lẻ)
 * @param {function} [props.onComplete] - Callback khi hoàn thành đúng toàn bộ các ý
 * @param {function} [props.onNext] - Callback chuyển sang câu tiếp theo
 */
export default function Game2Scramble({
  question,
  slot,
  questionText,
  onComplete,
  onNext
}) {
  // Chuẩn hóa dữ liệu: danh sách các ý (slots)
  const targetQuestion = question || (slot ? {
    id: slot.questionId || 1,
    stageId: slot.stageId || 1,
    question: questionText || slot.questionText || '',
    slots: [slot]
  } : null);

  const slots = targetQuestion?.slots && targetQuestion.slots.length > 0
    ? targetQuestion.slots
    : [{
        slotIndex: 1,
        label: '①',
        title: '',
        answer: targetQuestion?.fullAnswer || targetQuestion?.answer || ''
      }];

  // State từng ý, keyed theo slotIndex:
  // { exerciseData, trayItems, poolItems, arrangeError, phase, reinforceInput, reinforceGrade }
  const [slotStates, setSlotStates] = useState({});
  const [summary, setSummary] = useState(null);

  // Thẻ đang được kéo: { slotIndex, item, source: 'pool' | 'tray' }
  const dragRef = useRef(null);
  const [dragInfo, setDragInfo] = useState(null);
  // Vị trí thả đang hover: { slotIndex, zone: 'tray' | 'pool', insertIndex }
  const [dropTarget, setDropTarget] = useState(null);

  // Khởi tạo / reset khi đổi câu hỏi
  useEffect(() => {
    const next = {};
    slots.forEach(s => {
      const ex = generateStep2Arrange({
        ...s,
        answer: s.fullAnswer || s.answer || s.targetAnswer || ''
      });
      next[s.slotIndex] = {
        exerciseData: ex,
        trayItems: [],
        poolItems: ex.shuffledItems || [],
        arrangeError: null,
        phase: 'arranging',
        reinforceInput: '',
        reinforceGrade: null
      };
    });
    setSlotStates(next);
    setSummary(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetQuestion?.id]);

  const updateSlot = (slotIndex, updater) => {
    setSlotStates(prev => {
      const cur = prev[slotIndex];
      if (!cur) return prev;
      return { ...prev, [slotIndex]: updater(cur) };
    });
  };

  // --- Kéo thả ---
  const startDrag = (slotIndex, item, source) => {
    dragRef.current = { slotIndex, item, source };
    setDragInfo({ slotIndex, itemId: item.id, source });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragInfo(null);
    setDropTarget(null);
  };

  // Thả thẻ vào khay ghép của một ý, chèn tại insertIndex
  const dropOnTray = (slotIndex, insertIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex) return;
    updateSlot(slotIndex, cur => {
      if (cur.phase !== 'arranging') return cur;
      if (drag.source === 'pool') {
        const nextPool = cur.poolItems.filter(c => c.id !== drag.item.id);
        const nextTray = [...cur.trayItems];
        const idx = Math.max(0, Math.min(insertIndex, nextTray.length));
        nextTray.splice(idx, 0, drag.item);
        return { ...cur, poolItems: nextPool, trayItems: nextTray, arrangeError: null };
      }
      // Kéo đổi chỗ trong khay
      const fromIdx = cur.trayItems.findIndex(c => c.id === drag.item.id);
      if (fromIdx === -1) return cur;
      const nextTray = cur.trayItems.filter(c => c.id !== drag.item.id);
      let idx = Math.max(0, Math.min(insertIndex, nextTray.length + 1));
      if (fromIdx < insertIndex) idx = Math.max(0, idx - 1);
      nextTray.splice(idx, 0, drag.item);
      return { ...cur, trayItems: nextTray, arrangeError: null };
    });
    endDrag();
  };

  // Thả thẻ từ khay trả về hàng xáo trộn
  const dropOnPool = (slotIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex || drag.source !== 'tray') return;
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== drag.item.id),
      poolItems: [...cur.poolItems, drag.item],
      arrangeError: null
    }));
    endDrag();
  };

  // Bấm thẻ ở hàng dưới: bay lên cuối khay
  const handleSelectPoolCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      poolItems: cur.poolItems.filter(c => c.id !== item.id),
      trayItems: [...cur.trayItems, item],
      arrangeError: null
    }));
  };

  // Bấm thẻ trên khay: trả về hàng dưới
  const handleRemoveTrayCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== item.id),
      poolItems: [...cur.poolItems, item],
      arrangeError: null
    }));
  };

  // Đặt lại toàn bộ thẻ về hàng dưới
  const handleResetArrangement = (slotIndex) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: [],
      poolItems: cur.exerciseData?.shuffledItems || [],
      arrangeError: null
    }));
  };

  // Xác nhận thứ tự các cụm đã xếp của một ý
  const handleConfirmOrder = (slotIndex) => {
    updateSlot(slotIndex, cur => {
      const selectedIds = cur.trayItems.map(item => item.id);
      const evalResult = evaluateStep2Arrange(selectedIds, cur.exerciseData.correctOrderIds);
      if (evalResult.isCorrect) {
        return { ...cur, arrangeError: null, phase: 'reinforce' };
      }
      return {
        ...cur,
        arrangeError: 'Thứ tự chưa chuẩn xác! Kéo thẻ đổi chỗ hoặc bấm thẻ trên khay để tháo ra rồi thử lại.'
      };
    });
  };

  // Chấm điểm phần gõ củng cố của một ý
  const handleCheckReinforce = (slotItem) => {
    const targetAnswer = slotItem.fullAnswer || slotItem.answer || slotItem.targetAnswer || '';
    updateSlot(slotItem.slotIndex, cur => {
      const grade = compareAnswer(cur.reinforceInput, targetAnswer);
      return { ...cur, reinforceGrade: grade };
    });
  };

  // Kiểm tra toàn bộ các ý
  const handleCheckAll = () => {
    let correctCount = 0;
    let totalAccuracy = 0;
    const newStates = { ...slotStates };

    slots.forEach(s => {
      const cur = newStates[s.slotIndex];
      if (!cur) return;
      const targetAnswer = s.fullAnswer || s.answer || s.targetAnswer || '';
      const grade = compareAnswer(cur.reinforceInput, targetAnswer);
      newStates[s.slotIndex] = { ...cur, reinforceGrade: grade };
      if (grade.isExact) correctCount++;
      totalAccuracy += grade.accuracy;
    });

    setSlotStates(newStates);

    const isAllExact = correctCount === slots.length;
    const sumData = {
      isAllExact,
      correctCount,
      totalCount: slots.length,
      avgAccuracy: Math.round(totalAccuracy / slots.length)
    };
    setSummary(sumData);

    if (isAllExact && typeof onComplete === 'function') {
      onComplete({
        isPassed: true,
        isExact: true,
        summary: sumData,
        reinforceGrade: { isExact: true, accuracy: sumData.avgAccuracy }
      });
    }
  };

  if (!targetQuestion) {
    return <div className="game2-container">Không tìm thấy câu hỏi</div>;
  }

  return (
    <div className="game2-container responsive-view">
      {/* 1. Header câu hỏi */}
      <header className="game2-header">
        <div className="game2-badge-row">
          <span className="game2-chapter-badge">CHẶNG {targetQuestion.stageId || 1}</span>
          <span className="game2-question-pill">CÂU HỎI {targetQuestion.id} ({slots.length} Ý CẦN GHÉP)</span>
        </div>
        <h2 className="game2-question-title">{targetQuestion.question}</h2>
      </header>

      {/* 2. Danh sách các ý — mỗi ý một card kéo thả riêng */}
      <div className="game2-slots-list">
        {slots.map((s, index) => {
          const sIndex = s.slotIndex;
          const st = slotStates[sIndex];
          if (!st) return null;

          const totalCount = st.exerciseData?.totalPhrases || 0;
          const isAllPlaced = st.trayItems.length === totalCount && totalCount > 0;
          const isDraggingHere = dragInfo?.slotIndex === sIndex;
          const trayDropActive = dropTarget?.slotIndex === sIndex && dropTarget.zone === 'tray';
          const passed = st.reinforceGrade?.isExact;

          return (
            <div
              key={sIndex}
              className={`game2-slot-card ${passed ? 'slot-passed' : ''} ${
                st.reinforceGrade && !passed ? 'slot-failed' : ''
              }`}
            >
              {/* Header của từng ý */}
              <div className="slot-card-header">
                <div className="slot-label-group">
                  <span className="slot-tag-pill">{s.label || `Ý ${index + 1}`}</span>
                  <strong className="slot-title-text">{s.title || `Ý số ${index + 1}`}</strong>
                </div>
                {st.phase === 'reinforce' && (
                  <span className={`slot-status-badge ${passed ? 'badge-exact' : 'badge-arranged'}`}>
                    {passed ? '✓ Chính xác' : '✓ Đã ghép đúng'}
                  </span>
                )}
              </div>

              {/* Giai đoạn 1: Kéo thả xáo từ */}
              {st.phase === 'arranging' && (
                <div>
                  {/* Khay ghép */}
                  <div className="game2-tray-section">
                    <div className="game2-tray-label">
                      <span>Khay ghép ({st.trayItems.length}/{totalCount} cụm)</span>
                      <span className="game2-tray-hint">Kéo thả để xếp • Bấm thẻ để gỡ</span>
                    </div>
                    <div
                      className={`game2-tray-box ${isAllPlaced ? 'is-complete' : ''} ${
                        st.arrangeError ? 'is-error' : ''
                      } ${trayDropActive ? 'is-drag-over' : ''}`}
                      onDragOver={e => {
                        if (dragRef.current?.slotIndex !== sIndex) return;
                        e.preventDefault();
                        setDropTarget({ slotIndex: sIndex, zone: 'tray', insertIndex: st.trayItems.length });
                      }}
                      onDragLeave={() => {
                        if (dropTarget?.slotIndex === sIndex && dropTarget.zone === 'tray') {
                          setDropTarget(null);
                        }
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        dropOnTray(sIndex, st.trayItems.length);
                      }}
                    >
                      {st.trayItems.length === 0 ? (
                        <div className="game2-tray-empty">
                          Kéo các thẻ bên dưới thả vào đây
                        </div>
                      ) : (
                        st.trayItems.map((item, idx) => (
                          <button
                            key={item.id}
                            type="button"
                            draggable
                            className={`game2-card game2-card-tray ${
                              dragInfo?.itemId === item.id ? 'is-dragging' : ''
                            }`}
                            onClick={() => handleRemoveTrayCard(sIndex, item)}
                            onDragStart={e => {
                              e.dataTransfer.effectAllowed = 'move';
                              startDrag(sIndex, item, 'tray');
                            }}
                            onDragEnd={endDrag}
                            onDragOver={e => {
                              if (dragRef.current?.slotIndex !== sIndex) return;
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const after = e.clientX > rect.left + rect.width / 2;
                              setDropTarget({
                                slotIndex: sIndex,
                                zone: 'tray',
                                insertIndex: idx + (after ? 1 : 0)
                              });
                            }}
                            onDrop={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const after = e.clientX > rect.left + rect.width / 2;
                              dropOnTray(sIndex, idx + (after ? 1 : 0));
                            }}
                            title="Kéo để đổi chỗ • Bấm để trả về dưới"
                          >
                            <span className="game2-card-index">{idx + 1}</span>
                            {item.text}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {st.arrangeError && (
                    <div className="game2-error-banner">
                      <span>{st.arrangeError}</span>
                    </div>
                  )}

                  {/* Hàng thẻ xáo trộn */}
                  <div className="game2-pool-section">
                    <div className="game2-pool-label">Các cụm từ cần sắp xếp:</div>
                    <div
                      className={`game2-pool-box ${
                        dropTarget?.slotIndex === sIndex && dropTarget.zone === 'pool' ? 'is-drag-over' : ''
                      }`}
                      onDragOver={e => {
                        if (dragRef.current?.slotIndex !== sIndex) return;
                        e.preventDefault();
                        setDropTarget({ slotIndex: sIndex, zone: 'pool' });
                      }}
                      onDragLeave={() => {
                        if (dropTarget?.slotIndex === sIndex && dropTarget.zone === 'pool') {
                          setDropTarget(null);
                        }
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        dropOnPool(sIndex);
                      }}
                    >
                      {st.poolItems.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          draggable
                          className={`game2-card game2-card-pool ${
                            dragInfo?.itemId === item.id ? 'is-dragging' : ''
                          }`}
                          onClick={() => handleSelectPoolCard(sIndex, item)}
                          onDragStart={e => {
                            e.dataTransfer.effectAllowed = 'move';
                            startDrag(sIndex, item, 'pool');
                          }}
                          onDragEnd={endDrag}
                          title="Kéo lên khay ghép hoặc bấm để đưa lên"
                        >
                          {item.text}
                        </button>
                      ))}
                      {st.poolItems.length === 0 && (
                        <span className="game2-pool-done">
                          Đã chọn hết các cụm từ! Hãy bấm "Xác nhận thứ tự".
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="game2-actions">
                    <button
                      type="button"
                      className="game2-btn game2-btn-confirm"
                      onClick={() => handleConfirmOrder(sIndex)}
                      disabled={!isAllPlaced}
                    >
                      Xác nhận thứ tự
                    </button>
                    <button
                      type="button"
                      className="game2-btn game2-btn-reset"
                      onClick={() => handleResetArrangement(sIndex)}
                      disabled={st.trayItems.length === 0}
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>
              )}

              {/* Giai đoạn 2: Gõ củng cố trí nhớ */}
              {st.phase === 'reinforce' && (
                <div className="game2-reinforce-card">
                  <div className="game2-reinforce-header">
                    <span className="game2-reinforce-badge">Đã xếp cụm chính xác!</span>
                    <p className="game2-reinforce-subtitle">
                      Không nhìn lại đáp án, hãy gõ nhẩm lại cả câu bạn vừa ghép vào ô dưới đây:
                    </p>
                  </div>

                  <textarea
                    className="game2-reinforce-textarea"
                    value={st.reinforceInput}
                    onChange={e => updateSlot(sIndex, cur => ({ ...cur, reinforceInput: e.target.value }))}
                    placeholder={`Gõ nhẩm lại đầy đủ ý ${s.label || index + 1}...`}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    autoComplete="off"
                    rows={2}
                  />

                  <div className="game2-reinforce-actions">
                    <button
                      type="button"
                      className="game2-btn game2-btn-grade-reinforce"
                      onClick={() => handleCheckReinforce(s)}
                    >
                      Kiểm tra câu gõ
                    </button>
                  </div>

                  {st.reinforceGrade && (
                    <div
                      className={`game2-reinforce-result ${
                        st.reinforceGrade.isExact ? 'correct' : 'wrong'
                      }`}
                    >
                      <div className="game2-reinforce-result-title">
                        {st.reinforceGrade.isExact
                          ? 'Tuyệt vời! Bạn đã thuộc chính xác 100%!'
                          : `Độ chính xác: ${st.reinforceGrade.accuracy}% - Còn từ chưa đúng`}
                      </div>
                      <div className="game2-tokens-wrap">
                        {st.reinforceGrade.userTokensResult.map((tok, idx) => (
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
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Tổng kết & kiểm tra toàn bộ */}
      <footer className="game2-footer">
        {summary && (
          <div className={`game2-summary-bar ${summary.isAllExact ? 'summary-passed' : 'summary-pending'}`}>
            <span className="summary-icon">{summary.isAllExact ? '🎉' : '⚠️'}</span>
            <div className="summary-text">
              <strong>
                {summary.isAllExact
                  ? `Xuất sắc! Bạn đã thuộc toàn bộ ${summary.totalCount}/${summary.totalCount} ý!`
                  : `Đã đúng ${summary.correctCount}/${summary.totalCount} ý (Độ chính xác: ${summary.avgAccuracy}%)`}
              </strong>
              <div>
                {summary.isAllExact
                  ? 'Có thể tiếp tục sang câu tiếp theo.'
                  : 'Hãy xem lại các ý chưa đúng để gõ lại.'}
              </div>
            </div>
          </div>
        )}

        <div className="game2-main-actions">
          <button
            type="button"
            className="game2-check-all-btn"
            onClick={handleCheckAll}
          >
            ✓ Kiểm tra tất cả các ý
          </button>

          {summary?.isAllExact && onNext && (
            <button
              type="button"
              className="game2-btn game2-btn-next-step"
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
