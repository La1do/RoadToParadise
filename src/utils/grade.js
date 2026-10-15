/**
 * grade.js - Chuẩn hóa và so sánh chấm điểm câu trả lời tiếng Việt
 *
 * Quy tắc:
 * 1. Bắt buộc đúng dấu tiếng Việt (sai dấu = sai chữ).
 * 2. Chuẩn hóa Unicode NFC (tránh lệch tổ hợp giữa Telex/VNI).
 * 3. Không phân biệt hoa/thường (toLowerCase).
 * 4. Bỏ dấu câu, ký tự đặc biệt, gạch nối, mũi tên: [.,:;!?'"()\[\]{}~—–→/\\<>+=_*&^%$#@| và \-]
 *    Đồng nhất ~ và - thành khoảng trắng.
 * 5. Gộp nhiều khoảng trắng liên tiếp thành 1, trim 2 đầu.
 * 6. So sánh từ (word-level diff) dùng Longest Common Subsequence (LCS).
 */

/**
 * Chuẩn hóa chuỗi văn bản thành mảng các từ (tokens)
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];

  // 1. NFC normalize
  let str = text.normalize('NFC').toLowerCase();

  // 2. Chuyển các ký tự phân cách, mũi tên, dấu ngã, gạch ngang thành khoảng trắng
  // Đồng nhất ~ và - và →, ->
  str = str.replace(/->|→|~|-|—|–/g, ' ');

  // 3. Bỏ các ký tự đặc biệt và dấu câu, chỉ giữ chữ cái tiếng Việt, số, khoảng trắng
  // Bảng chữ cái tiếng Việt bao gồm các nguyên âm có dấu và đ
  str = str.replace(/[^0-9a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]/g, ' ');

  // 4. Gộp khoảng trắng
  str = str.replace(/\s+/g, ' ').trim();

  if (!str) return [];
  return str.split(' ');
}

/**
 * Tính bảng LCS (Longest Common Subsequence) cho 2 mảng token
 * @param {string[]} a
 * @param {string[]} b
 * @returns {number[][]}
 */
function computeLCS(a, b) {
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

  const dp = computeLCS(userTokens, targetTokens);
  const m = userTokens.length;
  const n = targetTokens.length;

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
  const accuracy = n > 0 ? Math.round((matchedCount / n) * 100) : 100;

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
