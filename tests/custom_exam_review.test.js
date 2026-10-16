import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('CustomExamReview: Kiểm tra files tồn tại và export', () => {
  assert.ok(fs.existsSync('./src/components/exam/CustomExamReview.jsx'), 'CustomExamReview.jsx exists');
  assert.ok(fs.existsSync('./src/components/exam/CustomExamReview.css'), 'CustomExamReview.css exists');
  assert.ok(fs.existsSync('./src/components/exam/index.js'), 'index.js exists');
});

test('CustomExamReview: Kiểm tra hỗ trợ chế độ Ôn xáo từ và Thi riêng', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');

  assert.ok(jsx.includes("mode === 'copy'"), 'Supports copy practice mode');
  assert.ok(jsx.includes("mode === 'scramble'"), 'Supports scramble practice mode');
  assert.ok(jsx.includes("mode === 'exam'"), 'Supports real exam mode');
  assert.ok(jsx.includes('showReferenceAnswer'), 'Supports show/hide reference answer toggle');
  assert.ok(jsx.includes('Game2Scramble'), 'Integrates Game2Scramble in scramble mode');
  assert.ok(jsx.includes('handleSubmitExam'), 'Supports submit exam logic');
  assert.ok(jsx.includes('handleRetryWrongQuestions'), 'Supports retry wrong questions');
});

test('CustomExamReview: Tách riêng từng ô input cho từng ý trong bài thi', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');

  assert.ok(jsx.includes('exam-slots-inputs'), 'Has exam slots inputs container');
  assert.ok(jsx.includes('exam-slot-textarea'), 'Has separate textarea for each slot');
  assert.ok(css.includes('.exam-slots-inputs'), 'Has CSS for exam slots inputs');
  assert.ok(css.includes('.exam-slot-textarea'), 'Has CSS for exam slot textarea');
});

test('CustomExamReview: Bố cục responsive cho Laptop, iPad và Mobile', () => {
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');

  assert.ok(css.includes('max-width: 1040px'), 'Has comfortable wide container for desktop/laptop');
  assert.ok(css.includes('grid-template-columns: 1fr 1fr') || css.includes('@media'), 'Has responsive layout');
  assert.ok(css.includes('min-height: 48px') || css.includes('min-height: 52px'), 'Has touch-friendly buttons >= 48px');
});

test('CustomExamReview: Giữ nguyên đáp án khi chuyển câu trong chế độ Xáo từ (Scramble)', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');

  // Quản lý state scrambleProgress để lưu đáp án của từng câu hỏi
  assert.ok(jsx.includes('scrambleProgress'), 'Có state scrambleProgress để lưu tiến độ các câu xáo từ');
  assert.ok(jsx.includes('initialState={scrambleProgress[currentQ.id]}'), 'Truyền initialState vào Game2Scramble');
  assert.ok(jsx.includes('onStateChange='), 'Có onStateChange để lưu lại trạng thái các thẻ khi người dùng thao tác');
  assert.ok(jsx.includes('handleSubmitScramble'), 'Hỗ trợ tổng kết đợt ôn xáo từ');

  // Đánh dấu nav-pill khi đã làm câu đó trong chế độ xáo từ
  assert.ok(jsx.includes('scrambleProgress[q.id]'), 'Đánh dấu ô câu hỏi đã làm trên thanh điều hướng nav-pill');
});

test('CustomExamReview: Cấu trúc 2 cột trên Laptop và lưới ô số trên Mobile', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  assert.ok(jsx.includes('setup-grid-container'), 'Có container chia 2 cột setup');
  assert.ok(jsx.includes('setup-col-left'), 'Có cột trái chứa chế độ và nút bắt đầu');
  assert.ok(jsx.includes('setup-col-right'), 'Có cột phải chứa câu hỏi');
});

test('CustomExamReview: CSS bố cục 2 cột vừa khít 1 màn hình', () => {
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');
  assert.ok(css.includes('.setup-grid-container'), 'Có selector .setup-grid-container');
  assert.ok(css.includes('.setup-col-left'), 'Có selector .setup-col-left');
  assert.ok(css.includes('.setup-col-right'), 'Có selector .setup-col-right');
  assert.ok(css.includes('grid-template-columns: 360px 1fr') || css.includes('grid-template-columns: 380px 1fr') || css.includes('@media (min-width: 820px)'), 'Có media query 2 cột');
  assert.ok(css.includes('.setup-start-wrap'), 'Có selector .setup-start-wrap');
});

