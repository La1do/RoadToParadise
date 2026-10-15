import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  tokenize,
  compareAnswer,
  getMistakeWords,
  generateExerciseForStep,
  evaluateStepSubmission,
  LEARNING_STEPS,
  createExamSession,
  submitSlotAnswer,
  summarizeExam,
  createReviewSession,
  initSlotSRS,
  recordReview,
  isDue,
  getDueSlotKeys,
  calculateOverallMastery,
  createEmptyMistakeBook,
  recordMistake,
  recordMistakeSuccess,
  getTopMistakeWords,
  getUnresolvedSlotKeys,
  getNextWordHint,
  getNextCharHint,
  loadLearningProgress,
  updateSlotStepProgress,
  loadSRSData,
  saveSRSData,
  clearAllData
} from '../src/core/index.js';

const questionsData = JSON.parse(fs.readFileSync('./src/data/questions.json', 'utf8'));
const q1 = questionsData.questions[0];
const slot1 = q1.slots[0]; // Khải thị khải tượng (lời tiên tri), Khải thị thực thể
const slot3 = q1.slots[2]; // Đức Chúa Trời → Đức Chúa Jesus → Thiên sứ → Giăng Mới → Các đầy tớ

test('Grade Engine: Chuẩn hóa và so sánh bắt buộc đúng dấu tiếng Việt', () => {
  // 1. Đúng hoàn toàn
  const res1 = compareAnswer('Khải thị khải tượng lời tiên tri Khải thị thực thể', slot1.answer);
  assert.equal(res1.isExact, true);
  assert.equal(res1.accuracy, 100);

  // 2. Sai dấu = sai chữ
  const res2 = compareAnswer('Khai thi khai tuong loi tien tri Khai thi thuc the', slot1.answer);
  assert.equal(res2.isExact, false);
  // Chỉ có từ 'tri' không có dấu là trùng, 10 từ có dấu đều bị đánh sai
  assert.equal(res2.matchedCount, 1);
  assert.equal(res2.userTokensResult.find(t => t.text === 'thuc').status, 'wrong');
  assert.equal(res2.userTokensResult.find(t => t.text === 'khai').status, 'wrong');
  assert.equal(res2.userTokensResult.find(t => t.text === 'tri').status, 'correct');

  // 3. Xử lý gạch nối và dấu ~ và -
  const res3 = compareAnswer('ê xê mat 15 24', 'Ê-xê, Mat 15:24');
  assert.equal(res3.isExact, true);

  const res4 = compareAnswer('Kh 17:5-7', 'Kh 17:5~7');
  assert.equal(res4.isExact, true);

  // 4. Mũi tên và ký tự đặc biệt
  const res5 = compareAnswer('Đức Chúa Trời -> Đức Chúa Jesus -> Thiên sứ -> Giăng Mới -> Các đầy tớ', slot3.answer);
  assert.equal(res5.isExact, true);
});

test('Learning Step Engine: Thang 6 bậc học', () => {
  // Bậc 1: Chép lại
  const ex1 = generateExerciseForStep(1, slot1);
  assert.equal(ex1.stepId, 1);
  assert.equal(ex1.targetAnswer, slot1.answer);
  const ev1 = evaluateStepSubmission(1, slot1.answer, slot1, ex1);
  assert.equal(ev1.isPassed, true);

  // Bậc 2: Xếp cụm
  const ex2 = generateExerciseForStep(2, slot1);
  assert.equal(ex2.stepId, 2);
  assert.equal(ex2.totalPhrases, 3);
  const ev2Correct = evaluateStepSubmission(2, ex2.correctOrderIds, slot1, ex2);
  assert.equal(ev2Correct.isPassed, true);
  const ev2Wrong = evaluateStepSubmission(2, [...ex2.correctOrderIds].reverse(), slot1, ex2);
  assert.equal(ev2Wrong.isPassed, false);

  // Bậc 3: Điền khuyết 30%
  const ex3 = generateExerciseForStep(3, slot1);
  assert.equal(ex3.stepId, 3);
  assert.ok(ex3.maskCount > 0);
  assert.equal(ex3.template.length, 11);

  // Bậc 4: Điền khuyết 60%
  const ex4 = generateExerciseForStep(4, slot1);
  assert.equal(ex4.stepId, 4);
  assert.ok(ex4.maskCount > ex3.maskCount);

  // Bậc 5: Chữ cái đầu
  const ex5 = generateExerciseForStep(5, slot1);
  assert.equal(ex5.stepId, 5);
  assert.ok(ex5.hintText.includes('K'));

  // Bậc 6: Gõ hoàn toàn
  const ex6 = generateExerciseForStep(6, slot1);
  assert.equal(ex6.stepId, 6);
  const ev6 = evaluateStepSubmission(6, slot1.answer, slot1, ex6);
  assert.equal(ev6.isPassed, true);
});

test('Exam Engine: Quy trình thi và ôn lại các ô sai', () => {
  // Khởi tạo bài thi 5 câu (Chặng 1)
  const session = createExamSession({
    questions: questionsData.questions,
    mode: 'STAGE',
    stageId: 1
  });

  assert.equal(session.mode, 'STAGE');
  assert.equal(session.totalSlots > 0, true);

  // Nộp ô 0 đúng
  const firstSlot = session.slots[0];
  const stepRes1 = submitSlotAnswer(session, firstSlot.targetAnswer);
  assert.equal(stepRes1.gradeResult.isExact, true);

  // Giả lập làm sai một ô
  const wrongInput = 'câu trả lời sai hoàn toàn';
  const slot2 = session.slots[1];
  session.currentIndex = 1;
  const stepRes2 = submitSlotAnswer(stepRes1.session, wrongInput);
  assert.equal(stepRes2.gradeResult.isExact, false);

  // Tổng kết phiên thi
  const summary = summarizeExam(stepRes2.session);
  assert.ok(summary.wrongSlotKeys.includes(slot2.slotKey));

  // Tạo phiên "Ôn lại các ô sai"
  const reviewSession = createReviewSession(stepRes2.session, questionsData.questions);
  assert.equal(reviewSession.mode, 'REVIEW_WRONG');
  assert.ok(reviewSession.slots.some(s => s.slotKey === slot2.slotKey));
});

test('Spaced Repetition: Lặp lại ngắt quãng và quy tắc gợi ý', () => {
  let srs = initSlotSRS('q1_s1');
  assert.equal(srs.masteryLevel, 0);

  // Trả lời đúng lần 1 -> Cấp 1 (1 ngày)
  const baseDate = new Date('2026-10-15T00:00:00.000Z');
  srs = recordReview(srs, { isCorrect: true, usedHint: false, reviewDate: baseDate });
  assert.equal(srs.masteryLevel, 1);
  assert.equal(srs.intervalDays, 1);

  // Trả lời đúng lần 2 -> Cấp 2 (3 ngày)
  srs = recordReview(srs, { isCorrect: true, usedHint: false, reviewDate: baseDate });
  assert.equal(srs.masteryLevel, 2);
  assert.equal(srs.intervalDays, 3);

  // Trả lời đúng lần 3 -> Cấp 3 (7 ngày)
  srs = recordReview(srs, { isCorrect: true, usedHint: false, reviewDate: baseDate });
  assert.equal(srs.masteryLevel, 3);
  assert.equal(srs.intervalDays, 7);

  // Quy tắc: Dùng gợi ý thì không tính độ thuộc
  srs = recordReview(srs, { isCorrect: true, usedHint: true, reviewDate: baseDate });
  assert.equal(srs.masteryLevel, 3, 'Level should NOT increase when hint was used');
  assert.equal(srs.intervalDays, 1, 'Interval resets to 1 day on hint');

  // Trả lời sai -> Hạ cấp
  srs = recordReview(srs, { isCorrect: false, usedHint: false, reviewDate: baseDate });
  assert.equal(srs.masteryLevel, 2, 'Level should decrease on wrong answer');
});

test('Sổ Tiếc Nuối: Thống kê từ sai và tạo phiên ôn', () => {
  let book = createEmptyMistakeBook();

  // Gõ sai ô Mat 15:24
  const target = 'Đức Chúa Jesus, Dân Israel nổi loạn, Ê-xê, Mat 15:24';
  const input = 'Chúa Jesus, Israel nổi loạn, Mat 15';

  book = recordMistake(book, 'q9_s1', input, target);
  assert.ok(book.slots['q9_s1']);
  assert.equal(book.slots['q9_s1'].failCount, 1);

  // Kiểm tra từ sai/thiếu được ghi nhận
  const topWords = getTopMistakeWords(book, 10);
  assert.ok(topWords.length > 0);

  const unresolved = getUnresolvedSlotKeys(book);
  assert.ok(unresolved.includes('q9_s1'));

  // Trả lời đúng 3 lần liên tiếp -> resolve
  book = recordMistakeSuccess(book, 'q9_s1');
  book = recordMistakeSuccess(book, 'q9_s1');
  book = recordMistakeSuccess(book, 'q9_s1');
  assert.equal(book.slots['q9_s1'].isResolved, true);
});

test('Hint Engine: Gợi ý từ tiếp theo', () => {
  const target = 'Núi Si-ôn có 12 Bộ Tộc 144.000 đã được đóng ấn của Kh 14';
  const input = 'Núi Si-ôn có';

  const hint = getNextWordHint(input, target);
  assert.equal(hint.hintWord, '12');

  const charHint = getNextCharHint(input, target);
  assert.equal(charHint, '1');
});

test('Storage Engine: Quản lý lưu trữ và tiến độ', () => {
  clearAllData();

  updateSlotStepProgress('q1_s1', 3);
  const prog = loadLearningProgress();
  assert.equal(prog['q1_s1'], 3);

  // Không lùi bậc
  updateSlotStepProgress('q1_s1', 2);
  const progAfter = loadLearningProgress();
  assert.equal(progAfter['q1_s1'], 3);
});
