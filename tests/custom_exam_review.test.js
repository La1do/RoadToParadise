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

  assert.ok(jsx.includes("mode === 'scramble'"), 'Supports scramble practice mode');
  assert.ok(jsx.includes("mode === 'exam'"), 'Supports real exam mode');
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
