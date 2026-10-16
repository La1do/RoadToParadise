import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import permissions from './config/permissions.json';
import {
  compareAnswer,
  generateExerciseForStep,
  LEARNING_STEPS,
  getNextWordHint
} from './core';
import { Game1Copy, Game2Scramble, GameResultModal, FirstPersonMotorbikeGame2 } from './components/games';
import CharacterDemo from './components/character/CharacterDemo';
import DayRoadMap from './components/map/DayRoadMap';
import { CutscenePlayer, FirstPersonIntro, CUTSCENES } from './components/cutscenes';
import { CustomExamReview } from './components/exam';

export function isTabEnabled(tabId) {
  if (Array.isArray(permissions.enabledTabs)) {
    return permissions.enabledTabs.includes(tabId);
  }
  if (permissions.tabs && typeof permissions.tabs === 'object') {
    return Boolean(permissions.tabs[tabId]);
  }
  return true;
}

export default function App() {
  const defaultTab = permissions.defaultTab || 'map';
  const appTitle = permissions.title || 'Road to Paradise';
  const homeTab = isTabEnabled('map') ? 'map' : (isTabEnabled(defaultTab) ? defaultTab : 'custom-practice');

  const [viewMode, setViewMode] = useState(isTabEnabled(defaultTab) ? defaultTab : 'custom-practice');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Đảm bảo nếu tab hiện tại bị ẩn theo permissions.json thì tự động chuyển về tab mặc định hợp lệ
  useEffect(() => {
    if (!isTabEnabled(viewMode)) {
      setViewMode(homeTab);
    }
  }, [viewMode, homeTab]);

  const [selectedQuestion, setSelectedQuestion] = useState(questionsData.questions[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [cutsceneStageId, setCutsceneStageId] = useState(1);
  const [modalResult, setModalResult] = useState(null);
  // Lưu trạng thái làm bài Game 2 để chuyển câu không bị mất đáp án
  const [game2Progress, setGame2Progress] = useState({});

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
    { id: 'custom-practice', label: '🎯 Ôn & Thi riêng' },
    { id: 'pov', label: '📱 Cảnh mở đầu (POV)' },
    { id: 'cutscene', label: '🎬 Kịch bản' },
    { id: 'game1', label: '✍️ Chép lại' },
    { id: 'game2', label: '🧩 Xáo từ' },
    { id: 'motorbike', label: '🛵 Xe máy Wave (POV)' },
    { id: 'character', label: '👤 Nhân vật Minh' },
    { id: 'bench', label: '🧪 Core Bench' }
  ];

  const visibleNavItems = navItems.filter(item => isTabEnabled(item.id));
  const hasMultipleTabs = visibleNavItems.length > 1;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eef6fc 0%, #ffffff 35%, #eef6fc 100%)', color: '#1c3553', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .app-desktop-nav {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .app-mobile-menu-btn {
          display: none;
          background: #eef6fc;
          border: 1.5px solid #c5def3;
          color: #1c3553;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .app-mobile-menu-btn:hover {
          background: #c5def3;
        }
        .app-sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 999;
          animation: appFadeIn 0.2s ease-out;
        }
        .app-sidebar-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 290px;
          max-width: 82vw;
          background: #ffffff;
          z-index: 1000;
          box-shadow: -4px 0 24px rgba(74, 130, 184, 0.25);
          display: flex;
          flex-direction: column;
          animation: appSlideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .app-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.2rem;
          border-bottom: 1.5px solid #eef6fc;
          background: #f8fbfe;
        }
        .app-sidebar-close-btn {
          background: #eef6fc;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-sidebar-list {
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          overflow-y: auto;
          flex: 1;
        }
        .app-sidebar-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1.5px solid transparent;
          background: #f8fbfe;
          color: #1c3553;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          min-height: 48px;
          transition: all 0.15s ease;
        }
        .app-sidebar-item:hover {
          background: #eef6fc;
        }
        .app-sidebar-item.active {
          background: #eef6fc;
          border-color: #7bb5e8;
          color: #4a82b8;
          font-weight: 700;
        }
        .app-sidebar-check {
          color: #4a82b8;
          font-weight: bold;
        }
        @keyframes appFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes appSlideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 767px) {
          .app-desktop-nav {
            display: none !important;
          }
          .app-mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          borderBottom: '2px solid #c5def3',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 18px rgba(74, 130, 184, 0.12)'
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          onClick={() => {
            if (hasMultipleTabs && window.innerWidth < 768) {
              setIsSidebarOpen(true);
            } else {
              setViewMode(homeTab);
            }
          }}
          title={hasMultipleTabs && typeof window !== 'undefined' && window.innerWidth < 768 ? "Mở danh mục" : "Trở về trang chính"}
        >
          <img
            src="/logo.png"
            alt="Logo Cảnh sát học bài"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #7bb5e8',
              boxShadow: '0 0 10px rgba(123, 181, 232, 0.45)',
              flexShrink: 0
            }}
          />
          <strong style={{ fontSize: '1.05rem', letterSpacing: '0.02rem', color: '#1c3553' }}>{appTitle}</strong>
        </div>

        {/* Desktop Navbar */}
        <nav className="app-desktop-nav">
          {visibleNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 20,
                border: viewMode === item.id ? '2px solid #4a82b8' : '1.5px solid #c5def3',
                background: viewMode === item.id ? '#4a82b8' : '#eef6fc',
                color: viewMode === item.id ? '#ffffff' : '#1c3553',
                cursor: 'pointer',
                fontWeight: viewMode === item.id ? 'bold' : '600',
                fontSize: '0.85rem',
                boxShadow: viewMode === item.id ? '0 2px 8px rgba(74, 130, 184, 0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger Menu Button (chỉ hiện khi có nhiều hơn 1 tab) */}
        {hasMultipleTabs && (
          <button
            type="button"
            className="app-mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở danh mục điều hướng"
          >
            ☰
          </button>
        )}
      </header>

      {/* Mobile Sidebar Drawer */}
      {hasMultipleTabs && isSidebarOpen && (
        <>
          <div className="app-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
          <aside className="app-sidebar-drawer">
            <div className="app-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #7bb5e8' }}
                />
                <strong style={{ fontSize: '0.98rem', color: '#1c3553' }}>{appTitle}</strong>
              </div>
              <button
                type="button"
                className="app-sidebar-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                title="Đóng danh mục"
              >
                ✕
              </button>
            </div>
            <div className="app-sidebar-list">
              {visibleNavItems.map(item => (
                <button
                  key={item.id}
                  className={`app-sidebar-item ${viewMode === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode(item.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  {viewMode === item.id && <span className="app-sidebar-check">✓</span>}
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {/* 1. Bản đồ một ngày */}
        {viewMode === 'map' && isTabEnabled('map') && (
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', background: '#090d16' }}>
            <DayRoadMap
              onSelectAction={({ mode, question, slotIndex, stepId }) => {
                setSelectedQuestion(question);
                setSelectedSlotIndex(slotIndex || 0);
                if (stepId === 2) {
                  setViewMode(isTabEnabled('game2') ? 'game2' : homeTab);
                } else {
                  setSelectedStep(stepId || 1);
                  setViewMode(isTabEnabled('game1') ? 'game1' : homeTab);
                }
              }}
            />
          </div>
        )}

        {/* 1.2. Chế độ Ôn tập Xáo từ & Thi riêng tự chọn (Tab riêng) */}
        {viewMode === 'custom-practice' && isTabEnabled('custom-practice') && (
          <div style={{ width: '100%', maxWidth: 1440, padding: '1.2rem', boxSizing: 'border-box' }}>
            <CustomExamReview onBackToMap={() => setViewMode(homeTab)} />
          </div>
        )}

        {/* 1.5. Cảnh mở đầu góc nhìn thứ nhất (POV Intro) */}
        {viewMode === 'pov' && isTabEnabled('pov') && (
          <div style={{ width: '100%', maxWidth: 1100, margin: '1rem auto' }}>
            <FirstPersonIntro
              tenNhanVat="Minh"
              soCau={selectedQuestion.id}
              noiDungCauHoi={selectedQuestion.question}
              dapAnMau={selectedQuestion.fullAnswer || slot.answer}
              chang={selectedQuestion.stageId}
              onStartGame1={({ userInput: typed }) => {
                setUserInput(typed || '');
                setViewMode(isTabEnabled('game1') ? 'game1' : homeTab);
              }}
              onSkip={() => {}}
            />
          </div>
        )}

        {/* 2. Cảnh Kịch Bản (Cutscene Player) */}
        {viewMode === 'cutscene' && isTabEnabled('cutscene') && (
          <div style={{ width: '100%', maxWidth: 900, margin: '1rem auto' }}>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.8rem' }}>
              {[1, 2, 3, 4].map(sId => (
                <button
                  key={sId}
                  onClick={() => setCutsceneStageId(sId)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 20,
                    border: cutsceneStageId === sId ? '2px solid #4a82b8' : '1.5px solid #c5def3',
                    background: cutsceneStageId === sId ? '#4a82b8' : '#ffffff',
                    color: cutsceneStageId === sId ? '#ffffff' : '#1c3553',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(74, 130, 184, 0.15)'
                  }}
                >
                  Chặng {sId}
                </button>
              ))}
            </div>

            <CutscenePlayer
              key={cutsceneStageId}
              stageId={cutsceneStageId}
              onComplete={() => setViewMode(homeTab)}
              onSkip={() => setViewMode(homeTab)}
            />
          </div>
        )}

        {/* 3. Game 1: Chép lại (Học cả câu - tách từng ô input cho từng ý) */}
        {viewMode === 'game1' && isTabEnabled('game1') && (
          <div style={{ width: '100%', maxWidth: 1440, padding: '1.2rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <button
                onClick={() => setViewMode(homeTab)}
                style={{ background: '#ffffff', border: '1.5px solid #c5def3', color: '#4a82b8', padding: '0.5rem 1rem', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(74, 130, 184, 0.12)' }}
              >
                ← Trở về bản đồ
              </button>
              <span style={{ fontSize: '1rem', color: '#4a82b8', fontWeight: 'bold' }}>
                Học Câu {selectedQuestion.id} (Chặng {selectedQuestion.stageId}) • Tách riêng từng ý
              </span>
            </div>

            <Game1Copy
              question={selectedQuestion}
              onComplete={res => setModalResult(res.summary ? { isExact: res.isExact, accuracy: res.summary.avgAccuracy } : res.gradeResult)}
              onNext={() => setViewMode(isTabEnabled('game2') ? 'game2' : homeTab)}
            />
          </div>
        )}

        {/* 4. Game 2: Xáo từ (Học cả câu - tách từng ô theo từng ý) */}
        {viewMode === 'game2' && isTabEnabled('game2') && (
          <div style={{ width: '100%', maxWidth: 1440, padding: '1.2rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setViewMode(homeTab)}
                  style={{ background: '#ffffff', border: '1.5px solid #c5def3', color: '#4a82b8', padding: '0.5rem 1rem', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(74, 130, 184, 0.12)' }}
                >
                  ← Trở về bản đồ
                </button>

                {/* Điều hướng nhanh câu trước / câu sau */}
                <button
                  disabled={selectedQuestion.id <= 1}
                  onClick={() => {
                    const prevQ = questionsData.questions.find(q => q.id === selectedQuestion.id - 1);
                    if (prevQ) {
                      setSelectedQuestion(prevQ);
                      setSelectedSlotIndex(0);
                    }
                  }}
                  style={{
                    background: selectedQuestion.id <= 1 ? '#f0f4f8' : '#ffffff',
                    color: selectedQuestion.id <= 1 ? '#8fa4b8' : '#4a82b8',
                    border: '1.5px solid #c5def3',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 20,
                    cursor: selectedQuestion.id <= 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  ← Câu trước
                </button>

                <button
                  disabled={selectedQuestion.id >= questionsData.questions.length}
                  onClick={() => {
                    const nextQ = questionsData.questions.find(q => q.id === selectedQuestion.id + 1);
                    if (nextQ) {
                      setSelectedQuestion(nextQ);
                      setSelectedSlotIndex(0);
                    }
                  }}
                  style={{
                    background: selectedQuestion.id >= questionsData.questions.length ? '#f0f4f8' : '#ffffff',
                    color: selectedQuestion.id >= questionsData.questions.length ? '#8fa4b8' : '#4a82b8',
                    border: '1.5px solid #c5def3',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 20,
                    cursor: selectedQuestion.id >= questionsData.questions.length ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Câu sau →
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', color: '#4a82b8', fontWeight: 'bold' }}>
                  Học Câu {selectedQuestion.id} (Chặng {selectedQuestion.stageId}) • Xáo từ
                </span>
                {isTabEnabled('motorbike') && (
                  <button
                    onClick={() => setViewMode('motorbike')}
                    style={{ background: '#7bb5e8', border: '1.5px solid #4a82b8', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(74, 130, 184, 0.25)' }}
                  >
                    🛵 Chuyển sang góc nhìn xe máy
                  </button>
                )}
              </div>
            </div>

            <Game2Scramble
              key={selectedQuestion.id}
              question={selectedQuestion}
              slot={selectedQuestion}
              questionText={selectedQuestion.question}
              initialState={game2Progress[selectedQuestion.id]}
              onStateChange={state => {
                setGame2Progress(prev => ({
                  ...prev,
                  [selectedQuestion.id]: state
                }));
              }}
              onComplete={res => setModalResult(res.summary ? { isExact: res.isExact, accuracy: res.summary.avgAccuracy } : res.reinforceGrade)}
              onNext={() => {
                const nextQ = questionsData.questions.find(q => q.id === selectedQuestion.id + 1);
                if (nextQ) {
                  setSelectedQuestion(nextQ);
                  setSelectedSlotIndex(0);
                } else {
                  setViewMode(homeTab);
                }
              }}
            />
          </div>
        )}

        {/* 4.5. Game 2: Cảnh chạy xe máy góc nhìn thứ nhất (Motorbike POV) */}
        {viewMode === 'motorbike' && isTabEnabled('motorbike') && (
          <div style={{ width: '100%', maxWidth: 1440, padding: '1rem', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode(homeTab)}
                style={{ background: '#ffffff', border: '1.5px solid #c5def3', color: '#4a82b8', padding: '0.5rem 1rem', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(74, 130, 184, 0.12)' }}
              >
                ← Trở về bản đồ
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', color: '#4a82b8', fontWeight: 'bold' }}>
                  🛵 Minh (21 tuổi) lái xe Wave đi học • Xáo từ góc nhìn thứ nhất
                </span>
                {isTabEnabled('game2') && (
                  <button
                    onClick={() => setViewMode('game2')}
                    style={{ background: '#ffffff', border: '1.5px solid #c5def3', color: '#4a82b8', padding: '0.45rem 0.85rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    🧩 Xem dạng danh sách
                  </button>
                )}
              </div>
            </div>

            <FirstPersonMotorbikeGame2
              tenNhanVat="Minh"
              soCau={selectedQuestion.id}
              questionText={selectedQuestion.question}
              dapAnChuan={selectedQuestion.fullAnswer || slot.answer}
              cumTu={selectedQuestion.fullPhrases || slot.phrases}
              theNhieu={['Lời giả dối', 'Kh 22:15', 'sách đóng']}
              chang={selectedQuestion.stageId || 1}
              onComplete={res => setModalResult({ isExact: res.isPassed, accuracy: res.accuracy })}
              onNext={() => setViewMode(homeTab)}
            />
          </div>
        )}

        {/* 5. Nhân vật Minh */}
        {viewMode === 'character' && isTabEnabled('character') && (
          <div style={{ width: '100%', padding: '1rem', boxSizing: 'border-box' }}>
            <CharacterDemo />
          </div>
        )}

        {/* 6. Core Bench */}
        {viewMode === 'bench' && isTabEnabled('bench') && (
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
                    style={{ padding: '0.5rem 1rem', background: '#4a82b8', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
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
            setViewMode(homeTab);
          }}
        />
      )}
    </div>
  );
}
