import React, { useState } from 'react';
import questionsData from './data/questions.json';
import {
  compareAnswer,
  generateExerciseForStep,
  LEARNING_STEPS,
  getNextWordHint
} from './core';
import { Game1Copy, Game2Scramble, GameResultModal } from './components/games';
import CharacterDemo from './components/character/CharacterDemo';
import DayRoadMap from './components/map/DayRoadMap';
import { CutscenePlayer, FirstPersonIntro, CUTSCENES } from './components/cutscenes';

export default function App() {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cutscene' | 'game1' | 'game2' | 'character' | 'bench'
  const [selectedQuestion, setSelectedQuestion] = useState(questionsData.questions[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [cutsceneStageId, setCutsceneStageId] = useState(1);
  const [modalResult, setModalResult] = useState(null);

  // Bench mode state
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

  const navItems = [
    { id: 'map', label: '🗺️ Bản đồ' },
    { id: 'pov', label: '📱 Cảnh mở đầu (POV)' },
    { id: 'cutscene', label: '🎬 Kịch bản' },
    { id: 'game1', label: '✍️ Chép lại' },
    { id: 'game2', label: '🧩 Xáo từ' },
    { id: 'character', label: '👤 Nhân vật Minh' },
    { id: 'bench', label: '🧪 Core Bench' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '0.6rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>✦</span>
          <strong style={{ fontSize: '1.05rem', letterSpacing: '0.02rem' }}>Một Đời Người, Một Con Đường</strong>
        </div>

        <nav style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 6,
                border: 'none',
                background: viewMode === item.id ? '#0284c7' : '#334155',
                color: viewMode === item.id ? '#fff' : '#cbd5e1',
                cursor: 'pointer',
                fontWeight: viewMode === item.id ? 'bold' : 'normal',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {/* 1. Bản đồ một ngày */}
        {viewMode === 'map' && (
          <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', background: '#090d16' }}>
            <DayRoadMap
              onSelectAction={({ mode, question, slotIndex, stepId }) => {
                setSelectedQuestion(question);
                setSelectedSlotIndex(slotIndex || 0);
                if (stepId === 2) {
                  setViewMode('game2');
                } else {
                  setSelectedStep(stepId || 1);
                  setViewMode('game1');
                }
              }}
            />
          </div>
        )}

        {/* 1.5. Cảnh mở đầu góc nhìn thứ nhất (POV Intro) */}
        {viewMode === 'pov' && (
          <div style={{ width: '100%', maxWidth: 430, margin: '1rem auto' }}>
            <FirstPersonIntro
              tenNhanVat="Minh"
              soCau={selectedQuestion.id}
              noiDungCauHoi={selectedQuestion.question}
              dapAnMau={selectedQuestion.fullAnswer || slot.answer}
              chang={selectedQuestion.stageId}
              onStartGame1={({ userInput: typed }) => {
                setUserInput(typed || '');
                setViewMode('game1');
              }}
              onSkip={() => {}}
            />
          </div>
        )}

        {/* 2. Cảnh Kịch Bản (Cutscene Player) */}
        {viewMode === 'cutscene' && (
          <div style={{ width: '100%', maxWidth: 430, margin: '1rem auto' }}>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
              {[1, 2, 3, 4].map(sId => (
                <button
                  key={sId}
                  onClick={() => setCutsceneStageId(sId)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 4,
                    border: 'none',
                    background: cutsceneStageId === sId ? '#f59e0b' : '#334155',
                    color: cutsceneStageId === sId ? '#000' : '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Chặng {sId}
                </button>
              ))}
            </div>

            <CutscenePlayer
              key={cutsceneStageId}
              stageId={cutsceneStageId}
              onComplete={() => setViewMode('map')}
              onSkip={() => setViewMode('map')}
            />
          </div>
        )}

        {/* 3. Game 1: Chép lại (Học cả câu) */}
        {viewMode === 'game1' && (
          <div style={{ width: '100%', maxWidth: 430, padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <button
                onClick={() => setViewMode('map')}
                style={{ background: '#334155', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer' }}
              >
                ← Trở về bản đồ
              </button>
              <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold' }}>
                Học cả câu {selectedQuestion.id} (Chặng {selectedQuestion.stageId})
              </span>
            </div>

            <Game1Copy
              slot={selectedQuestion}
              questionText={selectedQuestion.question}
              onComplete={res => setModalResult(res.gradeResult)}
              onNext={() => setViewMode('game2')}
            />
          </div>
        )}

        {/* 4. Game 2: Xáo từ (Học cả câu) */}
        {viewMode === 'game2' && (
          <div style={{ width: '100%', maxWidth: 430, padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <button
                onClick={() => setViewMode('map')}
                style={{ background: '#334155', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer' }}
              >
                ← Trở về bản đồ
              </button>
              <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold' }}>
                Học cả câu {selectedQuestion.id} (Chặng {selectedQuestion.stageId})
              </span>
            </div>

            <Game2Scramble
              slot={selectedQuestion}
              questionText={selectedQuestion.question}
              onComplete={res => setModalResult(res.reinforceGrade)}
              onNext={() => setViewMode('map')}
            />
          </div>
        )}

        {/* 5. Nhân vật Minh */}
        {viewMode === 'character' && (
          <div style={{ width: '100%', padding: '1rem', boxSizing: 'border-box' }}>
            <CharacterDemo />
          </div>
        )}

        {/* 6. Core Bench */}
        {viewMode === 'bench' && (
          <div style={{ width: '100%', maxWidth: 850, margin: '1.5rem auto', padding: '0 1rem', color: '#0f172a' }}>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0 }}>Core Engines Test Bench</h2>

              {/* Chọn câu */}
              <section style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>
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
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.95rem', borderRadius: 4, border: '1px solid #ccc' }}
                >
                  {questionsData.questions.map(q => (
                    <option key={q.id} value={q.id}>
                      Câu {q.id} (Chặng {q.stageId}): {q.question.slice(0, 80)}...
                    </option>
                  ))}
                </select>
              </section>

              {/* Chọn ô */}
              <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: 6, marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Nội dung câu:</strong> {selectedQuestion.question}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                        padding: '0.3rem 0.6rem',
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

              {/* Chọn bậc */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem', marginBottom: '1rem' }}>
                {LEARNING_STEPS.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setSelectedStep(st.id);
                      setGradeResult(null);
                      setHint(null);
                    }}
                    style={{
                      padding: '0.5rem 0.3rem',
                      fontSize: '0.8rem',
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

              {/* Bậc đang chọn */}
              <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: 6, marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Bậc {selectedStep}: {LEARNING_STEPS.find(s => s.id === selectedStep)?.name}</h4>
                <div style={{ background: '#fffbeb', padding: '0.6rem', borderRadius: 4, marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                  <strong>Đáp án mẫu:</strong> {slot.answer}
                </div>

                <textarea
                  rows={3}
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Gõ đáp án để test chấm điểm..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleCheck}
                    style={{ padding: '0.5rem 1rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Chấm điểm
                  </button>
                  <button
                    onClick={handleGetHint}
                    style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Gợi ý 1 từ
                  </button>
                </div>

                {hint && (
                  <div style={{ marginTop: '0.5rem', background: '#fef3c7', padding: '0.5rem', borderRadius: 4, fontSize: '0.9rem' }}>
                    💡 Từ tiếp theo: <strong>"{hint.hintWord}"</strong> (Còn {hint.remainingWordCount} từ)
                  </div>
                )}
              </div>

              {/* Kết quả chấm điểm */}
              {gradeResult && (
                <div style={{ border: gradeResult.isExact ? '1px solid #86efac' : '1px solid #fca5a5', background: gradeResult.isExact ? '#f0fdf4' : '#fef2f2', padding: '1rem', borderRadius: 6 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: gradeResult.isExact ? '#16a34a' : '#dc2626' }}>
                    {gradeResult.isExact ? 'Chính xác 100%!' : `Độ chính xác: ${gradeResult.accuracy}%`}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {gradeResult.userTokensResult.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: 3,
                          background: t.status === 'correct' ? '#bbf7d0' : '#fecaca',
                          color: t.status === 'correct' ? '#14532d' : '#991b1b',
                          fontWeight: t.status === 'correct' ? 'normal' : 'bold'
                        }}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Result Modal nếu có */}
      {modalResult && (
        <GameResultModal
          gradeResult={modalResult}
          slotTitle={`Câu ${selectedQuestion.id} - Ô ${slot.label}`}
          onRetry={() => setModalResult(null)}
          onContinue={() => {
            setModalResult(null);
            setViewMode('map');
          }}
        />
      )}
    </div>
  );
}
