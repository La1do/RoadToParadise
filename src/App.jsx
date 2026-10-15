import React, { useState } from 'react';
import questionsData from './data/questions.json';
import {
  compareAnswer,
  generateExerciseForStep,
  evaluateStepSubmission,
  LEARNING_STEPS,
  getNextWordHint
} from './core';

export default function App() {
  const [selectedQuestion, setSelectedQuestion] = useState(questionsData.questions[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [gradeResult, setGradeResult] = useState(null);
  const [hint, setHint] = useState(null);

  const slot = selectedQuestion.slots[selectedSlotIndex] || selectedQuestion.slots[0];
  const exercise = generateExerciseForStep(selectedStep, slot);

  const handleCheck = () => {
    const result = compareAnswer(userInput, slot.answer);
    setGradeResult(result);
  };

  const handleGetHint = () => {
    const h = getNextWordHint(userInput, slot.answer);
    setHint(h);
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1rem' }}>
      <header style={{ borderBottom: '2px solid #ddd', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Một Đời Người, Một Con Đường</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
          Core Engines Test Bench (Lõi chấm điểm, 6 bậc học, gợi ý, SRS & Sổ tiếc nuối)
        </p>
      </header>

      {/* Chọn câu */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
          Chọn câu hỏi (Tổng 20 câu - 4 chặng):
        </label>
        <select
          value={selectedQuestion.id}
          onChange={e => {
            const q = questionsData.questions.find(item => item.id === Number(e.target.value));
            setSelectedQuestion(q);
            setSelectedSlotIndex(0);
            setUserInput('');
            setGradeResult(null);
            setHint(null);
          }}
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' }}
        >
          {questionsData.questions.map(q => (
            <option key={q.id} value={q.id}>
              Câu {q.id} (Chặng {q.stageId}): {q.question.slice(0, 80)}...
            </option>
          ))}
        </select>
      </section>

      {/* Nội dung câu hỏi & chọn ô */}
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '0.8rem', lineHeight: 1.5 }}>
          <strong>Nội dung câu:</strong> {selectedQuestion.question}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Chọn ô:</span>
          {selectedQuestion.slots.map((s, idx) => (
            <button
              key={s.slotIndex}
              onClick={() => {
                setSelectedSlotIndex(idx);
                setUserInput('');
                setGradeResult(null);
                setHint(null);
              }}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: 4,
                cursor: 'pointer',
                border: selectedSlotIndex === idx ? '2px solid #0066cc' : '1px solid #ccc',
                background: selectedSlotIndex === idx ? '#e6f0ff' : '#fff',
                fontWeight: selectedSlotIndex === idx ? 'bold' : 'normal'
              }}
            >
              Ô {s.label} ({s.title || `Ô ${s.slotIndex}`})
            </button>
          ))}
        </div>
      </div>

      {/* Chọn bậc học */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
          Chọn bậc học thử nghiệm (1 - 6):
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {LEARNING_STEPS.map(st => (
            <button
              key={st.id}
              onClick={() => {
                setSelectedStep(st.id);
                setGradeResult(null);
                setHint(null);
              }}
              style={{
                padding: '0.6rem 0.4rem',
                fontSize: '0.85rem',
                borderRadius: 4,
                border: selectedStep === st.id ? '2px solid #28a745' : '1px solid #ccc',
                background: selectedStep === st.id ? '#e8f5e9' : '#fff',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <strong>Bậc {st.id}</strong>
              <div>{st.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Màn hình tương tác bài tập theo bậc */}
      <div style={{ border: '1px solid #e0e0e0', padding: '1.2rem', borderRadius: 8, marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>
          Bậc {selectedStep}: {LEARNING_STEPS.find(s => s.id === selectedStep)?.name}
        </h3>

        {selectedStep === 1 && (
          <div style={{ background: '#fff3cd', padding: '0.8rem', borderRadius: 4, marginBottom: '1rem' }}>
            <strong>Đáp án mẫu để chép:</strong> {slot.answer}
          </div>
        )}

        {selectedStep === 2 && (
          <div style={{ marginBottom: '1rem' }}>
            <p>Các cụm từ cần sắp xếp:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {exercise.shuffledItems?.map(item => (
                <span
                  key={item.id}
                  style={{
                    background: '#e9ecef',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 20,
                    border: '1px solid #ced4da'
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedStep === 3 && (
          <div style={{ marginBottom: '1rem', lineHeight: 1.8, fontSize: '1.1rem' }}>
            <strong>Văn bản khuyết (30%):</strong>{' '}
            {exercise.template?.map((t, i) => (
              <span
                key={i}
                style={{
                  color: t.isMasked ? '#dc3545' : '#212529',
                  fontWeight: t.isMasked ? 'bold' : 'normal',
                  marginRight: '0.3rem'
                }}
              >
                {t.display}
              </span>
            ))}
          </div>
        )}

        {selectedStep === 4 && (
          <div style={{ marginBottom: '1rem', lineHeight: 1.8, fontSize: '1.1rem' }}>
            <strong>Văn bản khuyết (60%):</strong>{' '}
            {exercise.template?.map((t, i) => (
              <span
                key={i}
                style={{
                  color: t.isMasked ? '#dc3545' : '#212529',
                  fontWeight: t.isMasked ? 'bold' : 'normal',
                  marginRight: '0.3rem'
                }}
              >
                {t.display}
              </span>
            ))}
          </div>
        )}

        {selectedStep === 5 && (
          <div style={{ marginBottom: '1rem', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.1rem' }}>
            <strong>Gợi ý ký tự đầu:</strong> {exercise.hintText}
          </div>
        )}

        {/* Ô nhập liệu cho các bậc gõ */}
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem' }}>
            Nhập câu trả lời của bạn:
          </label>
          <textarea
            rows={3}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Gõ đáp án vào đây..."
            style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
          <button
            onClick={handleCheck}
            style={{
              padding: '0.6rem 1.4rem',
              background: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Chấm điểm
          </button>

          <button
            onClick={handleGetHint}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Gợi ý 1 từ
          </button>
        </div>

        {hint && (
          <div style={{ marginTop: '0.8rem', background: '#fff3cd', padding: '0.6rem', borderRadius: 4 }}>
            💡 Gợi ý từ tiếp theo: <strong>"{hint.hintWord}"</strong> (Còn {hint.remainingWordCount} từ nữa)
          </div>
        )}
      </div>

      {/* Hiển thị kết quả chấm điểm */}
      {gradeResult && (
        <section
          style={{
            border: gradeResult.isExact ? '2px solid #28a745' : '2px solid #dc3545',
            background: gradeResult.isExact ? '#f0fff4' : '#fff5f5',
            padding: '1.2rem',
            borderRadius: 8
          }}
        >
          <h3 style={{ margin: '0 0 0.8rem 0', color: gradeResult.isExact ? '#28a745' : '#dc3545' }}>
            {gradeResult.isExact ? 'Chính xác 100%!' : `Chưa đúng hoàn toàn (${gradeResult.accuracy}%)`}
          </h3>

          <div style={{ marginBottom: '0.8rem' }}>
            <strong>Phân tích bài làm của bạn (Tô đỏ từ sai):</strong>
            <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {gradeResult.userTokensResult.map((tok, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    background: tok.status === 'correct' ? '#d4edda' : '#f8d7da',
                    color: tok.status === 'correct' ? '#155724' : '#721c24',
                    border: tok.status === 'correct' ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
                    fontWeight: tok.status === 'correct' ? 'normal' : 'bold'
                  }}
                >
                  {tok.text}
                </span>
              ))}
            </div>
          </div>

          {!gradeResult.isExact && (
            <div>
              <strong>Đáp án chuẩn (Tô vàng từ còn thiếu):</strong>
              <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {gradeResult.targetTokensResult.map((tok, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: 4,
                      background: tok.status === 'correct' ? '#e2e3e5' : '#fff3cd',
                      color: tok.status === 'correct' ? '#383d41' : '#856404',
                      border: tok.status === 'correct' ? '1px solid #d6d8db' : '1px solid #ffeeba',
                      fontWeight: tok.status === 'missing' ? 'bold' : 'normal'
                    }}
                  >
                    {tok.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
