/**
 * hintEngine.js - Engine cung cấp gợi ý từ tiếp theo
 *
 * Lưu ý: Việc gọi lấy gợi ý phải kích hoạt cờ usedHint = true trong phiên học/thi
 * để spacedRepetitionEngine không tính tăng cấp độ thuộc.
 */

import { tokenize, computeLCS } from './gradeEngine.js';

/**
 * Lấy gợi ý 1 từ tiếp theo dựa trên nội dung người dùng đang gõ
 * @param {string} currentInput - Nội dung người dùng hiện đang có trong ô
 * @param {string} targetAnswer - Đáp án chuẩn của ô
 * @returns {{
 *   hintWord: string | null,
 *   nextWordIndex: number,
 *   remainingWordCount: number,
 *   isAlreadyComplete: boolean
 * }}
 */
export function getNextWordHint(currentInput, targetAnswer) {
  const userTokens = tokenize(currentInput);
  const targetTokens = tokenize(targetAnswer);

  const m = userTokens.length;
  const n = targetTokens.length;

  if (n === 0) {
    return {
      hintWord: null,
      nextWordIndex: -1,
      remainingWordCount: 0,
      isAlreadyComplete: true
    };
  }

  // Dùng LCS để tìm vị trí token trùng khớp xa nhất trong target
  const dp = computeLCS(userTokens, targetTokens);

  let i = m;
  let j = n;
  let lastMatchedTargetIndex = -1;

  while (i > 0 && j > 0) {
    if (userTokens[i - 1] === targetTokens[j - 1]) {
      if (lastMatchedTargetIndex === -1) {
        lastMatchedTargetIndex = j - 1;
      }
      i--;
      j--;
    } else if (dp[i][j - 1] >= dp[i - 1][j]) {
      j--;
    } else {
      i--;
    }
  }

  // Vị trí từ tiếp theo cần gợi ý trong targetTokens
  const nextTargetIndex = lastMatchedTargetIndex + 1;

  if (nextTargetIndex >= n) {
    return {
      hintWord: null,
      nextWordIndex: n,
      remainingWordCount: 0,
      isAlreadyComplete: true
    };
  }

  return {
    hintWord: targetTokens[nextTargetIndex],
    nextWordIndex: nextTargetIndex,
    remainingWordCount: n - nextTargetIndex,
    isAlreadyComplete: false
  };
}

/**
 * Gợi ý chỉ ký tự đầu tiên của từ tiếp theo (gợi ý nhẹ)
 * @param {string} currentInput
 * @param {string} targetAnswer
 * @returns {string | null}
 */
export function getNextCharHint(currentInput, targetAnswer) {
  const hint = getNextWordHint(currentInput, targetAnswer);
  if (!hint.hintWord) return null;
  return hint.hintWord.charAt(0);
}
