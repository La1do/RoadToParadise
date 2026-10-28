import React, { useEffect, useState } from 'react';
import StickerReaction from './StickerReaction.jsx';
import './AnswerInputCompanion.css';

export function getInputCompanionState({ value = '', grade, focused, typing, revising }) {
  if (grade) return { phase: grade.isExact ? 'correct' : 'incorrect', type: grade.isExact ? 'determined' : 'shocked' };
  if (!value.trim()) return {
    phase: focused ? 'ready' : 'idle', type: 'cat_please',
    text: focused ? 'Mèo sẵn sàng rồi, bắt đầu gõ nào!' : 'Mèo chờ bạn trả lời nè. Thử nhớ từng ý nhé!'
  };
  if (revising) return { phase: 'revising', type: 'cat_fist', text: 'Sửa từng chút thôi! Khi xong, kiểm tra lại nhé.' };
  if (typing) return { phase: 'typing', type: 'cat_loading', text: 'Mèo đang theo dõi nè, cứ viết tiếp nhé!' };
  return { phase: 'draft', type: 'cat_confused', text: 'Cứ thong thả nhớ lại. Xong rồi thì bấm kiểm tra nhé!' };
}

/** Mèo ở trong cùng khung nhập, có vùng riêng để không che chữ hay con trỏ. */
export default function AnswerInputCompanion({ children, value = '', grade, className = '', exam = false }) {
  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(false);
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    if (grade) setRevising(!grade.isExact);
    else if (!value.trim()) setRevising(false);
  }, [grade, value]);

  useEffect(() => {
    if (!focused || !value || grade) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const timer = setTimeout(() => setTyping(false), 1400);
    return () => clearTimeout(timer);
  }, [value, focused, grade]);

  const state = getInputCompanionState({ value, grade, focused, typing, revising });
  const text = exam && value.trim() && !grade
    ? (typing ? 'Cứ viết theo trí nhớ nhé, mèo đang cổ vũ!' : 'Đọc lại ý này trước khi nộp bài nhé!')
    : state.text;

  return (
    <div
      className={`answer-input-companion phase-${state.phase} ${className}`}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {children}
      <div className="answer-input-companion__resident">
        <StickerReaction
          type={state.type}
          grade={grade}
          text={text}
          size="xl"
          layout="horizontal"
          animate={grade?.isExact ? 'bounce' : grade ? 'shake' : 'none'}
          className="answer-input-companion__cat"
        />
      </div>
    </div>
  );
}
