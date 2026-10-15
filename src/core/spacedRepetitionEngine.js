/**
 * spacedRepetitionEngine.js - Quản lý độ thuộc theo từng ô và thuật toán lặp lại ngắt quãng (1/3/7/14/30 ngày)
 *
 * Quy tắc:
 * 1. Chu kỳ ngắt quãng chuẩn: 1 ngày, 3 ngày, 7 ngày, 14 ngày, 30 ngày (5 cấp độ thuộc).
 * 2. Trả lời đúng không dùng gợi ý: tăng cấp độ thuộc, kéo dài chu kỳ ôn tập.
 * 3. Trả lời sai: hạ cấp độ thuộc, đưa chu kỳ về 1 ngày.
 * 4. Tùy chọn gợi ý 1 từ: DÙNG GỢI Ý THÌ KHÔNG TÍNH ĐỘ THUỘC (cấp độ không tăng, chu kỳ đặt về 1 ngày).
 */

export const INTERVAL_DAYS = [1, 3, 7, 14, 30];
export const MAX_MASTERY_LEVEL = 5;

/**
 * Khởi tạo dữ liệu SRS cho một ô
 * @param {string} slotKey
 * @returns {object}
 */
export function initSlotSRS(slotKey) {
  return {
    slotKey,
    masteryLevel: 0, // 0: chưa thuộc, 1-5: các cấp độ thuộc
    intervalDays: 1,
    consecutiveSuccesses: 0,
    totalReviews: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    history: []
  };
}

/**
 * Cập nhật kết quả ôn tập cho một ô
 * @param {object} currentSRS - Dữ liệu SRS hiện tại của ô
 * @param {object} params
 * @param {boolean} params.isCorrect - Trả lời đúng hoàn toàn
 * @param {boolean} [params.usedHint] - Có dùng gợi ý hay không
 * @param {Date|string} [params.reviewDate] - Thời điểm làm bài (mặc định hiện tại)
 * @returns {object} updatedSRS
 */
export function recordReview(currentSRS, { isCorrect, usedHint = false, reviewDate = new Date() }) {
  const dateObj = typeof reviewDate === 'string' ? new Date(reviewDate) : reviewDate;
  const nowIso = dateObj.toISOString();

  let { masteryLevel, consecutiveSuccesses, totalReviews, history } = currentSRS;
  totalReviews++;

  let nextInterval = 1;

  if (usedHint) {
    // Quy tắc: Dùng gợi ý thì không tính độ thuộc
    // Giữ nguyên masteryLevel hiện tại (không tăng), chu kỳ ôn sớm (1 ngày)
    nextInterval = 1;
    // Không tăng consecutiveSuccesses
  } else if (isCorrect) {
    consecutiveSuccesses++;
    masteryLevel = Math.min(MAX_MASTERY_LEVEL, masteryLevel + 1);
    const intervalIndex = Math.min(masteryLevel - 1, INTERVAL_DAYS.length - 1);
    nextInterval = INTERVAL_DAYS[Math.max(0, intervalIndex)];
  } else {
    // Trả lời sai: reset chuỗi đúng và lùi cấp
    consecutiveSuccesses = 0;
    masteryLevel = Math.max(0, masteryLevel - 1);
    nextInterval = 1;
  }

  // Tính thời điểm ôn tập tiếp theo
  const nextDate = new Date(dateObj.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  const historyEntry = {
    reviewedAt: nowIso,
    isCorrect,
    usedHint,
    resultingLevel: masteryLevel,
    intervalDays: nextInterval
  };

  return {
    ...currentSRS,
    masteryLevel,
    intervalDays: nextInterval,
    consecutiveSuccesses,
    totalReviews,
    lastReviewedAt: nowIso,
    nextReviewAt: nextDate.toISOString(),
    history: [...history.slice(-19), historyEntry] // lưu tối đa 20 lần gần nhất
  };
}

/**
 * Kiểm tra xem ô đã đến hạn cần ôn tập hay chưa
 * @param {object} slotSRS
 * @param {Date|string} [currentDate]
 * @returns {boolean}
 */
export function isDue(slotSRS, currentDate = new Date()) {
  if (!slotSRS || !slotSRS.nextReviewAt) return true; // Chưa học lần nào -> Đến hạn học
  const checkTime = typeof currentDate === 'string' ? new Date(currentDate).getTime() : currentDate.getTime();
  const nextTime = new Date(slotSRS.nextReviewAt).getTime();
  return checkTime >= nextTime;
}

/**
 * Lọc danh sách các ô đã đến hạn ôn tập
 * @param {Record<string, object>} allSRSMap - Map slotKey -> slotSRS
 * @param {Date|string} [currentDate]
 * @returns {string[]} Danh sách slotKey đến hạn
 */
export function getDueSlotKeys(allSRSMap, currentDate = new Date()) {
  const dueKeys = [];
  for (const [key, srs] of Object.entries(allSRSMap)) {
    if (isDue(srs, currentDate)) {
      dueKeys.push(key);
    }
  }
  return dueKeys;
}

/**
 * Tính phần trăm độ thuộc tổng thể của cả 20 câu (50 ô)
 * @param {Record<string, object>} allSRSMap
 * @param {number} totalSlots - Tổng số ô (mặc định 50)
 * @returns {number} Phần trăm (0 - 100)
 */
export function calculateOverallMastery(allSRSMap, totalSlots = 50) {
  if (totalSlots === 0) return 0;
  let totalLevel = 0;
  for (const srs of Object.values(allSRSMap)) {
    totalLevel += srs.masteryLevel || 0;
  }
  const maxPossible = totalSlots * MAX_MASTERY_LEVEL;
  return Math.round((totalLevel / maxPossible) * 100);
}

/**
 * Thống kê số lượng ô theo từng cấp độ thuộc (0 đến 5)
 * @param {Record<string, object>} allSRSMap
 * @param {number} totalSlots
 * @returns {{ [level: number]: number }}
 */
export function getMasteryBreakdown(allSRSMap, totalSlots = 50) {
  const breakdown = { 0: totalSlots, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let tracked = 0;

  for (const srs of Object.values(allSRSMap)) {
    const lvl = srs.masteryLevel || 0;
    breakdown[lvl] = (breakdown[lvl] || 0) + 1;
    tracked++;
  }

  // Cấp 0 là các ô còn lại chưa học
  breakdown[0] = Math.max(0, totalSlots - tracked) + (breakdown[0] - totalSlots);
  return breakdown;
}
