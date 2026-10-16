import React, { useState } from 'react';
import {
  getStoredUserName,
  setUserAuthenticated,
  parseUpperNoAccent
} from '../../utils/cookie.js';
import './LoginModal.css';

export default function LoginModal({ onLoginSuccess }) {
  const [name, setName] = useState(() => getStoredUserName() || '');
  const [answer, setAnswer] = useState('');
  // questionId: 1 = "Chủ đề của KV sẽ quay là gì?" | 2 = "KV hiện tại của bạn là gì?"
  const [questionId, setQuestionId] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Đáp án câu 2 lấy từ .env (VITE_KV_CURRENT_ANSWER), fallback "B6"
  const KV_CURRENT_ANSWER = import.meta.env.VITE_KV_CURRENT_ANSWER || 'B6';
  // Đáp án câu 1 lấy từ .env hoặc mặc định "Thể thao"
  const KV_TOPIC_ANSWER = import.meta.env.VITE_KV_TOPIC_ANSWER || 'Thể thao';

  const questions = {
    1: {
      id: 1,
      label: 'Chủ đề của KV sẽ quay video là gì? (gợi ý 2 từ)',
      placeholder: 'Nhập câu trả lời...',
      expectedRaw: KV_TOPIC_ANSWER,
      expectedParsed: parseUpperNoAccent(KV_TOPIC_ANSWER) || 'THETHAO'
    },
    2: {
      id: 2,
      label: 'KV của bạn là gì? (gợi ý 1 từ có 2 chữ)',
      placeholder: 'Nhập câu trả lời...',
      expectedRaw: KV_CURRENT_ANSWER,
      expectedParsed: parseUpperNoAccent(KV_CURRENT_ANSWER) || 'B6'
    }
  };

  const currentQ = questions[questionId];

  // Đổi qua lại giữa 2 câu hỏi bảo mật
  const handleSwitchQuestion = () => {
    setQuestionId(prev => (prev === 1 ? 2 : 1));
    setAnswer('');
    setErrorMessage('');
  };

  const triggerError = (msg) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      triggerError('Vui lòng nhập tên của bạn vào ô 1 để tiếp tục!');
      return;
    }

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      triggerError('Vui lòng nhập câu trả lời vào ô 2 để đăng nhập!');
      return;
    }

    // Parse viết hoa hết và không dấu
    const parsedUserAnswer = parseUpperNoAccent(trimmedAnswer);
    const parsedExpected = currentQ.expectedParsed;

    // Chỉ check ô thứ 2: trả lời đúng 1 trong 2 câu hỏi sẽ đăng nhập được
    if (parsedUserAnswer === parsedExpected) {
      setErrorMessage('');
      setUserAuthenticated(trimmedName);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(trimmedName);
      }
    } else {
      triggerError('Đáp án chưa chính xác! Hãy kiểm tra lại hoặc đổi câu hỏi.');
    }
  };

  return (
    <div className="login-modal-overlay" role="dialog" aria-modal="true">
      <div className={`login-modal-dialog ${isShaking ? 'login-shake' : ''}`}>
        {/* Header với linh vật chim cánh cụt chào mừng */}
        <div className="login-modal-header">
          <div className="login-mascot-wrap">
            <img
              src="/stickers/cheer.png"
              alt="Anh em thi thử nhé 0.0"
              className="login-mascot-img"
              draggable="false"
            />
          </div>
          <h2 className="login-modal-title">Chào Mừng Bạn!</h2>
          <p className="login-modal-subtitle">
            Nhập tên và trả lời câu hỏi xác thực để vào ôn luyện
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Ô 1: TÊN */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="user-name-input">
              <span className="label-badge">Ô 1</span> Tên:
            </label>
            <input
              id="user-name-input"
              type="text"
              className="login-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Nhập tên của bạn..."
              autoFocus
              autoComplete="name"
            />
          </div>

          {/* Ô 2: CÂU HỎI XÁC THỰC */}
          <div className="login-form-group">
            <div className="login-question-header">
              <label className="login-label" htmlFor="user-answer-input">
                <span className="label-badge">Ô 2</span> {currentQ.label}
              </label>
            </div>

            <input
              id="user-answer-input"
              type="text"
              className={`login-input ${errorMessage ? 'input-error' : ''}`}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={currentQ.placeholder}
              autoComplete="off"
            />

            {/* Nút đổi câu hỏi nếu không trả lời được */}
            <div className="login-switch-row">
              <button
                type="button"
                className="login-switch-btn"
                onClick={handleSwitchQuestion}
                title="Bấm để đổi sang câu hỏi khác"
              >
                🔄 Không nhớ câu này? Đổi câu hỏi
              </button>
            </div>
          </div>

          {/* Thông báo lỗi nếu trả lời sai */}
          {errorMessage && (
            <div className="login-error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{errorMessage}</span>
            </div>
          )}

          {/* Nút đăng nhập */}
          <button type="submit" className="login-submit-btn">
            Vào học bài ngay →
          </button>
        </form>
      </div>
    </div>
  );
}
