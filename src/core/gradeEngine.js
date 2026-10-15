/**
 * gradeEngine.js - Engine chấm điểm và phân tích so sánh văn bản tiếng Việt
 *
 * Nguyên tắc:
 * 1. Bắt buộc đúng dấu tiếng Việt (sai dấu = sai chữ).
 * 2. Chuẩn hóa Unicode NFC (tránh lệch tổ hợp giữa Telex/VNI).
 * 3. Không phân biệt hoa/thường (toLowerCase).
 * 4. Bỏ dấu câu, ký tự đặc biệt, gạch nối, mũi tên.
 *    Đồng nhất ~ và - thành khoảng trắng.
 * 5. Gộp khoảng trắng.
 * 6. So sánh mức độ từ (word-level diff) dùng Longest Common Subsequence (LCS).
 */

/**
 * Tách văn bản thành mảng các từ đã chuẩn hóa
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];

  // NFC normalize & lowercase
  let str = text.normalize('NFC').toLowerCase();

  // Đồng nhất ký tự phân cách, mũi tên, dấu ngã, gạch ngang
  str = str.replace(/->|→|~|-|—|–/g, ' ');

  // Bỏ các ký tự đặc biệt và dấu câu, giữ lại số, chữ cái tiếng Việt và khoảng trắng
  str = str.replace(/[^0-9a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/g, ' ');

  // Gộp khoảng trắng liên tiếp
  str = str.replace(/\s+/g, ' ').trim();

  if (!str) return [];
  return str.split(' ');
}

/**
 * Tính bảng LCS (Longest Common Subsequence) cho hai mảng token
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number[][]}
 */
export function computeLCS(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * So sánh câu trả lời của người dùng với đáp án chuẩn
 * @param {string} userInput - Nội dung người dùng nhập
 * @param {string} targetAnswer - Đáp án chuẩn của câu hỏi
 * @returns {{
 *   isExact: boolean,
 *   accuracy: number,
 *   matchedCount: number,
 *   targetCount: number,
 *   userCount: number,
 *   userTokensResult: Array<{ text: string, status: 'correct' | 'wrong' }>,
 *   targetTokensResult: Array<{ text: string, status: 'correct' | 'missing' }>,
 *   diff: Array<{ text: string, type: 'correct' | 'wrong' | 'missing' }>
 * }}
 */
export function compareAnswer(userInput, targetAnswer) {
  const userTokens = tokenize(userInput);
  const targetTokens = tokenize(targetAnswer);

  const m = userTokens.length;
  const n = targetTokens.length;

  if (n === 0) {
    return {
      isExact: m === 0,
      accuracy: m === 0 ? 100 : 0,
      matchedCount: 0,
      targetCount: 0,
      userCount: m,
      userTokensResult: userTokens.map(tok => ({ text: tok, status: 'wrong' })),
      targetTokensResult: [],
      diff: userTokens.map(tok => ({ text: tok, type: 'wrong' }))
    };
  }

  const dp = computeLCS(userTokens, targetTokens);

  let i = m;
  let j = n;

  const diffRev = [];
  const userMarked = new Array(m).fill('wrong');
  const targetMarked = new Array(n).fill('missing');

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && userTokens[i - 1] === targetTokens[j - 1]) {
      diffRev.push({ text: userTokens[i - 1], type: 'correct' });
      userMarked[i - 1] = 'correct';
      targetMarked[j - 1] = 'correct';
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffRev.push({ text: targetTokens[j - 1], type: 'missing' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diffRev.push({ text: userTokens[i - 1], type: 'wrong' });
      i--;
    }
  }

  const diff = diffRev.reverse();
  const matchedCount = dp[m][n];
  const isExact = matchedCount === n && m === n;
  const accuracy = Math.round((matchedCount / n) * 100);

  const userTokensResult = userTokens.map((tok, idx) => ({
    text: tok,
    status: userMarked[idx]
  }));

  const targetTokensResult = targetTokens.map((tok, idx) => ({
    text: tok,
    status: targetMarked[idx]
  }));

  return {
    isExact,
    accuracy,
    matchedCount,
    targetCount: n,
    userCount: m,
    userTokensResult,
    targetTokensResult,
    diff
  };
}

/**
 * Trích xuất danh sách các từ sai hoặc thiếu để ghi vào sổ Tiếc nuối
 * @param {string} userInput
 * @param {string} targetAnswer
 * @returns {{ wrongWords: string[], missingWords: string[] }}
 */
export function getMistakeWords(userInput, targetAnswer) {
  const result = compareAnswer(userInput, targetAnswer);
  const wrongWords = result.userTokensResult
    .filter(t => t.status === 'wrong')
    .map(t => t.text);
  const missingWords = result.targetTokensResult
    .filter(t => t.status === 'missing')
    .map(t => t.text);

  return {
    wrongWords: Array.from(new Set(wrongWords)),
    missingWords: Array.from(new Set(missingWords))
  };
}
