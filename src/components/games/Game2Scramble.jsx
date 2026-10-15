import React, { useState, useEffect, useRef } from 'react';
import { generateStep2Arrange, evaluateStep2Arrange } from '../../core/learningStepEngine.js';
import { compareAnswer } from '../../core/gradeEngine.js';
import './Game2Scramble.css';

/**
 * Game 2: "Xáo từ / Xếp cụm" (Phrase Arrange)
 *
 * Cải tiến UX:
 * 1. Khay ghép chia ô lưới 2x2 (2 cột) rõ ràng, mượt mà, cố định từng vị trí [Vị trí 1], [Vị trí 2]...
 * 2. Bỏ hoàn toàn tích xanh "đã xếp hết các cụm từ" gây hiểu lầm.
 * 3. Khi bấm "Kiểm tra kết quả" ở cuối cùng: từng ô vị trí tự động báo XANH (✓ Đúng) hoặc ĐỎ (✕ Sai vị trí)
 *    để người dùng nhận biết ngay lập tức cụm nào cần đổi chỗ.
 * 4. Không cho kiểm tra từng ý lẻ; không bắt gõ lại (bỏ reinforce).
 *
 * @param {object} props
 * @param {object} [props.question] - Câu hỏi đầy đủ ({ id, stageId, question, slots })
 * @param {object} [props.slot] - Tương thích ngược: truyền 1 slot lẻ
 * @param {string} [props.questionText] - Nội dung câu hỏi lớn (khi truyền slot lẻ)
 * @param {object} [props.initialState] - Dữ liệu đã làm trước đó ({ slotStates, summary }) để không mất đáp án khi chuyển câu
 * @param {function} [props.onStateChange] - Callback báo cho component cha mỗi khi người dùng thay đổi trạng thái ghép/kiểm tra
 * @param {function} [props.onComplete] - Callback khi hoàn thành đúng toàn bộ các ý
 * @param {function} [props.onNext] - Callback chuyển sang câu tiếp theo
 */
export default function Game2Scramble({
  question,
  slot,
  questionText,
  initialState,
  onStateChange,
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

  // State từng ý: { [slotIndex]: { exerciseData, trayItems, poolItems, result } }
  const [slotStates, setSlotStates] = useState(() => {
    const saved = initialState?.slotStates;
    const init = {};
    slots.forEach(s => {
      if (saved && saved[s.slotIndex]) {
        init[s.slotIndex] = saved[s.slotIndex];
      } else {
        const ex = generateStep2Arrange({
          ...s,
          answer: s.fullAnswer || s.answer || s.targetAnswer || ''
        });
        init[s.slotIndex] = {
          exerciseData: ex,
          trayItems: [],
          poolItems: ex.shuffledItems || [],
          result: null
        };
      }
    });
    return init;
  });

  const [summary, setSummary] = useState(() => initialState?.summary || null);

  // Kéo thả: { slotIndex, item, source: 'pool' | 'tray', fromIndex?: number }
  const dragRef = useRef(null);
  const [dragInfo, setDragInfo] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Khởi tạo lại khi đổi câu hỏi hoặc khi initialState được cung cấp
  useEffect(() => {
    const saved = initialState?.slotStates;
    const next = {};
    slots.forEach(s => {
      if (saved && saved[s.slotIndex]) {
        next[s.slotIndex] = saved[s.slotIndex];
      } else {
        const ex = generateStep2Arrange({
          ...s,
          answer: s.fullAnswer || s.answer || s.targetAnswer || ''
        });
        next[s.slotIndex] = {
          exerciseData: ex,
          trayItems: [],
          poolItems: ex.shuffledItems || [],
          result: null // null | { isCorrect: boolean, error?: string, posResults: boolean[] }
        };
      }
    });
    setSlotStates(next);
    setSummary(initialState?.summary || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetQuestion?.id, initialState]);

  const updateSlot = (slotIndex, updater) => {
    setSlotStates(prev => {
      const cur = prev[slotIndex];
      if (!cur) return prev;
      const updatedSlot = updater(cur);
      const nextStates = { ...prev, [slotIndex]: updatedSlot };
      if (typeof onStateChange === 'function') {
        onStateChange({ slotStates: nextStates, summary: null });
      }
      return nextStates;
    });
    setSummary(null);
  };

  // --- KÉO THẢ VÀO Ô LƯỚI ---
  const startDrag = (slotIndex, item, source, fromIndex) => {
    dragRef.current = { slotIndex, item, source, fromIndex };
    setDragInfo({ slotIndex, itemId: item.id, source });
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragInfo(null);
    setDropTarget(null);
  };

  // Thả vào ô vị trí cụ thể trong khay 2x2
  const dropOnTraySlot = (slotIndex, targetIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex) return;

    updateSlot(slotIndex, cur => {
      const nextTray = [...cur.trayItems];
      let nextPool = [...cur.poolItems];

      if (drag.source === 'pool') {
        // Lấy từ pool sang tray
        nextPool = nextPool.filter(c => c.id !== drag.item.id);
        if (targetIndex >= nextTray.length) {
          nextTray.push(drag.item);
        } else {
          // Chèn vào vị trí targetIndex
          nextTray.splice(targetIndex, 0, drag.item);
        }
      } else if (drag.source === 'tray') {
        // Đổi chỗ trong khay
        const fromIdx = drag.fromIndex ?? nextTray.findIndex(c => c.id === drag.item.id);
        if (fromIdx !== -1 && fromIdx !== targetIndex) {
          const [moved] = nextTray.splice(fromIdx, 1);
          const safeIdx = Math.min(targetIndex, nextTray.length);
          nextTray.splice(safeIdx, 0, moved);
        }
      }

      return {
        ...cur,
        trayItems: nextTray,
        poolItems: nextPool,
        result: null
      };
    });

    endDrag();
  };

  // Thả thẻ từ khay trả về pool
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

  // Click chọn thẻ ở pool: đưa vào ô trống tiếp theo trên khay
  const handleSelectPoolCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      poolItems: cur.poolItems.filter(c => c.id !== item.id),
      trayItems: [...cur.trayItems, item],
      result: null
    }));
  };

  // Click thẻ trên khay: gỡ trả về pool
  const handleRemoveTrayCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== item.id),
      poolItems: [...cur.poolItems, item],
      result: null
    }));
  };

  // Đặt lại toàn bộ thẻ về pool
  const handleResetArrangement = (slotIndex) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: [],
      poolItems: cur.exerciseData?.shuffledItems || [],
      result: null
    }));
  };

  // NÚT KIỂM TRA DUY NHẤT Ở CUỐI CÙNG
  // Ghi chú tương thích: chức năng từng ý riêng lẻ "Xác nhận thứ tự" và bước gõ lại "reinforce" đã được gỡ bỏ
  const handleCheckAll = () => {
    let correctCount = 0;
    const newStates = { ...slotStates };

    slots.forEach(s => {
      const cur = newStates[s.slotIndex];
      if (!cur) return;

      const totalCount = cur.exerciseData?.totalPhrases || 0;
      const correctOrderIds = cur.exerciseData?.correctOrderIds || [];

      if (cur.trayItems.length < totalCount) {
        newStates[s.slotIndex] = {
          ...cur,
          result: {
            isCorrect: false,
            error: `Chưa xếp đủ ${totalCount} ô đáp án (mới xếp ${cur.trayItems.length}/${totalCount})`,
            posResults: cur.trayItems.map((item, idx) => item.id === correctOrderIds[idx])
          }
        };
        return;
      }

      const selectedIds = cur.trayItems.map(item => item.id);
      const evalResult = evaluateStep2Arrange(selectedIds, correctOrderIds);
      const posResults = cur.trayItems.map((item, idx) => item.id === correctOrderIds[idx]);

      if (evalResult.isCorrect) {
        correctCount++;
        newStates[s.slotIndex] = {
          ...cur,
          result: { isCorrect: true, error: null, posResults }
        };
      } else {
        newStates[s.slotIndex] = {
          ...cur,
          result: {
            isCorrect: false,
            error: 'Có vị trí chưa chính xác! Hãy đổi chỗ các ô màu đỏ.',
            posResults
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

    if (typeof onStateChange === 'function') {
      onStateChange({
        slotStates: newStates,
        summary: sumData
      });
    }

    if (isAllExact && typeof onComplete === 'function') {
      onComplete({
        questionId: targetQuestion.id,
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
          👉 Kéo hoặc bấm thẻ để xếp vào các ô đáp án lưới 2x2. Khi xếp xong hết, nhấn nút <strong>"✓ Kiểm tra kết quả các ý"</strong> ở cuối trang.
        </p>
      </header>

      {/* 2. Danh sách các ý */}
      <div className="game2-slots-list">
        {slots.map((s, index) => {
          const sIndex = s.slotIndex;
          const st = slotStates[sIndex];
          if (!st) return null;

          const totalCount = st.exerciseData?.totalPhrases || 0;
          const isAllPlaced = st.trayItems.length === totalCount && totalCount > 0;
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

                {/* Kết quả chỉ hiện rõ ràng sau khi bấm kiểm tra ở cuối */}
                {res && (
                  <span className={`slot-status-badge ${res.isCorrect ? 'badge-exact' : 'badge-wrong'}`}>
                    {res.isCorrect ? '✓ Hoàn thành chính xác' : '✕ Có cụm sai vị trí'}
                  </span>
                )}
              </div>

              {/* KHAY GHÉP CHIA Ô LƯỚI 2x2 CỐ ĐỊNH TỪNG VỊ TRÍ */}
              <div className="game2-tray-section">
                <div className="game2-tray-label">
                  <span>Khay đáp án ({st.trayItems.length}/{totalCount} cụm):</span>
                  <div className="game2-tray-actions-inline">
                    <span className="game2-tray-hint">Kéo đổi chỗ • Bấm để gỡ</span>
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

                {/* Lưới 2x2 các ô đáp án */}
                <div className="game2-grid-2x2">
                  {Array.from({ length: totalCount }).map((_, slotIdx) => {
                    const placedItem = st.trayItems[slotIdx];
                    const isDropTargetHere = dropTarget?.slotIndex === sIndex && dropTarget?.targetIndex === slotIdx;
                    const posCorrect = res?.posResults ? res.posResults[slotIdx] : null;

                    return (
                      <div
                        key={slotIdx}
                        className={`game2-grid-cell ${placedItem ? 'has-item' : 'is-empty'} ${
                          isDropTargetHere ? 'drag-over-cell' : ''
                        } ${posCorrect === true ? 'cell-correct' : ''} ${
                          posCorrect === false ? 'cell-wrong' : ''
                        }`}
                        onDragOver={e => {
                          if (dragRef.current?.slotIndex !== sIndex) return;
                          e.preventDefault();
                          setDropTarget({ slotIndex: sIndex, targetIndex: slotIdx });
                        }}
                        onDragLeave={() => {
                          if (dropTarget?.slotIndex === sIndex && dropTarget?.targetIndex === slotIdx) {
                            setDropTarget(null);
                          }
                        }}
                        onDrop={e => {
                          e.preventDefault();
                          dropOnTraySlot(sIndex, slotIdx);
                        }}
                      >
                        {/* Nhãn số thứ tự của ô */}
                        <div className="grid-cell-header">
                          <span className="grid-cell-num">Ô #{slotIdx + 1}</span>
                          {posCorrect === true && <span className="cell-badge correct">✓ Đúng</span>}
                          {posCorrect === false && <span className="cell-badge wrong">✕ Sai vị trí</span>}
                        </div>

                        {placedItem ? (
                          <div
                            draggable
                            className={`game2-placed-card ${dragInfo?.itemId === placedItem.id ? 'is-dragging' : ''}`}
                            onClick={() => handleRemoveTrayCard(sIndex, placedItem)}
                            onDragStart={() => startDrag(sIndex, placedItem, 'tray', slotIdx)}
                            onDragEnd={endDrag}
                            title="Kéo sang ô khác để đổi chỗ • Bấm để gỡ về dưới"
                          >
                            <span className="placed-text">{placedItem.text}</span>
                            <span className="remove-cross" title="Gỡ">✕</span>
                          </div>
                        ) : (
                          <div className="grid-empty-prompt">
                            <span>+ Thả cụm từ #{slotIdx + 1} vào đây</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông báo lỗi rõ ràng sau khi bấm kiểm tra */}
              {res && !res.isCorrect && res.error && (
                <div className="game2-error-banner alert-high-contrast">
                  <span className="error-icon">⚠️</span>
                  <span>{res.error}</span>
                </div>
              )}

              {/* HÀNG CỤM TỪ CẦN SẮP XẾP — CHIA LƯỚI 2 CỘT */}
              <div className="game2-pool-section">
                <div className="game2-pool-label">Các cụm từ cần sắp xếp:</div>
                <div
                  className={`game2-pool-grid ${
                    dropTarget?.slotIndex === sIndex && dropTarget?.targetIndex === 'pool' ? 'is-drag-over' : ''
                  }`}
                  onDragOver={e => {
                    if (dragRef.current?.slotIndex !== sIndex) return;
                    e.preventDefault();
                    setDropTarget({ slotIndex: sIndex, targetIndex: 'pool' });
                  }}
                  onDragLeave={() => {
                    if (dropTarget?.slotIndex === sIndex && dropTarget?.targetIndex === 'pool') {
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
                      className={`game2-pool-card ${dragInfo?.itemId === item.id ? 'is-dragging' : ''}`}
                      onClick={() => handleSelectPoolCard(sIndex, item)}
                      onDragStart={() => startDrag(sIndex, item, 'pool')}
                      onDragEnd={endDrag}
                      title="Kéo vào ô hoặc bấm để đưa lên khay"
                    >
                      <span className="pool-card-text">{item.text}</span>
                      <span className="pool-card-arrow">↑</span>
                    </button>
                  ))}
                  {/* Không hiện câu chữ tích xanh gây hiểu lầm */}
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
                  : 'Hãy xem các ô có đánh dấu ĐỎ "✕ Sai vị trí" ở trên để kéo đổi chỗ rồi kiểm tra lại.'}
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
