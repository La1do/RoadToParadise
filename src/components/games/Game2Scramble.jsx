import React, { useState, useEffect, useRef } from 'react';
import { generateStep2Arrange, evaluateStep2Arrange } from '../../core/learningStepEngine.js';
import { compareAnswer } from '../../core/gradeEngine.js';
import './Game2Scramble.css';

/**
 * Game 2: "Xáo từ / Xếp cụm" (Phrase Arrange)
 *
 * Cải tiến UX & Performance:
 * 1. Chỉ 1 ô khay duy nhất để kéo thả (không chia nhiều ô nhỏ rời rạc).
 * 2. Cơ chế Touch & Pointer Drag mượt mà trên điện thoại, có Ghost Card bay theo ngón tay (60 FPS).
 * 3. Hỗ trợ thao tác chạm nhanh (Tap-to-move): Chạm là thẻ tự nhảy lên ô hoặc gỡ về kho từ.
 * 4. Kéo đổi chỗ trực tiếp giữa các thẻ trong cùng 1 ô khay (Reorder).
 * 5. Báo đúng/sai rõ nét từng cụm bằng viền Xanh / Đỏ kèm huy hiệu khi bấm kiểm tra ở cuối.
 * 6. Tương thích ngược: Ghi chú "Xác nhận thứ tự" và "reinforce" đã được tối ưu tinh gọn.
 *
 * @param {object} props
 * @param {object} [props.question] - Câu hỏi đầy đủ ({ id, stageId, question, slots })
 * @param {object} [props.slot] - Tương thích ngược: truyền 1 slot lẻ
 * @param {string} [props.questionText] - Nội dung câu hỏi lớn (khi truyền slot lẻ)
 * @param {object} [props.initialState] - Dữ liệu đã làm trước đó ({ slotStates, summary })
 * @param {function} [props.onStateChange] - Callback báo trạng thái cho component cha
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
  // Chuẩn hóa dữ liệu câu hỏi và danh sách các ý (slots)
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

  // Kéo thả & Cảm ứng mượt mà trên điện thoại
  const dragRef = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0, time: 0 });
  const [dragInfo, setDragInfo] = useState(null); // { slotIndex, itemId, text, source, fromIndex }
  const [ghostPos, setGhostPos] = useState(null); // { x, y } cho thẻ bay theo ngón tay
  const [hoverTarget, setHoverTarget] = useState(null); // { slotIndex, type: 'tray' | 'tray-card' | 'pool', index?: number }

  // Khởi tạo lại khi đổi câu hỏi
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
          result: null
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

  // Tính toán vị trí chèn (tách khe giữa các thẻ) dựa vào tọa độ ngón tay / con trỏ
  const calculateInsertIndex = (slotIndex, clientX, clientY) => {
    const trayElem = document.querySelector(`[data-tray-slot="${slotIndex}"]`);
    if (!trayElem) return undefined;

    const cards = Array.from(trayElem.querySelectorAll('[data-tray-card-index]'));
    if (cards.length === 0) return 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      if (
        clientX >= rect.left - 15 &&
        clientX <= rect.right + 15 &&
        clientY >= rect.top - 25 &&
        clientY <= rect.bottom + 25
      ) {
        const midX = rect.left + rect.width / 2;
        return clientX < midX ? i : i + 1;
      }
    }

    const lastCard = cards[cards.length - 1];
    const lastRect = lastCard.getBoundingClientRect();
    if (clientY > lastRect.bottom || (clientY >= lastRect.top - 10 && clientX > lastRect.right)) {
      return cards.length;
    }

    const firstCard = cards[0];
    const firstRect = firstCard.getBoundingClientRect();
    if (clientY < firstRect.top || (clientY <= firstRect.bottom + 10 && clientX < firstRect.left)) {
      return 0;
    }

    return cards.length;
  };

  // --- THẢ VÀO 1 Ô KHAY DUY NHẤT (Thêm vào cuối hoặc chèn vào vị trí targetIndex) ---
  const dropOnTray = (slotIndex, targetIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex) return;

    updateSlot(slotIndex, cur => {
      const nextTray = [...cur.trayItems];
      let nextPool = [...cur.poolItems];

      if (drag.source === 'pool') {
        // Lấy từ kho từ vào ô khay
        nextPool = nextPool.filter(c => c.id !== drag.item.id);
        if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= nextTray.length) {
          nextTray.splice(targetIndex, 0, drag.item);
        } else {
          nextTray.push(drag.item);
        }
      } else if (drag.source === 'tray') {
        // Đổi chỗ (reorder) các thẻ trong cùng 1 ô khay
        const fromIdx = drag.fromIndex ?? nextTray.findIndex(c => c.id === drag.item.id);
        if (fromIdx !== -1) {
          const [moved] = nextTray.splice(fromIdx, 1);
          const adjustedIndex = typeof targetIndex === 'number'
            ? (targetIndex > fromIdx ? targetIndex - 1 : targetIndex)
            : nextTray.length;
          const safeIdx = Math.min(Math.max(0, adjustedIndex), nextTray.length);
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
  };

  // --- THẢ THẺ TRẢ VỀ KHO TỪ ---
  const dropOnPool = (slotIndex) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex || drag.source !== 'tray') return;
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== drag.item.id),
      poolItems: [...cur.poolItems, drag.item],
      result: null
    }));
  };

  // Chạm thẻ ở kho từ: đưa ngay vào ô khay
  const handleSelectPoolCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      poolItems: cur.poolItems.filter(c => c.id !== item.id),
      trayItems: [...cur.trayItems, item],
      result: null
    }));
  };

  // Chạm thẻ trên khay: gỡ trả về kho từ
  const handleRemoveTrayCard = (slotIndex, item) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: cur.trayItems.filter(c => c.id !== item.id),
      poolItems: [...cur.poolItems, item],
      result: null
    }));
  };

  // Đặt lại toàn bộ thẻ về kho từ
  const handleResetArrangement = (slotIndex) => {
    updateSlot(slotIndex, cur => ({
      ...cur,
      trayItems: [],
      poolItems: cur.exerciseData?.shuffledItems || [],
      result: null
    }));
  };

  // --- XỬ LÝ KÉO THẢ TRÊN MÁY TÍNH (HTML5 DRAG & DROP) ---
  const handleDragStart = (slotIndex, item, source, fromIndex, e) => {
    dragRef.current = { slotIndex, item, source, fromIndex, isDragging: true };
    setDragInfo({ slotIndex, itemId: item.id, text: item.text, source, fromIndex });
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleTrayDragOver = (slotIndex, e) => {
    if (dragRef.current?.slotIndex !== slotIndex) return;
    e.preventDefault();
    const insertIdx = calculateInsertIndex(slotIndex, e.clientX, e.clientY);
    setHoverTarget({ slotIndex, type: 'tray-insert', index: insertIdx });
  };

  const handleDragEnd = () => {
    dragRef.current = null;
    setDragInfo(null);
    setGhostPos(null);
    setHoverTarget(null);
  };

  // --- XỬ LÝ CẢM ỨNG MƯỢT MÀ TRÊN ĐIỆN THOẠI (TOUCH EVENTS) ---
  const handleTouchStart = (slotIndex, item, source, fromIndex, e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    dragRef.current = {
      slotIndex,
      item,
      source,
      fromIndex,
      isDragging: false
    };
  };

  const handleTouchMove = (slotIndex, e) => {
    if (!dragRef.current || dragRef.current.slotIndex !== slotIndex) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;

    // Ngưỡng phát hiện kéo: di chuyển > 8px
    if (!dragRef.current.isDragging && Math.hypot(dx, dy) > 8) {
      dragRef.current.isDragging = true;
      setDragInfo({
        slotIndex,
        itemId: dragRef.current.item.id,
        text: dragRef.current.item.text,
        source: dragRef.current.source,
        fromIndex: dragRef.current.fromIndex
      });
    }

    if (dragRef.current.isDragging) {
      if (e.cancelable) e.preventDefault(); // Ngăn cuộn trang trong lúc kéo
      setGhostPos({ x: touch.clientX, y: touch.clientY });

      // Phát hiện phần tử dưới ngón tay và tách khe chèn
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const trayElem = elem?.closest(`[data-tray-slot="${slotIndex}"]`);
      const poolElem = elem?.closest(`[data-pool-slot="${slotIndex}"]`);

      if (trayElem) {
        const insertIdx = calculateInsertIndex(slotIndex, touch.clientX, touch.clientY);
        setHoverTarget({ slotIndex, type: 'tray-insert', index: insertIdx });
      } else if (poolElem) {
        setHoverTarget({ slotIndex, type: 'pool' });
      } else {
        setHoverTarget(null);
      }
    }
  };

  const handleTouchEnd = (slotIndex, item, source) => {
    const drag = dragRef.current;
    if (!drag || drag.slotIndex !== slotIndex) return;

    if (!drag.isDragging) {
      // Nếu chỉ chạm nhẹ và nhấc tay (tap): chuyển thẻ ngay lập tức
      if (source === 'pool') {
        handleSelectPoolCard(slotIndex, item);
      } else if (source === 'tray') {
        handleRemoveTrayCard(slotIndex, item);
      }
    } else {
      // Nếu là kéo thả ngón tay (drag release)
      if (hoverTarget?.slotIndex === slotIndex) {
        if (hoverTarget.type === 'tray-insert' || hoverTarget.type === 'tray') {
          dropOnTray(slotIndex, hoverTarget.index);
        } else if (hoverTarget.type === 'pool' && source === 'tray') {
          dropOnPool(slotIndex);
        }
      }
    }

    dragRef.current = null;
    setDragInfo(null);
    setGhostPos(null);
    setHoverTarget(null);
  };

  // --- NÚT KIỂM TRA DUY NHẤT Ở CUỐI CÙNG ---
  // Tương thích logic: không yêu cầu nút riêng "Xác nhận thứ tự" và bỏ bước gõ củng cố "reinforce"
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
            error: `Chưa xếp đủ các cụm từ (mới xếp ${cur.trayItems.length}/${totalCount})`,
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
            error: 'Có cụm từ chưa đúng vị trí! Hãy đổi chỗ các ô màu đỏ rồi kiểm tra lại.',
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
      {/* Ghost Card bay theo ngón tay khi kéo trên điện thoại (Hardware-accelerated 60fps) */}
      {ghostPos && dragInfo && (
        <div
          className="game2-touch-ghost"
          style={{
            transform: `translate3d(${ghostPos.x - 30}px, ${ghostPos.y - 36}px, 0)`
          }}
        >
          <span className="ghost-icon">✋</span>
          <span className="ghost-text">{dragInfo.text}</span>
        </div>
      )}

      {/* 1. Header câu hỏi */}
      <header className="game2-header">
        <div className="game2-badge-row">
          <span className="game2-chapter-badge">CHẶNG {targetQuestion.stageId || 1}</span>
          <span className="game2-question-pill">CÂU HỎI {targetQuestion.id} ({slots.length} Ý CẦN GHÉP)</span>
        </div>
        <h2 className="game2-question-title">{targetQuestion.question}</h2>
        <p className="game2-instruction-note">
          👉 <strong>Kéo hoặc chạm</strong> các cụm từ bên dưới thả vào ô đáp án. Bấm nút <strong>"✓ Kiểm tra kết quả các ý"</strong> ở cuối trang khi đã xếp xong.
        </p>
      </header>

      {/* 2. Danh sách các ý */}
      <div className="game2-slots-list">
        {slots.map((s, index) => {
          const sIndex = s.slotIndex;
          const st = slotStates[sIndex];
          if (!st) return null;

          const totalCount = st.exerciseData?.totalPhrases || 0;
          const res = st.result;
          const isTrayDragOver = hoverTarget?.slotIndex === sIndex && hoverTarget.type.startsWith('tray');

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

                {/* Kết quả đánh giá */}
                {res && (
                  <span className={`slot-status-badge ${res.isCorrect ? 'badge-exact' : 'badge-wrong'}`}>
                    {res.isCorrect ? '✓ Hoàn thành chính xác' : '✕ Có cụm sai vị trí'}
                  </span>
                )}
              </div>

              {/* 1 Ô KHAY GHÉP DUY NHẤT CHO NGƯỜI DÙNG KÉO THẢ VÀO */}
              <div className="game2-tray-section">
                <div className="game2-tray-label">
                  <span>Ô đáp án ghép câu ({st.trayItems.length}/{totalCount} cụm):</span>
                  <div className="game2-tray-actions-inline">
                    <span className="game2-tray-hint">Chạm để gỡ • Kéo để đổi vị trí</span>
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

                {/* Ô KHAY ĐƠN CHỨA TẤT CẢ CÁC CỤM TỪ */}
                {(() => {
                  const isDraggingThisSlot = dragInfo?.slotIndex === sIndex;
                  const targetInsertIndex = (hoverTarget?.slotIndex === sIndex && hoverTarget.type === 'tray-insert')
                    ? hoverTarget.index
                    : undefined;

                  return (
                    <div
                      data-tray-slot={sIndex}
                      className={`game2-single-tray ${st.trayItems.length === 0 ? 'is-empty' : 'has-items'} ${
                        isTrayDragOver ? 'is-drag-over' : ''
                      } ${res ? (res.isCorrect ? 'tray-correct' : 'tray-wrong') : ''}`}
                      onDragOver={e => handleTrayDragOver(sIndex, e)}
                      onDragLeave={() => {
                        if (hoverTarget?.slotIndex === sIndex && hoverTarget.type?.startsWith('tray')) {
                          setHoverTarget(null);
                        }
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        dropOnTray(sIndex, targetInsertIndex);
                        handleDragEnd();
                      }}
                    >
                      {st.trayItems.length === 0 ? (
                        <div className={`game2-tray-empty-prompt ${isTrayDragOver ? 'is-target-hovered' : ''}`}>
                          <span className="tray-empty-icon">{isTrayDragOver ? '✨' : '📥'}</span>
                          <span className="tray-empty-text">
                            {isTrayDragOver ? 'Thả cụm từ vào đây...' : 'Kéo thả hoặc chạm các cụm từ bên dưới vào đây...'}
                          </span>
                        </div>
                      ) : (
                        <div className="game2-tray-items-flow">
                          {st.trayItems.map((item, idx) => {
                            const isInsertBeforeThis = isDraggingThisSlot && targetInsertIndex === idx;
                            const posCorrect = res?.posResults ? res.posResults[idx] : null;

                            return (
                              <React.Fragment key={item.id}>
                                {/* KHE TÁCH RA KHI KÉO THẺ QUA VỊ TRÍ NÀY */}
                                {isInsertBeforeThis && (
                                  <div className="game2-drop-placeholder" key={`placeholder-${idx}`}>
                                    <span className="placeholder-arrow">↳</span>
                                    <span className="placeholder-text">Thả vào đây</span>
                                  </div>
                                )}

                                <div
                                  data-tray-card-index={idx}
                                  draggable
                                  className={`game2-placed-card ${dragInfo?.itemId === item.id ? 'is-dragging' : ''} ${
                                    posCorrect === true ? 'pos-correct' : ''
                                  } ${posCorrect === false ? 'pos-wrong' : ''}`}
                                  onTouchStart={e => handleTouchStart(sIndex, item, 'tray', idx, e)}
                                  onTouchMove={e => handleTouchMove(sIndex, e)}
                                  onTouchEnd={() => handleTouchEnd(sIndex, item, 'tray')}
                                  onTouchCancel={handleDragEnd}
                                  onDragStart={e => handleDragStart(sIndex, item, 'tray', idx, e)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => handleRemoveTrayCard(sIndex, item)}
                                  title="Kéo sang cụm khác để đổi chỗ • Chạm để gỡ về kho"
                                >
                                  <span className="placed-chip-num">#{idx + 1}</span>
                                  <span className="placed-chip-text">{item.text}</span>
                                  {posCorrect === true && <span className="cell-badge correct">✓ Đúng</span>}
                                  {posCorrect === false && <span className="cell-badge wrong">✕ Sai</span>}
                                  <span
                                    className="remove-cross"
                                    title="Gỡ về kho từ"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleRemoveTrayCard(sIndex, item);
                                    }}
                                  >
                                    ✕
                                  </span>
                                </div>
                              </React.Fragment>
                            );
                          })}

                          {/* KHE TÁCH RA Ở CUỐI CÙNG (NẾU THẢ VÀO VỊ TRÍ CUỐI CÙNG) */}
                          {isDraggingThisSlot && targetInsertIndex === st.trayItems.length && (
                            <div className="game2-drop-placeholder at-end" key="placeholder-end">
                              <span className="placeholder-arrow">↳</span>
                              <span className="placeholder-text">Thả vào đây</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Thông báo lỗi rõ ràng sau khi bấm kiểm tra */}
              {res && !res.isCorrect && res.error && (
                <div className="game2-error-banner alert-high-contrast">
                  <span className="error-icon">⚠️</span>
                  <span>{res.error}</span>
                </div>
              )}

              {/* KHO CỤM TỪ CẦN SẮP XẾP */}
              <div className="game2-pool-section">
                <div className="game2-pool-label">Các cụm từ cần sắp xếp:</div>
                <div
                  data-pool-slot={sIndex}
                  className={`game2-pool-grid ${
                    hoverTarget?.slotIndex === sIndex && hoverTarget?.type === 'pool' ? 'is-drag-over' : ''
                  }`}
                  onDragOver={e => {
                    if (dragRef.current?.slotIndex !== sIndex) return;
                    e.preventDefault();
                    setHoverTarget({ slotIndex: sIndex, type: 'pool' });
                  }}
                  onDragLeave={() => {
                    if (hoverTarget?.slotIndex === sIndex && hoverTarget.type === 'pool') {
                      setHoverTarget(null);
                    }
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    dropOnPool(sIndex);
                    handleDragEnd();
                  }}
                >
                  {st.poolItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      draggable
                      className={`game2-pool-card ${dragInfo?.itemId === item.id ? 'is-dragging' : ''}`}
                      onTouchStart={e => handleTouchStart(sIndex, item, 'pool', undefined, e)}
                      onTouchMove={e => handleTouchMove(sIndex, e)}
                      onTouchEnd={() => handleTouchEnd(sIndex, item, 'pool')}
                      onTouchCancel={handleDragEnd}
                      onDragStart={e => handleDragStart(sIndex, item, 'pool', undefined, e)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleSelectPoolCard(sIndex, item)}
                      title="Chạm hoặc kéo vào ô đáp án ở trên"
                    >
                      <span className="pool-card-text">{item.text}</span>
                      <span className="pool-card-arrow">↑</span>
                    </button>
                  ))}

                  {st.poolItems.length === 0 && (
                    <div className="game2-pool-all-placed">
                      ✓ Đã xếp toàn bộ cụm từ lên ô đáp án
                    </div>
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
                  : 'Hãy xem các cụm có đánh dấu ĐỎ "✕ Sai" ở trên để đổi chỗ rồi kiểm tra lại.'}
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
