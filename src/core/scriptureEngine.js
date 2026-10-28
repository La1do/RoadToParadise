/**
 * scriptureEngine.js - Engine phân tích văn bản kinh thánh và tạo các ô học/thi (slots)
 *
 * Nhiệm vụ chính:
 * 1. parseScripture(text):
 *    - Phân tích cú pháp văn bản kinh thánh thành danh sách { verses: [{ number, text }], warnings: [] }.
 *    - Hỗ trợ các định dạng câu phổ biến:
 *      + Đầu dòng có số: "1 text", "1. text", "1: text"
 *      + Inline có ngoặc: "[n] text"
 *      + Nối tiếp nhiều dòng (multiline continuations)
 *      + Văn bản thường không đánh số (gán câu 1 kèm warning)
 *    - Từ chối các trường hợp lỗi (ném Error tiếng Việt rõ nghĩa):
 *      + Trùng lặp số câu (reject duplicate numbers / multi-chapter lists)
 *      + Số câu không dương (<= 0)
 *      + Câu rỗng không có chữ
 *      + Văn bản quá giới hạn 20.000 ký tự
 *      + Văn bản rác/mở đầu không rõ câu trước câu đầu tiên (bảo toàn không làm mất chữ âm thầm)
 *
 * 2. buildScriptureSlots(verses, selectedNumbers, layout, abbreviation, chapter):
 *    - Tạo các ô học/thi [{ id, label, answer }].
 *    - layout:
 *      + 'paragraph' (mặc định): Gộp các dải câu liên tiếp (ví dụ: Kh 1~8, hoặc singleton: Kh 3)
 *      + 'verse': Tách từng câu riêng lẻ (ví dụ: Kh 1:1, Kh 1:2)
 *    - Giới hạn độ dài: Tối đa 1200 từ mỗi ô dùng tokenize từ gradeEngine.
 */

import { tokenize } from './gradeEngine.js';

export const MAX_INPUT_CHARS = 20000;
export const MAX_SLOT_WORDS = 1200;

export const SCRIPTURE_LAYOUTS = {
  PARAGRAPH: 'paragraph',
  VERSE: 'verse'
};

/**
 * Phân tích văn bản kinh thánh
 * @param {string} text
 * @returns {{ verses: Array<{ number: number, text: string }>, warnings: string[] }}
 */
export function parseScripture(text) {
  if (typeof text !== 'string') {
    throw new Error('Văn bản kinh thánh phải là chuỗi ký tự.');
  }

  if (text.length > MAX_INPUT_CHARS) {
    throw new Error(`Văn bản quá dài (${text.length} ký tự, tối đa ${MAX_INPUT_CHARS} ký tự).`);
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Văn bản không được để trống.');
  }

  const hasBracketedVerses = /\[\s*-?\d+\s*\]/.test(text);
  const hasNumberedLines = /^\s*-?\d+(?:[\.\:]|\s)/m.test(text);

  // Nếu có định dạng [n] và (không có dạng số đầu dòng HOẶC câu đầu tiên bắt đầu bằng [n])
  if (hasBracketedVerses && (!hasNumberedLines || /^\s*\[\s*-?\d+\s*\]/.test(trimmedText))) {
    return parseBracketedScripture(text);
  }

  return parseLineBasedScripture(text);
}

/**
 * Phân tích định dạng [n] (hỗ trợ cả inline và xuống dòng)
 * @param {string} text
 * @returns {{ verses: Array<{ number: number, text: string }>, warnings: string[] }}
 */
function parseBracketedScripture(text) {
  const bracketRegex = /\[\s*(-?\d+)\s*\]/g;
  const matches = Array.from(text.matchAll(bracketRegex));

  if (matches.length === 0) {
    throw new Error('Không tìm thấy định dạng số câu hợp lệ.');
  }

  // Bảo toàn chữ: kiểm tra xem có văn bản nào nằm trước câu đầu tiên không
  const leadingText = text.slice(0, matches[0].index).trim();
  if (leadingText.length > 0) {
    const preview = leadingText.slice(0, 40);
    throw new Error(
      `Phát hiện nội dung không thuộc câu nào trước câu đầu tiên: "${preview}${leadingText.length > 40 ? '...' : ''}". Vui lòng kiểm tra lại.`
    );
  }

  const verses = [];
  const seenNumbers = new Set();

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const num = parseInt(match[1], 10);

    if (num <= 0) {
      throw new Error(`Số câu không hợp lệ: ${num} (số câu phải là số nguyên dương lớn hơn 0).`);
    }

    if (seenNumbers.has(num)) {
      throw new Error(
        `Trùng lặp số câu: câu ${num} xuất hiện nhiều lần (vui lòng chỉ nhập từng chương, không gộp nhiều chương).`
      );
    }
    seenNumbers.add(num);

    const startIndex = match.index + match[0].length;
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const rawVerseText = text.slice(startIndex, nextIndex);
    const cleanedText = rawVerseText.replace(/\s+/g, ' ').trim();

    if (!cleanedText) {
      throw new Error(`Câu ${num} không có nội dung.`);
    }

    verses.push({ number: num, text: cleanedText });
  }

  return { verses, warnings: [] };
}

/**
 * Phân tích định dạng số ở đầu dòng ('1 text', '1. text', '1: text', multiline continuations)
 * @param {string} text
 * @returns {{ verses: Array<{ number: number, text: string }>, warnings: string[] }}
 */
function parseLineBasedScripture(text) {
  const lines = text.split(/\r?\n/);
  // Khớp: 1 text, 1. text, 1.text, 1: text, hoặc 1 / 1. đứng riêng
  const lineVerseRegex = /^\s*(-?\d+)(?:(\.|\:)\s*(.*)|\s+(.*)|\s*$)/;

  let currentVerse = null;
  const verses = [];
  const seenNumbers = new Set();
  const leadingLines = [];
  const warnings = [];

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) {
      continue;
    }

    const match = rawLine.match(lineVerseRegex);
    if (match) {
      const num = parseInt(match[1], 10);

      if (num <= 0) {
        throw new Error(`Số câu không hợp lệ: ${num} (số câu phải là số nguyên dương lớn hơn 0).`);
      }

      if (seenNumbers.has(num)) {
        throw new Error(
          `Trùng lặp số câu: câu ${num} xuất hiện nhiều lần (vui lòng chỉ nhập từng chương, không gộp nhiều chương).`
        );
      }

      // Bảo toàn chữ: kiểm tra văn bản nằm trước câu đầu tiên
      if (leadingLines.length > 0 && !currentVerse) {
        const preview = leadingLines.join(' ').slice(0, 40);
        throw new Error(
          `Phát hiện nội dung không thuộc câu nào trước câu đầu tiên: "${preview}...". Vui lòng kiểm tra lại.`
        );
      }

      // Đóng câu trước đó nếu có
      if (currentVerse) {
        const finishedText = currentVerse.parts.join(' ').replace(/\s+/g, ' ').trim();
        if (!finishedText) {
          throw new Error(`Câu ${currentVerse.number} không có nội dung.`);
        }
        verses.push({ number: currentVerse.number, text: finishedText });
      }

      const initialText = (match[3] !== undefined ? match[3] : (match[4] !== undefined ? match[4] : '')).trim();
      currentVerse = {
        number: num,
        parts: initialText ? [initialText] : []
      };
      seenNumbers.add(num);
    } else {
      if (!currentVerse) {
        leadingLines.push(trimmedLine);
      } else {
        // Nối dòng multiline continuation
        currentVerse.parts.push(trimmedLine);
      }
    }
  }

  // Kết thúc duyệt các dòng
  if (leadingLines.length > 0 && !currentVerse) {
    // Trường hợp văn bản thuần túy không có số câu nào: gán câu 1 kèm warning
    const fullText = leadingLines.join(' ').replace(/\s+/g, ' ').trim();
    if (!fullText) {
      throw new Error('Văn bản không được để trống.');
    }
    verses.push({ number: 1, text: fullText });
    warnings.push('Văn bản không có số câu, mặc định gán là câu 1.');
  } else if (currentVerse) {
    const finishedText = currentVerse.parts.join(' ').replace(/\s+/g, ' ').trim();
    if (!finishedText) {
      throw new Error(`Câu ${currentVerse.number} không có nội dung.`);
    }
    verses.push({ number: currentVerse.number, text: finishedText });
  }

  return { verses, warnings };
}

/**
 * Xây dựng các slot bài học/bài thi từ danh sách câu đã chọn
 * @param {Array<{ number: number, text: string }>} verses - Danh sách câu từ parseScripture
 * @param {number[] | Iterable<number>} selectedNumbers - Danh sách số câu được chọn học
 * @param {'paragraph' | 'verse'} [layout='paragraph'] - Kiểu bố cục (mặc định paragraph)
 * @param {string} [abbreviation=''] - Tên viết tắt sách (ví dụ: 'Kh')
 * @param {number | string | null} [chapter=null] - Số chương (ví dụ: 1)
 * @returns {Array<{ id: string, label: string, answer: string }>}
 */
export function buildScriptureSlots(
  verses,
  selectedNumbers,
  layout = SCRIPTURE_LAYOUTS.PARAGRAPH,
  abbreviation = '',
  chapter = null
) {
  if (!Array.isArray(verses) || verses.length === 0) {
    throw new Error('Danh sách câu kinh thánh (verses) không được để trống.');
  }

  for (const v of verses) {
    if (
      !v ||
      typeof v.number !== 'number' ||
      !Number.isInteger(v.number) ||
      v.number <= 0 ||
      typeof v.text !== 'string' ||
      !v.text.trim()
    ) {
      throw new Error(
        'Dữ liệu câu kinh thánh không hợp lệ (mỗi câu phải có số câu nguyên dương và nội dung không rỗng).'
      );
    }
  }

  if (!selectedNumbers) {
    throw new Error('Chưa chọn câu kinh thánh nào để tạo bài học.');
  }

  const selectedList = Array.from(selectedNumbers);
  if (selectedList.length === 0) {
    throw new Error('Chưa chọn câu kinh thánh nào để tạo bài học.');
  }

  const verseMap = new Map();
  for (const v of verses) {
    verseMap.set(v.number, v);
  }

  for (const num of selectedList) {
    if (typeof num !== 'number' || !Number.isInteger(num) || num <= 0) {
      throw new Error(`Số câu đã chọn không hợp lệ: ${num}.`);
    }
    if (!verseMap.has(num)) {
      throw new Error(`Không tìm thấy câu ${num} trong danh sách câu kinh thánh đã phân tích.`);
    }
  }

  const sortedNumbers = Array.from(new Set(selectedList)).sort((a, b) => a - b);
  const effectiveLayout = layout === SCRIPTURE_LAYOUTS.VERSE ? SCRIPTURE_LAYOUTS.VERSE : SCRIPTURE_LAYOUTS.PARAGRAPH;
  const abbrev = (abbreviation || '').trim();
  const prefix = abbrev ? `${abbrev} ` : '';
  const chap =
    chapter !== undefined && chapter !== null && String(chapter).trim() !== ''
      ? String(chapter).trim()
      : null;

  const slots = [];

  if (effectiveLayout === SCRIPTURE_LAYOUTS.VERSE) {
    for (const num of sortedNumbers) {
      const verse = verseMap.get(num);
      const answer = verse.text.trim();
      const label = `${prefix}${chap ? `${chap}:` : ''}${num}`;
      const id = `v${num}`;
      slots.push({ id, label, answer });
    }
  } else {
    // Chế độ paragraph: gộp các dải câu liên tiếp
    const ranges = [];
    let currentRange = [sortedNumbers[0]];

    for (let i = 1; i < sortedNumbers.length; i++) {
      const prev = sortedNumbers[i - 1];
      const curr = sortedNumbers[i];
      if (curr === prev + 1) {
        currentRange.push(curr);
      } else {
        ranges.push(currentRange);
        currentRange = [curr];
      }
    }
    ranges.push(currentRange);

    for (const range of ranges) {
      const start = range[0];
      const end = range[range.length - 1];
      const answer = range.map(n => verseMap.get(n).text.trim()).join(' ');
      const label = start === end ? `${prefix}${start}` : `${prefix}${start}~${end}`;
      const id = start === end ? `v${start}` : `v${start}-${end}`;
      slots.push({ id, label, answer });
    }
  }

  // Giới hạn số lượng từ tối đa 1200 từ mỗi ô dùng tokenize từ gradeEngine
  for (const slot of slots) {
    const tokens = tokenize(slot.answer);
    if (tokens.length > MAX_SLOT_WORDS) {
      throw new Error(
        `Ô câu hỏi "${slot.label}" vượt quá giới hạn độ dài (${tokens.length} từ, tối đa ${MAX_SLOT_WORDS} từ). Vui lòng chọn phạm vi câu nhỏ hơn.`
      );
    }
  }

  return slots;
}
