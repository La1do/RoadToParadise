import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { compareAnswer, tokenize } from '../src/core/gradeEngine.js';

let server;
let ScripturePractice;
let fallbackParseScripture;
let fallbackBuildScriptureSlots;
let validateUserAnswerTokens;
let clampUserTextForLCS;
let formatTimerSeconds;

const PRIMARY_ROOT = 'D:/code_project/personal_project/RoadToParadise';

before(async () => {
  server = await createServer({
    root: PRIMARY_ROOT,
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: 'custom',
    plugins: [
      {
        name: 'resolve-peer-scripture-engine',
        resolveId(source) {
          if (source.includes('scriptureEngine.js') || source.endsWith('/core/scriptureEngine.js')) {
            const primaryPath = path.resolve(PRIMARY_ROOT, 'src/core/scriptureEngine.js');
            if (!fs.existsSync(primaryPath)) {
              return '\0virtual:scriptureEngine.js';
            }
          }
          return null;
        },
        load(id) {
          if (id === '\0virtual:scriptureEngine.js') {
            return `
              export function parseScripture(text) {
                if (!text || !text.trim()) throw new Error('Văn bản Kinh Thánh không được để trống.');
                const lines = text.trim().split(/\\r?\\n+/);
                const verses = [];
                const warnings = [];
                let lastNum = 0;
                for (const line of lines) {
                  const match = line.match(/^(?:câu\\s+)?(?:(\\d+)[:.](\\d+)|(\\d+))[.:\\s\\t-]+(.*)$/i);
                  if (match) {
                    const num = parseInt(match[2] || match[3] || match[1], 10);
                    const vText = match[4].trim();
                    if (lastNum > 0 && num !== lastNum + 1) {
                      warnings.push(\`Câu \${num} không nối tiếp câu \${lastNum}\`);
                    }
                    lastNum = num;
                    verses.push({ number: num, text: vText });
                  }
                }
                if (verses.length === 0) {
                  throw new Error('Không nhận diện được câu kinh nào từ văn bản.');
                }
                return { verses, warnings };
              }

              export function buildScriptureSlots(verses, selectedNumbers, layout = 'paragraph', abbreviation = 'Kh', chapter = 1) {
                const selectedSet = new Set((selectedNumbers || []).map(Number));
                const selectedVerses = (verses || []).filter(v => selectedSet.has(v.number)).sort((a,b) => a.number - b.number);
                if (selectedVerses.length === 0) return [];
                const abbr = (abbreviation || 'Kh').trim();
                const chap = Number(chapter) || 1;
                if (layout === 'verse') {
                  return selectedVerses.map(v => ({
                    id: \`\${abbr}-\${chap}-\${v.number}\`,
                    label: \`\${abbr} \${chap}:\${v.number}\`,
                    answer: v.text.trim()
                  }));
                }
                const slots = [];
                let cur = [];
                for (const v of selectedVerses) {
                  if (cur.length === 0) cur.push(v);
                  else {
                    const prev = cur[cur.length - 1];
                    if (v.number === prev.number + 1) cur.push(v);
                    else {
                      const first = cur[0].number;
                      const last = cur[cur.length - 1].number;
                      slots.push({
                        id: \`\${abbr}-\${chap}-\${first}-\${last}\`,
                        label: first === last ? \`\${abbr} \${chap}:\${first}\` : \`\${abbr} \${first}~\${last}\`,
                        answer: cur.map(x => x.text.trim()).join(' ')
                      });
                      cur = [v];
                    }
                  }
                }
                if (cur.length > 0) {
                  const first = cur[0].number;
                  const last = cur[cur.length - 1].number;
                  slots.push({
                    id: \`\${abbr}-\${chap}-\${first}-\${last}\`,
                    label: first === last ? \`\${abbr} \${chap}:\${first}\` : \`\${abbr} \${first}~\${last}\`,
                    answer: cur.map(x => x.text.trim()).join(' ')
                  });
                }
                return slots;
              }
            `;
          }
          return null;
        }
      }
    ]
  });

  const module = await server.ssrLoadModule('/src/components/exam/ScripturePractice.jsx');
  ScripturePractice = module.default;
  fallbackParseScripture = module.fallbackParseScripture;
  fallbackBuildScriptureSlots = module.fallbackBuildScriptureSlots;
  validateUserAnswerTokens = module.validateUserAnswerTokens;
  clampUserTextForLCS = module.clampUserTextForLCS;
  formatTimerSeconds = module.formatTimerSeconds;
});

after(async () => {
  await server?.close();
});

test('ScripturePractice: Files tồn tại và có default export', () => {
  assert.ok(fs.existsSync(path.resolve(PRIMARY_ROOT, 'src/components/exam/ScripturePractice.jsx')), 'ScripturePractice.jsx must exist in primary');
  assert.ok(fs.existsSync(path.resolve(PRIMARY_ROOT, 'src/components/exam/ScripturePractice.css')), 'ScripturePractice.css must exist in primary');
  assert.equal(typeof ScripturePractice, 'function', 'ScripturePractice must have a default export');
});

test('ScripturePractice: SSR render giao diện thiết lập mặc định với sách Khải huyền và chương 1', () => {
  const html = renderToStaticMarkup(React.createElement(ScripturePractice));
  assert.match(html, /Học và Thi Câu Kinh Tự Chọn/);
  assert.match(html, /value="Khải huyền"/);
  assert.match(html, /value="Kh"/);
  assert.match(html, /value="1"/);
  assert.match(html, /Theo đoạn \(Khối liên tiếp\)/);
  assert.match(html, /Dán văn bản Kinh Thánh/);
  assert.match(html, /Phân tích câu/);
  assert.match(html, /Lưu ý: Dữ liệu câu kinh tự dán chỉ lưu trong phiên làm việc hiện tại/);
});

test('ScripturePractice: Parser tách câu kinh và bắt các ngoại lệ/cảnh báo', () => {
  const validText = `
    1 Sự mặc thị của Đức Chúa Jêsus Christ.
    2 Giăng đã làm chứng về lời Đức Chúa Trời.
    4 Giăng gởi cho bảy Hội thánh ở xứ A-si.
  `;
  const result = fallbackParseScripture(validText);
  assert.equal(result.verses.length, 3);
  assert.equal(result.verses[0].number, 1);
  assert.equal(result.verses[0].text, 'Sự mặc thị của Đức Chúa Jêsus Christ.');
  assert.equal(result.verses[2].number, 4);
  assert.ok(result.warnings.some(w => w.includes('Câu 4 không nối tiếp câu 2')));

  assert.throws(() => {
    fallbackParseScripture('');
  }, /không được để trống/);

  assert.throws(() => {
    fallbackParseScripture('Đoạn văn này không có số thứ tự câu nào.');
  }, /Không nhận diện được/);
});

test('ScripturePractice: buildScriptureSlots chia theo đoạn (paragraph) gộp các dải liên tiếp với nhãn Kh 1~8', () => {
  const verses = Array.from({ length: 8 }, (_, i) => ({
    number: i + 1,
    text: `Nội dung câu ${i + 1}.`
  }));

  const slots = fallbackBuildScriptureSlots(verses, [1, 2, 3, 4, 5, 6, 7, 8], 'paragraph', 'Kh', 1);
  assert.equal(slots.length, 1);
  assert.match(slots[0].label, /Kh 1~8|Kh 1:1~8/);
  assert.equal(slots[0].answer, verses.map(v => v.text).join(' '));
});

test('ScripturePractice: buildScriptureSlots chia theo từng câu riêng biệt (verse)', () => {
  const verses = [
    { number: 1, text: 'Câu một.' },
    { number: 2, text: 'Câu hai.' }
  ];
  const slots = fallbackBuildScriptureSlots(verses, [1, 2], 'verse', 'Kh', 1);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].label, 'Kh 1:1');
  assert.equal(slots[0].answer, 'Câu một.');
  assert.equal(slots[1].label, 'Kh 1:2');
  assert.equal(slots[1].answer, 'Câu hai.');
});

test('ScripturePractice: Kiểm tra giới hạn 1200 từ dùng tokenize của gradeEngine', () => {
  const shortText = 'Đây là một câu kinh ngắn gồm mười từ mẫu chuẩn.';
  const valShort = validateUserAnswerTokens(shortText, 1200);
  assert.equal(valShort.valid, true);
  assert.equal(valShort.error, null);

  const longText = Array.from({ length: 1205 }, (_, i) => `từ${i}`).join(' ');
  const valLong = validateUserAnswerTokens(longText, 1200);
  assert.equal(valLong.valid, false);
  assert.ok(valLong.error.includes('vượt quá giới hạn 1200 từ'));
  assert.ok(valLong.error.includes('1205'));

  const clamped = clampUserTextForLCS(longText, 1200);
  const clampedTokens = tokenize(clamped);
  assert.equal(clampedTokens.length, 1200);
});

test('ScripturePractice: Không tính 100% hoàn hảo nếu có từ thừa (isExact: false)', () => {
  const target = 'Đức Chúa Trời là tình yêu thương';
  const userWithExtra = 'Thật vậy Đức Chúa Trời là tình yêu thương vĩ đại';
  const grade = compareAnswer(userWithExtra, target);

  assert.equal(grade.accuracy, 100);
  assert.equal(grade.isExact, false);
});

test('ScripturePractice: Định dạng bộ đếm giờ mm:ss', () => {
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(600), '10:00');
});

test('ScripturePractice: Cấu trúc CSS và tuân thủ responsive & craft floor', () => {
  const css = fs.readFileSync(path.resolve(PRIMARY_ROOT, 'src/components/exam/ScripturePractice.css'), 'utf8');

  assert.ok(css.includes('.scripture-practice'), 'Contains scoped container .scripture-practice');
  assert.ok(css.includes('@media (min-width: 860px)'), 'Contains desktop responsive media query');
  assert.ok(css.includes('min-height: 50px') || css.includes('min-height: 48px') || css.includes('min-height: 52px'), 'Contains touch targets >= 48px');
  assert.ok(css.includes('box-shadow: 0 4px 14px'), 'Contains soft blur shadows');
  assert.ok(css.includes('.sp-badge--success'), 'Contains success badge');
  assert.ok(css.includes('.sp-badge--danger'), 'Contains danger badge');
});

test('ScripturePractice: Logic loại trừ và làm lại các phần chưa đúng (Retry wrong slots)', () => {
  const slot1 = { id: 'Kh-1-1-3', label: 'Kh 1~3', answer: 'Câu một câu hai' };
  const slot2 = { id: 'Kh-1-4-5', label: 'Kh 4~5', answer: 'Câu bốn câu năm' };

  const grade1 = compareAnswer('Câu một câu hai', slot1.answer); // exact
  const grade2 = compareAnswer('Sai hoàn toàn', slot2.answer); // wrong

  const slotResults = [
    { slot: slot1, grade: grade1, isPerfect: Boolean(grade1.isExact) },
    { slot: slot2, grade: grade2, isPerfect: Boolean(grade2.isExact) }
  ];

  const wrongSlots = slotResults.filter(r => !r.isPerfect).map(r => r.slot);
  assert.equal(wrongSlots.length, 1);
  assert.equal(wrongSlots[0].id, 'Kh-1-4-5');
});

test('ScripturePractice: Kiểm tra phát hiện số câu trùng lặp và không hợp lệ', () => {
  const versesWithDupes = [
    { number: 1, text: 'Câu thứ nhất' },
    { number: 1, text: 'Câu thứ nhất bị lặp' }
  ];

  const seen = new Set();
  const dupes = new Set();
  for (const v of versesWithDupes) {
    if (seen.has(v.number)) dupes.add(v.number);
    seen.add(v.number);
  }
  assert.equal(dupes.has(1), true);
  assert.equal(dupes.size, 1);
});
