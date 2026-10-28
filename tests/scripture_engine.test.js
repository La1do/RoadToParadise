import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseScripture,
  buildScriptureSlots,
  MAX_INPUT_CHARS,
  MAX_SLOT_WORDS,
  SCRIPTURE_LAYOUTS
} from '../src/core/scriptureEngine.js';
import { tokenize } from '../src/core/gradeEngine.js';

test('ScriptureEngine Constants: Giá trị hằng số chính xác', () => {
  assert.equal(MAX_INPUT_CHARS, 20000);
  assert.equal(MAX_SLOT_WORDS, 1200);
  assert.equal(SCRIPTURE_LAYOUTS.PARAGRAPH, 'paragraph');
  assert.equal(SCRIPTURE_LAYOUTS.VERSE, 'verse');
});

test('parseScripture: Dạng đánh số đầu dòng với khoảng trắng ("1 text")', () => {
  const input = `1 Ban đầu có Đức Chúa Trời dựng nên trời đất.
2 Vả, đất là vô hình và trống không; sự mờ tối ở trên mặt vực;
3 Đức Chúa Trời phán: Phải có sự sáng; thì có sự sáng.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 3);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.verses[0], {
    number: 1,
    text: 'Ban đầu có Đức Chúa Trời dựng nên trời đất.'
  });
  assert.deepEqual(result.verses[1], {
    number: 2,
    text: 'Vả, đất là vô hình và trống không; sự mờ tối ở trên mặt vực;'
  });
  assert.deepEqual(result.verses[2], {
    number: 3,
    text: 'Đức Chúa Trời phán: Phải có sự sáng; thì có sự sáng.'
  });
});

test('parseScripture: Dạng đánh số đầu dòng có dấu chấm ("1. text")', () => {
  const input = `1. Trong ban đầu có Đạo.
2. Đạo ở cùng Đức Chúa Trời.
3. Muôn vật bởi Ngài làm nên.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 3);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.verses[0].number, 1);
  assert.equal(result.verses[0].text, 'Trong ban đầu có Đạo.');
  assert.equal(result.verses[1].number, 2);
  assert.equal(result.verses[1].text, 'Đạo ở cùng Đức Chúa Trời.');
  assert.equal(result.verses[2].number, 3);
  assert.equal(result.verses[2].text, 'Muôn vật bởi Ngài làm nên.');
});

test('parseScripture: Dạng đánh số đầu dòng có dấu hai chấm ("1: text")', () => {
  const input = `1: Ban đầu có Đức Chúa Trời dựng nên trời đất.
2: Vả, đất là vô hình và trống không.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 2);
  assert.equal(result.verses[0].text, 'Ban đầu có Đức Chúa Trời dựng nên trời đất.');
  assert.equal(result.verses[1].text, 'Vả, đất là vô hình và trống không.');
});

test('parseScripture: Dạng inline dấu ngoặc vuông "[n] text"', () => {
  const input = `[1] Ban đầu có Đạo, Đạo ở cùng Đức Chúa Trời, và Đạo là Đức Chúa Trời. [2] Ban đầu Ngài ở cùng Đức Chúa Trời. [3] Muôn vật bởi Ngài làm nên.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 3);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.verses[0], {
    number: 1,
    text: 'Ban đầu có Đạo, Đạo ở cùng Đức Chúa Trời, và Đạo là Đức Chúa Trời.'
  });
  assert.deepEqual(result.verses[1], {
    number: 2,
    text: 'Ban đầu Ngài ở cùng Đức Chúa Trời.'
  });
  assert.deepEqual(result.verses[2], {
    number: 3,
    text: 'Muôn vật bởi Ngài làm nên.'
  });
});

test('parseScripture: Hỗ trợ nối dòng nhiều dòng (multiline continuations)', () => {
  const input = `1 Ban đầu có Đức Chúa Trời
dựng nên trời và đất.
2 Vả, đất là vô hình và trống không;
sự mờ tối ở trên mặt vực;
Thần Đức Chúa Trời vận hành trên mặt nước.
3 Đức Chúa Trời phán:
Phải có sự sáng;
thì có sự sáng.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 3);
  assert.equal(result.verses[0].text, 'Ban đầu có Đức Chúa Trời dựng nên trời và đất.');
  assert.equal(
    result.verses[1].text,
    'Vả, đất là vô hình và trống không; sự mờ tối ở trên mặt vực; Thần Đức Chúa Trời vận hành trên mặt nước.'
  );
  assert.equal(result.verses[2].text, 'Đức Chúa Trời phán: Phải có sự sáng; thì có sự sáng.');
});

test('parseScripture: Hỗ trợ multiline continuations với định dạng [n]', () => {
  const input = `[1] Ban đầu có Đạo,
Đạo ở cùng Đức Chúa Trời.
[2] Ban đầu Ngài ở cùng
Đức Chúa Trời.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 2);
  assert.equal(result.verses[0].text, 'Ban đầu có Đạo, Đạo ở cùng Đức Chúa Trời.');
  assert.equal(result.verses[1].text, 'Ban đầu Ngài ở cùng Đức Chúa Trời.');
});

test('parseScripture: Đoạn văn không đánh số (plain unnumbered text) tạo câu 1 kèm cảnh báo tiếng Việt', () => {
  const input = `Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con Một của Ngài,
để ai tin Con ấy không bị hư mất mà được sự sống đời đời.`;

  const result = parseScripture(input);
  assert.equal(result.verses.length, 1);
  assert.equal(result.verses[0].number, 1);
  assert.equal(
    result.verses[0].text,
    'Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con Một của Ngài, để ai tin Con ấy không bị hư mất mà được sự sống đời đời.'
  );
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /câu 1/i);
});

test('parseScripture: Xử lý bảo toàn chữ (conservative) - từ chối văn bản rác phía trước câu 1', () => {
  const input = `Tiêu đề phần mở đầu chưa được đánh số
1 Ban đầu có Đức Chúa Trời dựng nên trời đất.
2 Vả, đất là vô hình.`;

  assert.throws(
    () => parseScripture(input),
    /trước câu đầu tiên/i
  );
});

test('parseScripture: Từ chối văn bản phía trước câu [1] trong định dạng inline [n]', () => {
  const input = `Lời nói đầu: [1] Ban đầu có Đạo [2] Đạo ở cùng Đức Chúa Trời`;

  assert.throws(
    () => parseScripture(input),
    /trước câu đầu tiên/i
  );
});

test('parseScripture: Từ chối trùng lặp số câu (reject duplicate verse numbers / multi-chapter lists)', () => {
  const input = `1 Ban đầu có Đức Chúa Trời...
2 Vả đất vô hình...
1 Trùng lặp câu 1 ở chương khác`;

  assert.throws(
    () => parseScripture(input),
    /trùng lặp/i
  );
});

test('parseScripture: Từ chối trùng lặp số câu trong định dạng [n]', () => {
  const input = `[1] Ban đầu có Đạo [2] Ngài ở cùng [1] Lại là câu 1`;

  assert.throws(
    () => parseScripture(input),
    /trùng lặp/i
  );
});

test('parseScripture: Từ chối số câu không dương (<= 0)', () => {
  assert.throws(
    () => parseScripture(`0 Ban đầu có Đức Chúa Trời`),
    /không hợp lệ/i
  );

  assert.throws(
    () => parseScripture(`-1 Ban đầu có Đức Chúa Trời`),
    /không hợp lệ/i
  );

  assert.throws(
    () => parseScripture(`[0] Ban đầu có Đạo`),
    /không hợp lệ/i
  );
});

test('parseScripture: Từ chối câu trống không có nội dung', () => {
  const input1 = `1.
2. Vả, đất là vô hình.`;

  assert.throws(
    () => parseScripture(input1),
    /không có nội dung/i
  );

  const input2 = `[1] [2] Nội dung câu hai`;
  assert.throws(
    () => parseScripture(input2),
    /không có nội dung/i
  );
});

test('parseScripture: Từ chối đầu vào rỗng hoặc không phải chuỗi', () => {
  assert.throws(() => parseScripture(''), /không được để trống/i);
  assert.throws(() => parseScripture('   \n\t  '), /không được để trống/i);
  assert.throws(() => parseScripture(null), /chuỗi ký tự/i);
  assert.throws(() => parseScripture(undefined), /chuỗi ký tự/i);
  assert.throws(() => parseScripture(12345), /chuỗi ký tự/i);
});

test('parseScripture: Từ chối văn bản vượt quá 20000 ký tự', () => {
  const hugeText = '1 ' + 'A'.repeat(20005);
  assert.throws(
    () => parseScripture(hugeText),
    /quá dài/i
  );
});

test('buildScriptureSlots: Chế độ paragraph mặc định gộp dải số liên tiếp ("Kh 1~8")', () => {
  const verses = Array.from({ length: 8 }, (_, i) => ({
    number: i + 1,
    text: `Nội dung của câu thứ ${i + 1}.`
  }));

  const slots = buildScriptureSlots(verses, [1, 2, 3, 4, 5, 6, 7, 8], 'paragraph', 'Kh', 1);

  assert.equal(slots.length, 1);
  assert.equal(slots[0].label, 'Kh 1~8');
  assert.ok(slots[0].id);
  assert.equal(
    slots[0].answer,
    'Nội dung của câu thứ 1. Nội dung của câu thứ 2. Nội dung của câu thứ 3. Nội dung của câu thứ 4. Nội dung của câu thứ 5. Nội dung của câu thứ 6. Nội dung của câu thứ 7. Nội dung của câu thứ 8.'
  );
});

test('buildScriptureSlots: Singleton paragraph tạo nhãn không có dấu ngã ("Kh 3")', () => {
  const verses = [
    { number: 1, text: 'Câu một.' },
    { number: 2, text: 'Câu hai.' },
    { number: 3, text: 'Đức Chúa Trời phán: Phải có sự sáng; thì có sự sáng.' }
  ];

  const slots = buildScriptureSlots(verses, [3], 'paragraph', 'Kh', 1);

  assert.equal(slots.length, 1);
  assert.equal(slots[0].label, 'Kh 3');
  assert.equal(slots[0].answer, 'Đức Chúa Trời phán: Phải có sự sáng; thì có sự sáng.');
});

test('buildScriptureSlots: Chế độ verse tạo từng câu với nhãn chương:câu ("Kh 1:1")', () => {
  const verses = [
    { number: 1, text: 'Ban đầu có Đức Chúa Trời dựng nên trời đất.' },
    { number: 2, text: 'Vả, đất là vô hình và trống không.' }
  ];

  const slots = buildScriptureSlots(verses, [1, 2], 'verse', 'Kh', 1);

  assert.equal(slots.length, 2);
  assert.equal(slots[0].label, 'Kh 1:1');
  assert.equal(slots[0].answer, 'Ban đầu có Đức Chúa Trời dựng nên trời đất.');
  assert.equal(slots[1].label, 'Kh 1:2');
  assert.equal(slots[1].answer, 'Vả, đất là vô hình và trống không.');
});

test('buildScriptureSlots: Nhiều dải số không liên tục tạo nhiều slot paragraph', () => {
  const verses = [
    { number: 1, text: 'C1' },
    { number: 2, text: 'C2' },
    { number: 3, text: 'C3' },
    { number: 5, text: 'C5' },
    { number: 6, text: 'C6' },
    { number: 9, text: 'C9' }
  ];

  // Thứ tự truyền vào xáo trộn, hàm phải tự sắp xếp và nhóm
  const slots = buildScriptureSlots(verses, [6, 1, 3, 2, 9, 5], 'paragraph', 'Kh');

  assert.equal(slots.length, 3);
  assert.equal(slots[0].label, 'Kh 1~3');
  assert.equal(slots[0].answer, 'C1 C2 C3');
  assert.equal(slots[1].label, 'Kh 5~6');
  assert.equal(slots[1].answer, 'C5 C6');
  assert.equal(slots[2].label, 'Kh 9');
  assert.equal(slots[2].answer, 'C9');
});

test('buildScriptureSlots: Bỏ qua abbreviation hoặc chapter khi không truyền', () => {
  const verses = [
    { number: 1, text: 'Câu một' },
    { number: 2, text: 'Câu hai' }
  ];

  // Không có abbreviation, không có chapter
  const slots1 = buildScriptureSlots(verses, [1, 2], 'paragraph');
  assert.equal(slots1[0].label, '1~2');

  const slots2 = buildScriptureSlots(verses, [1], 'verse');
  assert.equal(slots2[0].label, '1');
});

test('buildScriptureSlots: Kiểm tra tính toàn vẹn (integrity) và validation đầu vào', () => {
  const verses = [{ number: 1, text: 'Câu một' }];

  // Danh sách câu rỗng
  assert.throws(
    () => buildScriptureSlots([], [1]),
    /không được để trống/i
  );

  // Không chọn câu nào
  assert.throws(
    () => buildScriptureSlots(verses, []),
    /chưa chọn câu/i
  );
  assert.throws(
    () => buildScriptureSlots(verses, null),
    /chưa chọn câu/i
  );

  // Chọn câu không tồn tại trong verses
  assert.throws(
    () => buildScriptureSlots(verses, [99]),
    /không tìm thấy câu 99/i
  );

  // Verses chứa phần tử không hợp lệ
  assert.throws(
    () => buildScriptureSlots([{ number: 0, text: 'abc' }], [1]),
    /dữ liệu câu kinh thánh không hợp lệ/i
  );
  assert.throws(
    () => buildScriptureSlots([{ number: 1, text: '' }], [1]),
    /dữ liệu câu kinh thánh không hợp lệ/i
  );
});

test('buildScriptureSlots: Giới hạn 1200 từ mỗi ô dùng tokenize từ gradeEngine', () => {
  // Tạo văn bản có dấu câu phân cách: ví dụ "từ,từ.từ-từ"
  // tokenize() sẽ phân tách dấu câu thành các từ độc lập
  const longVerseWords = Array.from({ length: 1205 }, (_, i) => `từ${i}`).join(', ');
  const tokens = tokenize(longVerseWords);
  assert.ok(tokens.length > 1200, `Số lượng tokens phải > 1200, thực tế: ${tokens.length}`);

  const verses = [
    { number: 1, text: longVerseWords }
  ];

  assert.throws(
    () => buildScriptureSlots(verses, [1], 'paragraph', 'Kh', 1),
    /vượt quá giới hạn độ dài/i
  );
});
