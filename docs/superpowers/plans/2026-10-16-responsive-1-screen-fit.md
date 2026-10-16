# Responsive 1-Screen Viewport Fit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tái cấu trúc giao diện CustomExamReview (Setup & Session) thành bố cục 2 cột trên Laptop/iPad và 1 cột siêu gọn trên Mobile để thao tác trọn vẹn trong 1 màn hình không cần cuộn.

**Architecture:** Sử dụng Grid 2 cột trên màn hình >= 768px (Cột trái: Chế độ + Tùy chọn + Nút Bắt đầu; Cột phải: Presets + Lưới câu hỏi cuộn nội bộ). Trên Mobile (< 768px), tinh gọn thành 1 cột với 3 tab ngang, lưới 20 ô số 5x4 và nút Bắt đầu ghim đáy.

**Tech Stack:** React 19, CSS Grid & Flexbox, Media Queries, Node test runner.

## Global Constraints
- Chiều cao tổng thể trên Laptop (>= 900px) không vượt quá 620px (vừa khít 100vh màn hình 1366x768 / 1920x1080).
- Touch target nút bấm trên Mobile và iPad >= 44px.
- Giữ nguyên 100% logic chấm điểm, lưu tiến độ và các tính năng hiện có.

---

### Task 1: Cập nhật cấu trúc JSX màn hình Thiết lập (Setup View) trong CustomExamReview.jsx

**Files:**
- Modify: `src/components/exam/CustomExamReview.jsx`
- Test: `tests/custom_exam_review.test.js`

**Interfaces:**
- Consumes: `mode`, `setMode`, `selectedQuestionIds`, `handleSelectPreset`, `isShuffle`, `showReferenceAnswer`, `handleStartSession`
- Produces: Nhóm container `setup-grid-container` với `setup-col-left` và `setup-col-right`

- [ ] **Step 1: Viết test kiểm tra cấu trúc 2 cột setup trong test file**

Trong `tests/custom_exam_review.test.js`, bổ sung test:
```javascript
test('CustomExamReview: Cấu trúc 2 cột trên Laptop và lưới ô số trên Mobile', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  assert.ok(jsx.includes('setup-grid-container'), 'Có container chia 2 cột setup');
  assert.ok(jsx.includes('setup-col-left'), 'Có cột trái chứa chế độ và nút bắt đầu');
  assert.ok(jsx.includes('setup-col-right'), 'Có cột phải chứa câu hỏi');
});
```

- [ ] **Step 2: Chạy test để xác nhận test thất bại**

Run: `node --test tests/custom_exam_review.test.js`
Expected: FAIL với assertion lỗi vì chưa có `setup-grid-container`.

- [ ] **Step 3: Cập nhật JSX trong CustomExamReview.jsx**

Tái cấu trúc khối `viewState === 'setup'` thành:
```jsx
<div className="setup-grid-container">
  {/* Cột trái: Tiêu đề, Chế độ, Tùy chọn & Nút bắt đầu */}
  <div className="setup-col-left">
    <header className="setup-header-compact">
      <div className="header-badge">✦ KHÔNG GIAN HỌC TỰ CHỌN</div>
      <h1 className="header-title-compact">🎯 Ôn Tập & Thi Riêng</h1>
    </header>

    <div className="setup-section mode-section">
      <label className="section-label">1. Hình thức ({mode === 'copy' ? 'Chép lại' : mode === 'scramble' ? 'Xáo từ' : 'Thi riêng'}):</label>
      <div className="mode-toggle-grid three-modes">
        <button type="button" className={`mode-toggle-btn ${mode === 'copy' ? 'active-copy' : ''}`} onClick={() => setMode('copy')}>
          <span className="mode-icon">✍️</span>
          <div><strong>Chép lại</strong><p>Gõ từng ý, hỗ trợ gợi ý</p></div>
        </button>
        <button type="button" className={`mode-toggle-btn ${mode === 'scramble' ? 'active-scramble' : ''}`} onClick={() => setMode('scramble')}>
          <span className="mode-icon">🧩</span>
          <div><strong>Xáo từ</strong><p>Kéo ghép lưới 2x2</p></div>
        </button>
        <button type="button" className={`mode-toggle-btn ${mode === 'exam' ? 'active-exam' : ''}`} onClick={() => setMode('exam')}>
          <span className="mode-icon">📝</span>
          <div><strong>Thi riêng</strong><p>Tự nhớ & chấm điểm</p></div>
        </button>
      </div>
    </div>

    <div className="setup-section options-section">
      <label className="section-label">3. Tùy chọn:</label>
      <div className="options-stacked">
        <label className="checkbox-option">
          <input type="checkbox" checked={isShuffle} onChange={e => setIsShuffle(e.target.checked)} />
          <span>🔀 Xáo trộn thứ tự các câu hỏi</span>
        </label>
        {mode !== 'exam' && (
          <label className="checkbox-option">
            <input type="checkbox" checked={showReferenceAnswer} onChange={e => setShowReferenceAnswer(e.target.checked)} />
            <span>👁️ Mở sẵn đáp án tham khảo</span>
          </label>
        )}
        {mode === 'exam' && (
          <div className="timer-select-wrap">
            <span>⏱️ Thời gian:</span>
            <select value={timeLimitMinutes} onChange={e => setTimeLimitMinutes(Number(e.target.value))} className="time-select">
              <option value={0}>Tự do</option>
              <option value={5}>5 phút</option>
              <option value={10}>10 phút</option>
              <option value={15}>15 phút</option>
              <option value={20}>20 phút</option>
            </select>
          </div>
        )}
      </div>

      <div className="setup-start-wrap">
        <button type="button" className="start-session-btn" onClick={handleStartSession} disabled={selectedQuestionIds.length === 0}>
          {mode === 'copy'
            ? `🚀 Bắt đầu Chép lại (${selectedQuestionIds.length} câu) →`
            : mode === 'scramble'
            ? `🚀 Bắt đầu Xáo từ (${selectedQuestionIds.length} câu) →`
            : `🏁 Bắt đầu Bài thi (${selectedQuestionIds.length} câu) →`}
        </button>
      </div>
    </div>
  </div>

  {/* Cột phải: Presets và danh sách câu hỏi */}
  <div className="setup-col-right">
    <div className="setup-section questions-section">
      <div className="section-header-flex">
        <label className="section-label">2. Phạm vi câu hỏi ({selectedQuestionIds.length}/20 câu đã chọn):</label>
        <div className="preset-quick-actions">
          <button type="button" className="quick-btn" onClick={() => handleSelectPreset('all')}>Tất cả</button>
          <button type="button" className="quick-btn" onClick={() => handleSelectPreset('clear')}>Bỏ chọn</button>
        </div>
      </div>

      <div className="presets-pill-row">
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage1')}>Chặng 1 (1-5)</button>
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage2')}>Chặng 2 (6-10)</button>
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage3')}>Chặng 3 (11-15)</button>
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('stage4')}>Chặng 4 (16-20)</button>
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random5')}>Ngẫu nhiên 5</button>
        <button type="button" className="preset-pill" onClick={() => handleSelectPreset('random10')}>Ngẫu nhiên 10</button>
        <button type="button" className="preset-pill highlight" onClick={() => handleSelectPreset('mistakeBook')}>📖 Sổ Tiếc Nuối</button>
      </div>

      <div className="questions-select-grid">
        {allQuestions.map(q => {
          const isSelected = selectedQuestionIds.includes(q.id);
          return (
            <button
              key={q.id}
              type="button"
              className={`q-select-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleToggleQuestionId(q.id)}
            >
              <div className="q-card-top">
                <span className="q-id-badge">Câu {q.id}</span>
                <span className="q-stage-tag">Chặng {q.stageId}</span>
              </div>
              <p className="q-text-snippet">{q.question.slice(0, 55)}...</p>
              <div className="q-slots-count">{q.slots.length} ý</div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Chạy lại test xác nhận vượt qua**

Run: `node --test tests/custom_exam_review.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/exam/CustomExamReview.jsx tests/custom_exam_review.test.js
git commit -m "refactor(ui): tái cấu trúc JSX 2 cột cho màn hình Setup"
```

---

### Task 2: Viết CSS Responsive 2 cột trên Laptop/iPad và 1 cột ghim đáy trên Mobile trong CustomExamReview.css

**Files:**
- Modify: `src/components/exam/CustomExamReview.css`
- Test: `tests/custom_exam_review.test.js`

**Interfaces:**
- Consumes: `.setup-grid-container`, `.setup-col-left`, `.setup-col-right`, `.questions-select-grid`
- Produces: Bố cục 2 cột cho `>= 820px`, co giãn theo `vh`, và layout mobile `< 820px`

- [ ] **Step 1: Bổ sung test kiểm tra CSS rule 2 cột**

Trong `tests/custom_exam_review.test.js`:
```javascript
test('CustomExamReview: CSS bố cục 2 cột vừa khít 1 màn hình', () => {
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');
  assert.ok(css.includes('.setup-grid-container'), 'Có selector .setup-grid-container');
  assert.ok(css.includes('grid-template-columns: 360px 1fr') || css.includes('grid-template-columns: 380px 1fr') || css.includes('@media (min-width: 820px)'), 'Có media query 2 cột');
});
```

- [ ] **Step 2: Chạy test xác nhận test thất bại**

Run: `node --test tests/custom_exam_review.test.js`
Expected: FAIL

- [ ] **Step 3: Cập nhật CSS trong CustomExamReview.css**

Thêm rules CSS:
```css
/* Layout 2 cột vừa vặn 1 màn hình */
.setup-grid-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 820px) {
  .setup-grid-container {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 16px;
    align-items: stretch;
  }

  .setup-col-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setup-col-right {
    display: flex;
    flex-direction: column;
  }

  .setup-col-right .questions-section {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .setup-col-right .questions-select-grid {
    flex: 1;
    max-height: 400px;
  }
}

/* Header thu nhỏ */
.setup-header-compact {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 10px 16px;
}

.header-title-compact {
  margin: 0;
  font-size: 1.25rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mobile: Nút bắt đầu ghim đáy tiện bấm */
@media (max-width: 819px) {
  .setup-start-wrap {
    position: sticky;
    bottom: 10px;
    z-index: 50;
    padding: 8px 0;
    backdrop-filter: blur(8px);
  }

  .questions-select-grid {
    max-height: 240px;
  }
}
```

- [ ] **Step 4: Chạy test và build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/exam/CustomExamReview.css tests/custom_exam_review.test.js
git commit -m "feat(responsive): hoàn thiện CSS 2 cột vừa khít 1 màn hình laptop, ipad và mobile"
```

---

### Task 3: Đồng bộ sang nhánh `main` và kiểm tra toàn diện

**Files:**
- Modify: `main` branch
- Verify: Production bundle

- [ ] **Step 1: Merge dev vào main**
- [ ] **Step 2: Chạy kiểm thử trên main `npm test && npm run build`**
- [ ] **Step 3: Push dev và main lên GitHub remote**
