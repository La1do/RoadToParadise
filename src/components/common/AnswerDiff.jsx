import React from 'react';
import './AnswerDiff.css';

/** Render the grading engine's ordered diff without changing its alignment or score. */
export default function AnswerDiff({ diff, userTokensResult, variant = 'default', className = '' }) {
  const tokens = diff?.length
    ? diff
    : (userTokensResult || []).map(({ text, status }) => ({ text, type: status }));
  const segments = [];

  for (const token of tokens) {
    const previous = segments[segments.length - 1];
    if (token.type === 'missing' && previous?.type === 'missing') {
      previous.text += ` ${token.text}`;
    } else {
      // Copy each token so grouping never mutates the grade result.
      segments.push({ ...token });
    }
  }

  return (
    <div className={`answer-diff answer-diff--${variant} ${className}`.trim()}>
      {segments.length ? segments.map((segment, index) => {
        const tokenClass = `answer-diff__token answer-diff__token--${segment.type}`;
        if (segment.type === 'missing') {
          return (
            <ins key={index} className={tokenClass} title="Cụm từ còn thiếu (thêm vào)">
              {`(+ ${segment.text})`}
            </ins>
          );
        }
        if (segment.type === 'wrong') {
          return (
            <del key={index} className={tokenClass} title="Từ dư / sai (gạch bỏ)">
              {segment.text}
            </del>
          );
        }
        return <span key={index} className={tokenClass} title="Từ đúng">{segment.text}</span>;
      }) : (
        <span className="answer-diff__empty">(Chưa nhập câu trả lời)</span>
      )}
    </div>
  );
}
