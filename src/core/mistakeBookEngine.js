/**
 * mistakeBookEngine.js - Sổ "Tiếc Nuối"
 *
 * Lưu trữ và phân tích các ô và từ hay gõ sai để tự động đưa vào lượt ôn tập.
 */

import { getMistakeWords } from './gradeEngine.js';
import { createExamSession } from './examEngine.js';

/**
 * Khởi tạo một cuốn sổ Tiếc Nuối rỗng
 */
export function createEmptyMistakeBook() {
  return {
    slots: {}, // slotKey -> SlotMistakeEntry
    wordFrequency: {} // word -> count
  };
}

/**
 * Ghi nhận một lần gõ sai vào Sổ Tiếc Nuối
 * @param {object} book - Cuốn sổ hiện tại
 * @param {string} slotKey
 * @param {string} userInput - Bài làm sai của user
 * @param {string} targetAnswer - Đáp án chuẩn
 * @param {string} [timestamp]
 * @returns {object} updatedBook
 */
export function recordMistake(book, slotKey, userInput, targetAnswer, timestamp = new Date().toISOString()) {
  const { wrongWords, missingWords } = getMistakeWords(userInput, targetAnswer);
  const combinedMistakes = [...wrongWords, ...missingWords];

  const currentEntry = book.slots[slotKey] || {
    slotKey,
    failCount: 0,
    consecutiveCorrect: 0,
    isResolved: false,
    firstFailedAt: timestamp,
    lastFailedAt: timestamp,
    wordMistakes: {},
    recentHistory: []
  };

  const updatedWordMistakes = { ...currentEntry.wordMistakes };
  const updatedWordFreq = { ...book.wordFrequency };

  for (const word of combinedMistakes) {
    updatedWordMistakes[word] = (updatedWordMistakes[word] || 0) + 1;
    updatedWordFreq[word] = (updatedWordFreq[word] || 0) + 1;
  }

  const newHistoryItem = {
    timestamp,
    userInput,
    wrongWords,
    missingWords
  };

  const updatedEntry = {
    ...currentEntry,
    failCount: currentEntry.failCount + 1,
    consecutiveCorrect: 0,
    isResolved: false,
    lastFailedAt: timestamp,
    wordMistakes: updatedWordMistakes,
    recentHistory: [...currentEntry.recentHistory.slice(-9), newHistoryItem]
  };

  return {
    ...book,
    slots: {
      ...book.slots,
      [slotKey]: updatedEntry
    },
    wordFrequency: updatedWordFreq
  };
}

/**
 * Ghi nhận một lần làm đúng để dần gỡ bỏ khỏi Sổ Tiếc Nuối
 * @param {object} book
 * @param {string} slotKey
 * @returns {object} updatedBook
 */
export function recordMistakeSuccess(book, slotKey) {
  const currentEntry = book.slots[slotKey];
  if (!currentEntry) return book;

  const consecutiveCorrect = currentEntry.consecutiveCorrect + 1;
  // Nếu đúng liên tiếp 3 lần -> Đánh dấu là đã khắc phục (resolved)
  const isResolved = consecutiveCorrect >= 3;

  return {
    ...book,
    slots: {
      ...book.slots,
      [slotKey]: {
        ...currentEntry,
        consecutiveCorrect,
        isResolved
      }
    }
  };
}

/**
 * Lấy danh sách các từ hay gõ sai nhiều nhất toàn bộ bài học
 * @param {object} book
 * @param {number} [limit=15]
 * @returns {Array<{ word: string, count: number }>}
 */
export function getTopMistakeWords(book, limit = 15) {
  const entries = Object.entries(book.wordFrequency || {}).map(([word, count]) => ({
    word,
    count
  }));

  entries.sort((a, b) => b.count - a.count);
  return entries.slice(0, limit);
}

/**
 * Lấy danh sách các slotKey cần ôn lại từ Sổ Tiếc Nuối (chưa khắc phục hoặc sai nhiều)
 * @param {object} book
 * @returns {string[]}
 */
export function getUnresolvedSlotKeys(book) {
  const keys = [];
  for (const [key, entry] of Object.entries(book.slots || {})) {
    if (!entry.isResolved) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Tạo một phiên thi/ôn luyện trực tiếp từ Sổ Tiếc Nuối
 * @param {object} book
 * @param {Array} allQuestions
 * @returns {object} examSession
 */
export function createMistakeExamSession(book, allQuestions) {
  const keys = getUnresolvedSlotKeys(book);
  return createExamSession({
    questions: allQuestions,
    mode: 'REVIEW_WRONG',
    wrongSlotKeys: keys
  });
}
