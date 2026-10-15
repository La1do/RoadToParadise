import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  tokenize,
  compareAnswer,
  getNextWordHint,
  generateStep2Arrange,
  evaluateStep2Arrange,
  createExamSession,
  submitSlotAnswer,
  summarizeExam
} from '../src/core/index.js';

const questionsData = JSON.parse(fs.readFileSync('./src/data/questions.json', 'utf8'));
const q1 = questionsData.questions[0];
const slot1 = q1.slots[0]; // Khải thị khải tượng (lời tiên tri), Khải thị thực thể
const slot2 = q1.slots[1]; // Khải thị thực thể (1 cụm)
const slot3 = q1.slots[2]; // Đức Chúa Trời → Đức Chúa Jesus...

test('Files: Kiểm tra đầy đủ file và CSS của Game 1, Game 2 và ResultModal', () => {
  const g1Jsx = path.resolve('./src/components/games/Game1Copy.jsx');
  const g1Css = path.resolve('./src/components/games/Game1Copy.css');
  const g2Jsx = path.resolve('./src/components/games/Game2Scramble.jsx');
  const g2Css = path.resolve('./src/components/games/Game2Scramble.css');
  const modalJsx = path.resolve('./src/components/games/GameResultModal.jsx');
  const modalCss = path.resolve('./src/components/games/GameResultModal.css');
  const indexJs = path.resolve('./src/components/games/index.js');

  assert.ok(fs.existsSync(g1Jsx), 'Game1Copy.jsx phải tồn tại');
  assert.ok(fs.existsSync(g1Css), 'Game1Copy.css phải tồn tại');
  assert.ok(fs.existsSync(g2Jsx), 'Game2Scramble.jsx phải tồn tại');
  assert.ok(fs.existsSync(g2Css), 'Game2Scramble.css phải tồn tại');
  assert.ok(fs.existsSync(modalJsx), 'GameResultModal.jsx phải tồn tại');
  assert.ok(fs.existsSync(modalCss), 'GameResultModal.css phải tồn tại');
  assert.ok(fs.existsSync(indexJs), 'index.js phải tồn tại');

  // Kiểm tra nội dung index.js
  const indexContent = fs.readFileSync(indexJs, 'utf8');
  assert.match(indexContent, /Game1Copy/);
  assert.match(indexContent, /Game2Scramble/);
  assert.match(indexContent, /GameResultModal/);
});

test('Game 1: Yêu cầu giao diện và logic (Game1Copy)', () => {
  const jsxContent = fs.readFileSync('./src/components/games/Game1Copy.jsx', 'utf8');
  const cssContent = fs.readFileSync('./src/components/games/Game1Copy.css', 'utf8');

  // Kiểm tra imports
  assert.match(jsxContent, /compareAnswer/);
  assert.match(jsxContent, /getNextWordHint/);

  // Kiểm tra thuộc tính ô nhập liệu: mobile-first, Telex/VNI
  assert.match(jsxContent, /autoCapitalize="none"/);
  assert.match(jsxContent, /autoCorrect="off"/);
  assert.match(jsxContent, /spellCheck="false"/);

  // Kiểm tra CSS: màu nền nhạt từ sai #f8d7da, touch-friendly
  assert.match(cssContent, /#f8d7da/i, 'CSS phải có màu nền đỏ nhạt #f8d7da cho từ sai');
  assert.match(cssContent, /max-width:\s*430px/, 'Mobile-first width 360-430px');
  assert.match(cssContent, /min-height:\s*44px/, 'Nút bấm chiều cao >= 44px');

  // Logic kiểm tra so sánh bài làm
  const targetAnswer = slot1.answer;
  const userInput = 'Khải thị khải tượng lời sai';
  const result = compareAnswer(userInput, targetAnswer);

  assert.equal(result.isExact, false);
  const wrongUserTokens = result.userTokensResult.filter(t => t.status === 'wrong');
  assert.ok(wrongUserTokens.some(t => t.text === 'sai'), 'Từ "sai" phải được đánh dấu status="wrong"');

  const missingTokens = result.targetTokensResult.filter(t => t.status === 'missing');
  assert.ok(missingTokens.length > 0, 'Phải có các từ còn thiếu trong đáp án mẫu');
  assert.ok(missingTokens.some(t => t.text === 'thực'), 'Từ "thực" phải là missing');

  // Gợi ý 1 từ
  const hint = getNextWordHint(userInput, targetAnswer);
  assert.ok(hint.hintWord, 'Phải sinh ra từ gợi ý tiếp theo');
  assert.equal(hint.isAlreadyComplete, false);
});

test('Game 2: Yêu cầu giao diện và logic (Game2Scramble)', () => {
  const jsxContent = fs.readFileSync('./src/components/games/Game2Scramble.jsx', 'utf8');
  const cssContent = fs.readFileSync('./src/components/games/Game2Scramble.css', 'utf8');

  // Kiểm tra import và hàm
  assert.match(jsxContent, /generateStep2Arrange/);
  assert.match(jsxContent, /evaluateStep2Arrange/);
  assert.match(jsxContent, /compareAnswer/);

  // Kiểm tra các bước: khay ghép, xác nhận thứ tự, gõ củng cố
  assert.match(jsxContent, /Xác nhận thứ tự/);
  assert.match(jsxContent, /reinforce/);

  // Kiểm tra CSS: thẻ bo tròn, chiều cao >= 44px
  assert.match(cssContent, /min-height:\s*44px/, 'Thẻ từ và nút phải có chiều cao >= 44px');
  assert.match(cssContent, /border-radius:\s*22px/, 'Thẻ bo tròn');

  // Slot có 1 cụm duy nhất: slot2
  const exercise1Phrase = generateStep2Arrange(slot2);
  assert.ok(exercise1Phrase.totalPhrases >= 2, 'Tự động tách đôi nếu cụm <= 1');
  assert.equal(exercise1Phrase.originalItems.length, exercise1Phrase.totalPhrases);

  // Slot có nhiều cụm: slot3
  const exerciseMulti = generateStep2Arrange(slot3);
  assert.equal(exerciseMulti.totalPhrases, slot3.phrases.length);
  assert.equal(exerciseMulti.correctOrderIds.length, slot3.phrases.length);

  // Kiểm tra đánh giá xếp cụm
  const correctEval = evaluateStep2Arrange(exerciseMulti.correctOrderIds, exerciseMulti.correctOrderIds);
  assert.equal(correctEval.isCorrect, true);
  assert.equal(correctEval.accuracy, 100);

  const reversedIds = [...exerciseMulti.correctOrderIds].reverse();
  const wrongEval = evaluateStep2Arrange(reversedIds, exerciseMulti.correctOrderIds);
  assert.equal(wrongEval.isCorrect, false);
});

test('GameResultModal: Yêu cầu giao diện và thống kê (GameResultModal)', () => {
  const jsxContent = fs.readFileSync('./src/components/games/GameResultModal.jsx', 'utf8');
  const cssContent = fs.readFileSync('./src/components/games/GameResultModal.css', 'utf8');

  assert.match(jsxContent, /Ôn lại các ô sai/);
  assert.match(jsxContent, /result-wrong-token/);
  assert.match(cssContent, /#fee2e2/, 'Tô đỏ nổi bật từ sai');

  // 1. Chế độ 1 ô câu hỏi
  const grade1 = compareAnswer('Khải thị lời sai', slot1.answer);
  const wrongWords1 = grade1.userTokensResult.filter(t => t.status === 'wrong').map(t => t.text);
  assert.ok(wrongWords1.includes('sai'), 'Từ sai phải có "sai"');
  assert.ok(grade1.accuracy < 100);

  // 2. Chế độ phiên thi
  const session = createExamSession({ questions: [q1], mode: 'FULL' });
  const sub1 = submitSlotAnswer(session, slot1.answer);
  sub1.session.currentIndex = 1;
  const sub2 = submitSlotAnswer(sub1.session, 'sai bét');
  const summary = summarizeExam(sub2.session);

  assert.equal(summary.totalSlots, 3);
  assert.equal(summary.correctCount, 1);
  assert.equal(summary.wrongCount, 2);
  assert.equal(summary.wrongSlots.length, 2);
  assert.equal(summary.passed, false);
});
