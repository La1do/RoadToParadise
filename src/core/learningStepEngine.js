/**
 * learningStepEngine.js - Quản lý thang 6 bậc học cho từng ô câu hỏi
 *
 * 6 bậc:
 * 1. Chép lại (Copy)
 * 2. Xếp cụm (Phrase Arrange)
 * 3. Điền khuyết 30% (Cloze 30%)
 * 4. Điền khuyết 60% (Cloze 60%)
 * 5. Chữ cái đầu (First Letters)
 * 6. Gõ hoàn toàn (Full Recall)
 */

import { tokenize, compareAnswer } from './gradeEngine.js';

export const LEARNING_STEPS = [
  { id: 1, key: 'COPY', name: 'Chép lại', desc: 'Nhìn đáp án và gõ lại chuẩn xác' },
  { id: 2, key: 'ARRANGE', name: 'Xếp cụm', desc: 'Sắp xếp các cụm từ theo đúng thứ tự' },
  { id: 3, key: 'CLOZE_30', name: 'Điền khuyết 30%', desc: 'Điền các từ bị ẩn (30%)' },
  { id: 4, key: 'CLOZE_60', name: 'Điền khuyết 60%', desc: 'Điền các từ bị ẩn (60%)' },
  { id: 5, key: 'FIRST_LETTER', name: 'Chữ cái đầu', desc: 'Nhìn chữ cái gợi ý đầu mỗi từ và gõ' },
  { id: 6, key: 'FULL_TYPING', name: 'Gõ hoàn toàn', desc: 'Tự nhớ và gõ hoàn toàn không gợi ý' }
];

/**
 * Xáo trộn mảng (Fisher-Yates) không làm thay đổi mảng gốc
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sinh dữ liệu bài tập cho Bậc 1: Chép lại
 */
export function generateStep1Copy(slot) {
  return {
    stepId: 1,
    stepKey: 'COPY',
    targetAnswer: slot.answer,
    guide: 'Đọc kỹ và gõ lại chính xác từng từ dưới đây'
  };
}

/**
 * Sinh dữ liệu bài tập cho Bậc 2: Xếp cụm
 */
export function generateStep2Arrange(slot) {
  let phrases = slot.phrases && slot.phrases.length > 0 ? [...slot.phrases] : [];

  // Nếu chỉ có 1 cụm, tự động tách đôi để vẫn có cụm sắp xếp
  if (phrases.length <= 1) {
    const tokens = tokenize(slot.answer);
    if (tokens.length >= 2) {
      const mid = Math.ceil(tokens.length / 2);
      phrases = [
        tokens.slice(0, mid).join(' '),
        tokens.slice(mid).join(' ')
      ];
    } else {
      phrases = [slot.answer];
    }
  }

  const phraseItems = phrases.map((text, idx) => ({
    id: `phrase_${idx}`,
    originalIndex: idx,
    text: text.trim()
  }));

  // Xáo trộn đảm bảo không trùng 100% thứ tự cũ nếu có từ 2 phần tử trở lên
  let shuffled = shuffle(phraseItems);
  if (phraseItems.length > 1) {
    let attempts = 0;
    while (
      attempts < 5 &&
      shuffled.every((item, i) => item.originalIndex === i)
    ) {
      shuffled = shuffle(phraseItems);
      attempts++;
    }
  }

  return {
    stepId: 2,
    stepKey: 'ARRANGE',
    totalPhrases: phraseItems.length,
    originalItems: phraseItems,
    shuffledItems: shuffled,
    correctOrderIds: phraseItems.map(item => item.id)
  };
}

/**
 * Chấm bài Bậc 2: Xếp cụm
 * @param {string[]} selectedIds - Danh sách id cụm người dùng chọn theo thứ tự
 * @param {string[]} correctOrderIds - Thứ tự id đúng
 */
export function evaluateStep2Arrange(selectedIds, correctOrderIds) {
  if (!Array.isArray(selectedIds) || selectedIds.length !== correctOrderIds.length) {
    return { isCorrect: false, accuracy: 0 };
  }

  let matched = 0;
  for (let i = 0; i < correctOrderIds.length; i++) {
    if (selectedIds[i] === correctOrderIds[i]) {
      matched++;
    }
  }

  const isCorrect = matched === correctOrderIds.length;
  const accuracy = Math.round((matched / correctOrderIds.length) * 100);

  return { isCorrect, accuracy, matched, total: correctOrderIds.length };
}

/**
 * Sinh dữ liệu bài tập Điền khuyết (Bậc 3: 30%, Bậc 4: 60%)
 * @param {object} slot
 * @param {number} percentage - 30 hoặc 60
 */
export function generateClozeStep(slot, percentage = 30) {
  const tokens = tokenize(slot.answer);
  const n = tokens.length;

  if (n === 0) {
    return {
      tokens: [],
      maskedIndices: [],
      blankCount: 0,
      template: []
    };
  }

  const maskCount = Math.max(1, Math.min(n, Math.round((n * percentage) / 100)));

  // Chọn các vị trí ẩn cách đều hoặc phân bố đều
  const step = n / maskCount;
  const maskedSet = new Set();
  for (let i = 0; i < maskCount; i++) {
    const idx = Math.min(n - 1, Math.floor(i * step + Math.floor(step / 2)));
    maskedSet.add(idx);
  }

  const template = tokens.map((token, index) => {
    const isMasked = maskedSet.has(index);
    return {
      index,
      expected: token,
      isMasked,
      display: isMasked ? '____' : token
    };
  });

  return {
    stepId: percentage === 30 ? 3 : 4,
    stepKey: percentage === 30 ? 'CLOZE_30' : 'CLOZE_60',
    totalWords: n,
    maskCount,
    template,
    maskedIndices: Array.from(maskedSet).sort((a, b) => a - b),
    maskedAnswers: Array.from(maskedSet).sort((a, b) => a - b).map(i => tokens[i])
  };
}

/**
 * Sinh dữ liệu Bậc 5: Chữ cái đầu
 */
export function generateStep5FirstLetters(slot) {
  const tokens = tokenize(slot.answer);

  // Tạo chuỗi gợi ý: chữ cái đầu kèm gạch dưới độ dài từ
  const hints = tokens.map(t => {
    const firstChar = t.charAt(0).toUpperCase();
    const restLength = Math.max(1, t.length - 1);
    return `${firstChar}${'_'.repeat(restLength)}`;
  });

  const compactLetters = tokens.map(t => t.charAt(0).toUpperCase()).join(' ');

  return {
    stepId: 5,
    stepKey: 'FIRST_LETTER',
    tokens,
    hints,
    hintText: hints.join(' '),
    compactLetters,
    targetAnswer: slot.answer
  };
}

/**
 * Sinh dữ liệu Bậc 6: Gõ hoàn toàn
 */
export function generateStep6FullTyping(slot) {
  return {
    stepId: 6,
    stepKey: 'FULL_TYPING',
    targetAnswer: slot.answer,
    guide: 'Gõ đầy đủ chính xác nội dung của ô không có gợi ý'
  };
}

/**
 * Hàm tổng hợp sinh bài tập cho bậc bất kỳ (1-6)
 */
export function generateExerciseForStep(stepId, slot) {
  switch (stepId) {
    case 1:
      return generateStep1Copy(slot);
    case 2:
      return generateStep2Arrange(slot);
    case 3:
      return generateClozeStep(slot, 30);
    case 4:
      return generateClozeStep(slot, 60);
    case 5:
      return generateStep5FirstLetters(slot);
    case 6:
      return generateStep6FullTyping(slot);
    default:
      throw new Error(`Invalid stepId: ${stepId}. Step must be between 1 and 6.`);
  }
}

/**
 * Chấm điểm bài làm cho bậc học tương ứng
 * @param {number} stepId - Bậc 1-6
 * @param {any} submission - Input của user (string text hoặc mảng id/từ)
 * @param {object} slot - Ô câu hỏi
 * @param {object} exercise - Dữ liệu bài tập sinh ra từ generateExerciseForStep
 */
export function evaluateStepSubmission(stepId, submission, slot, exercise) {
  if (stepId === 2) {
    // submission là mảng phrase id đã chọn
    const arrResult = evaluateStep2Arrange(submission, exercise.correctOrderIds);
    return {
      stepId: 2,
      isPassed: arrResult.isCorrect,
      accuracy: arrResult.accuracy,
      details: arrResult
    };
  }

  // Các bậc 1, 3, 4, 5, 6 đều có thể chấm qua compareAnswer
  let textToGrade = '';
  if (typeof submission === 'string') {
    textToGrade = submission;
  } else if (Array.isArray(submission) && (stepId === 3 || stepId === 4)) {
    // Nếu user nộp các từ điền khuyết: ghép lại thành chuỗi hoàn chỉnh
    const filledTokens = exercise.template.map(item => {
      if (!item.isMasked) return item.expected;
      const maskIdx = exercise.maskedIndices.indexOf(item.index);
      return submission[maskIdx] || '';
    });
    textToGrade = filledTokens.join(' ');
  }

  const gradeResult = compareAnswer(textToGrade, slot.answer);
  return {
    stepId,
    isPassed: gradeResult.isExact,
    accuracy: gradeResult.accuracy,
    details: gradeResult
  };
}
