import React, { useState, useEffect, useRef } from 'react';
import { generateStep2Arrange, evaluateStep2Arrange } from '../../core/learningStepEngine.js';
import { compareAnswer } from '../../core/gradeEngine.js';
import './Game2Scramble.css';

/**
 * Game 2: "Xáo từ / Xếp cụm" (Phrase Arrange) — kéo thả (drag & drop)
 *
 * Yêu cầu:
 * - Tách riêng từng ý của câu hỏi thành từng khay ghép riêng.
 * - KHÔNG cho kiểm tra từng ý riêng lẻ; KHÔNG bắt nhập lại (bỏ bước reinforce).
 * - Người dùng xếp các thẻ ở từng ý, sau đó bấm nút KIỂM TRA DUY NHẤT Ở CUỐI CÙNG mới chấm và trả kết quả.
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

  // State từng ý: { [slotIndex]: { exerciseData, trayItems, poolItems, result: null | { isCorrect, error } } }
  const [slotStates, setSlotStates] = useState({});
  const [summary, setSummary] = useState(null);

  // Kéo thả: { slotIndex, item, source: 'pool' | 'tray' }
  const dragRef = useRef(null);
  const [dragInfo, setDragInfo] = useState(null);
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
        result: null // null | { isCorrect: boolean, error?: string }
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

  // Thả thẻ vào khay ghép của một ý
  const dropOnTray = (slotIndex, insertIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex) return;
    updateSlot(slotIndex, cur => {
      if (drag.source === 'pool') {
        const nextPool = cur.poolItems.filter(c => c.id !== drag.item.id);
        const nextTray = [...cur.trayItems];
        const idx = Math.max(0, Math.min(insertIndex, nextTray.length));
        nextTray.splice(idx, 0, drag.item);
        return { ...cur, poolItems: nextPool, trayItems: nextTray, result: null };
      }
      // Kéo đổi chỗ trong khay
      const fromIdx = cur.trayItems.findIndex(c => c.id === drag.item.id);
      if (fromIdx === -1) return cur;
      const nextTray = cur.trayItems.filter(c => c.id !== drag.item.id);
      let idx = Math.max(0, Math.min(insertIndex, nextTray.length + 1));
      if (fromIdx < insertIndex) idx = Math.max(0, idx - 1);
      nextTray.splice(idx, 0, drag.item);
      return { ...cur, trayItems: nextTray, result: null };
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
      result: null
    }));
    endDrag();
  };

  // Bấm thẻ ở hàng dưới: bay lên cuối khay
  const handleSelectPoolCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      poolItems: cur.poolItems.filter(c => c.id !== item.id),
      trayItems: [...cur.trayItems, item],
      result: null
    }));
  };

  // Bấm thẻ trên khay: trả về hàng dưới
  const handleRemoveTrayCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== item.id),
      poolItems: [...cur.poolItems, item],
      result: null
    }));
  };

  // Đặt lại toàn bộ thẻ về hàng dưới của 1 ý
  const handleResetArrangement = (slotIndex) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: [],
      poolItems: cur.exerciseData?.shuffledItems || [],
      result: null
    }));
  };

  // NÚT CHECK DUY NHẤT Ở CUỐI CÙNG: Kiểm tra toàn bộ các ý và trả kết quả cùng lúc
  // Ghi chú tương thích: chức năng từng ý riêng lẻ "Xác nhận thứ tự" và bước gõ lại "reinforce" đã được gỡ bỏ
  const handleCheckAll = () => {
    let correctCount = 0;
    const newStates = { ...slotStates };

    slots.forEach(s => {
      const cur = newStates[s.slotIndex];
      if (!cur) return;

      const totalCount = cur.exerciseData?.totalPhrases || 0;
      if (cur.trayItems.length < totalCount) {
        newStates[s.slotIndex] = {
          ...cur,
          result: {
            isCorrect: false,
            error: `Chưa xếp đủ các cụm từ (mới xếp ${cur.trayItems.length}/${totalCount} cụm)`
          }
        };
        return;
      }

      const selectedIds = cur.trayItems.map(item => item.id);
      const evalResult = evaluateStep2Arrange(selectedIds, cur.exerciseData.correctOrderIds);

      if (evalResult.isCorrect) {
        correctCount++;
        newStates[s.slotIndex] = {
          ...cur,
          result: { isCorrect: true, error: null }
        };
      } else {
        newStates[s.slotIndex] = {
          ...cur,
          result: {
            isCorrect: false,
            error: 'Thứ tự chưa chuẩn xác! Hãy đổi lại vị trí các cụm từ.'
          }
        };
      }
    });

    setSlotStates(newStates);

    const isAllExact = correctCount === slots.length;
    const sumData = {
      isAllExact,
      correctCount,
      totalCount: slots.length,
      avgAccuracy: Math.round((correctCount / slots.length) * 100)
    };
    setSummary(sumData);

    if (isAllExact && typeof onComplete === 'function') {
      onComplete({
        isPassed: true,
        isExact: true,
        summary: sumData,
        reinforceGrade: { isExact: true, accuracy: 100 }
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
        <p className="game2-instruction-note">
          👉 Hãy kéo thả hoặc chạm các cụm từ vào khay cho từng ý. Khi xếp xong hết, nhấn nút <strong>"Kiểm tra kết quả"</strong> ở cuối trang.
        </p>
      </header>

      {/* 2. Danh sách các ý — mỗi ý một card kéo thả riêng */}
      <div className="game2-slots-list">
        {slots.map((s, index) => {
          const sIndex = s.slotIndex;
          const st = slotStates[sIndex];
          if (!st) return null;

          const totalCount = st.exerciseData?.totalPhrases || 0;
          const isAllPlaced = st.trayItems.length === totalCount && totalCount > 0;
          const trayDropActive = dropTarget?.slotIndex === sIndex && dropTarget.zone === 'tray';
          const res = st.result;

          return (
            <div
              key={sIndex}
              className={`game2-slot-card ${res ? (res.isCorrect ? 'slot-passed' : 'slot-failed') : ''}`}
            >
              {/* Header của từng ý */}
              <div className="slot-card-header">
                <div className="slot-label-group">
                  <span className="slot-tag-pill">{s.label || `Ý ${index + 1}`}</span>
                  <strong className="slot-title-text">{s.title || `Ý số ${index + 1}`}</strong>
                </div>

                {/* Trạng thái chỉ hiện sau khi bấm nút Check cuối cùng */}
                {res && (
                  <span className={`slot-status-badge ${res.isCorrect ? 'badge-exact' : 'badge-wrong'}`}>
                    {res.isCorrect ? '✓ Đã ghép đúng' : '✕ Chưa đúng'}
                  </span>
                )}
              </div>

              {/* Khay ghép phía trên */}
              <div className="game2-tray-section">
                <div className="game2-tray-label">
                  <span>Khay ghép ({st.trayItems.length}/{totalCount} cụm)</span>
                  <div className="game2-tray-actions-inline">
                    <span className="game2-tray-hint">Kéo thả để đổi chỗ • Bấm để gỡ</span>
                    {st.trayItems.length > 0 && (
                      <button
                        type="button"
                        className="game2-reset-inline-btn"
                        onClick={() => handleResetArrangement(sIndex)}
                        title="Đặt lại toàn bộ thẻ về bên dưới"
                      >
                        Đặt lại ý này
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={`game2-tray-box ${isAllPlaced ? 'is-complete' : ''} ${
                    res && !res.isCorrect ? 'is-error' : ''
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
                      Kéo các thẻ bên dưới thả vào đây (hoặc bấm vào thẻ)
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

              {/* Thông báo lỗi sau khi kiểm tra nếu có */}
              {res && !res.isCorrect && res.error && (
                <div className="game2-error-banner">
                  <span>⚠️ {res.error}</span>
                </div>
              )}

              {/* Hàng thẻ xáo trộn phía dưới */}
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
                      ✓ Đã xếp hết các cụm từ của ý này vào khay.
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. NÚT KIỂM TRA DUY NHẤT Ở CUỐI CÙNG */}
      <footer className="game2-footer">
        {summary && (
          <div className={`game2-summary-bar ${summary.isAllExact ? 'summary-passed' : 'summary-pending'}`}>
            <span className="summary-icon">{summary.isAllExact ? '🎉' : '⚠️'}</span>
            <div className="summary-text">
              <strong>
                {summary.isAllExact
                  ? `Xuất sắc! Bạn đã xếp đúng toàn bộ ${summary.totalCount}/${summary.totalCount} ý!`
                  : `Đã đúng ${summary.correctCount}/${summary.totalCount} ý (Độ chính xác: ${summary.avgAccuracy}%)`}
              </strong>
              <div>
                {summary.isAllExact
                  ? 'Tuyệt vời! Bạn có thể tiếp tục sang câu tiếp theo.'
                  : 'Hãy xem lại các ý có viền đỏ để kéo đổi lại vị trí các thẻ rồi bấm kiểm tra lại.'}
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
            ✓ Kiểm tra kết quả các ý
          </button>

          {summary?.isAllExact && onNext && (
            <button
              type="button"
              className="game2-next-btn"
              onClick={onNext}
            >
              Tiếp tục câu tiếp theo →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
