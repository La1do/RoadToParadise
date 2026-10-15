/**
 * storageEngine.js - Quản lý lưu trữ tiến độ qua localStorage (có fallback bộ nhớ khi chạy test Node.js)
 */

const memoryStore = new Map();

/**
 * Kiểm tra môi trường có localStorage hay không
 */
function isLocalStorageAvailable() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function getItem(key) {
  if (isLocalStorageAvailable()) {
    return window.localStorage.getItem(key);
  }
  return memoryStore.get(key) || null;
}

function setItem(key, value) {
  if (isLocalStorageAvailable()) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStore.set(key, value);
  }
}

function removeItem(key) {
  if (isLocalStorageAvailable()) {
    window.localStorage.removeItem(key);
  } else {
    memoryStore.delete(key);
  }
}

export const STORAGE_KEYS = {
  LEARNING_STEPS: 'mdn_learning_steps', // { [slotKey]: highestStepPassed (1-6) }
  SRS: 'mdn_srs_data',                 // { [slotKey]: slotSRS }
  MISTAKE_BOOK: 'mdn_mistake_book',     // MistakeBook
  EXAM_HISTORY: 'mdn_exam_history',     // Array<ExamSummary>
  SETTINGS: 'mdn_settings'             // { telexMode, soundEnabled, ... }
};

/**
 * Đọc dữ liệu JSON an toàn
 */
function loadJSON(key, defaultValue) {
  try {
    const raw = getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse storage key ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Ghi dữ liệu JSON an toàn
 */
function saveJSON(key, value) {
  try {
    setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save storage key ${key}:`, err);
    return false;
  }
}

// 1. Tiến độ 6 bậc học
export function loadLearningProgress() {
  return loadJSON(STORAGE_KEYS.LEARNING_STEPS, {});
}

export function saveLearningProgress(progress) {
  return saveJSON(STORAGE_KEYS.LEARNING_STEPS, progress);
}

export function updateSlotStepProgress(slotKey, stepId) {
  const current = loadLearningProgress();
  const currentMax = current[slotKey] || 0;
  if (stepId > currentMax) {
    current[slotKey] = stepId;
    saveLearningProgress(current);
  }
  return current;
}

// 2. Dữ liệu Lặp lại ngắt quãng (SRS)
export function loadSRSData() {
  return loadJSON(STORAGE_KEYS.SRS, {});
}

export function saveSRSData(srsMap) {
  return saveJSON(STORAGE_KEYS.SRS, srsMap);
}

// 3. Sổ Tiếc Nuối
export function loadMistakeBook() {
  return loadJSON(STORAGE_KEYS.MISTAKE_BOOK, { slots: {}, wordFrequency: {} });
}

export function saveMistakeBook(book) {
  return saveJSON(STORAGE_KEYS.MISTAKE_BOOK, book);
}

// 4. Lịch sử bài thi
export function loadExamHistory() {
  return loadJSON(STORAGE_KEYS.EXAM_HISTORY, []);
}

export function saveExamHistory(history) {
  return saveJSON(STORAGE_KEYS.EXAM_HISTORY, history);
}

export function addExamRecord(examSummary) {
  const history = loadExamHistory();
  history.unshift(examSummary);
  // Giữ tối đa 50 bài thi gần nhất
  return saveExamHistory(history.slice(0, 50));
}

// 5. Cài đặt
export function loadSettings() {
  return loadJSON(STORAGE_KEYS.SETTINGS, {
    soundEnabled: true,
    hapticEnabled: true,
    showHintOption: true
  });
}

export function saveSettings(settings) {
  return saveJSON(STORAGE_KEYS.SETTINGS, settings);
}

// 6. Sao lưu & phục hồi toàn bộ dữ liệu (Export / Import)
export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    learningProgress: loadLearningProgress(),
    srsData: loadSRSData(),
    mistakeBook: loadMistakeBook(),
    examHistory: loadExamHistory(),
    settings: loadSettings()
  };
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import data payload');
  }

  if (data.learningProgress) saveLearningProgress(data.learningProgress);
  if (data.srsData) saveSRSData(data.srsData);
  if (data.mistakeBook) saveMistakeBook(data.mistakeBook);
  if (data.examHistory) saveExamHistory(data.examHistory);
  if (data.settings) saveSettings(data.settings);

  return true;
}

/**
 * Xóa sạch toàn bộ dữ liệu về trạng thái ban đầu
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(k => removeItem(k));
  memoryStore.clear();
  return true;
}
