import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { CUTSCENES, getCutsceneByStageId } from '../src/components/cutscenes/cutscenesData.js';

test('Cutscenes Data: Đầy đủ 4 chặng kịch bản theo yêu cầu', () => {
  assert.equal(CUTSCENES.length, 4, 'Phải có 4 chặng kịch bản');

  const stageIds = CUTSCENES.map(c => c.stageId);
  assert.deepEqual(stageIds, [1, 2, 3, 4], 'Phải có stageId từ 1 đến 4');

  // Kiểm tra thời lượng mỗi cảnh 5 - 10 giây
  CUTSCENES.forEach(scene => {
    assert.ok(scene.duration >= 5000 && scene.duration <= 10000, `Thời lượng chặng ${scene.stageId} phải từ 5 đến 10 giây (hiện tại: ${scene.duration}ms)`);
    assert.ok(Array.isArray(scene.lines) && scene.lines.length >= 3, `Chặng ${scene.stageId} phải có ít nhất 3 câu dẫn`);
    assert.ok(scene.title && scene.title.length > 0, `Chặng ${scene.stageId} phải có tiêu đề`);
    assert.ok(scene.setting && scene.setting.length > 0, `Chặng ${scene.stageId} phải có bối cảnh`);
    assert.ok(scene.startStageText && scene.startStageText.length > 0, `Chặng ${scene.stageId} phải có nút bắt đầu chặng`);
  });

  // Chặng 1: Sáng sớm phòng trọ
  const c1 = getCutsceneByStageId(1);
  const text1 = c1.lines.join(' ');
  assert.match(text1, /điện thoại/i, 'Cảnh 1 phải có chi tiết điện thoại reo');
  assert.match(text1, /dắt xe|đi học/i, 'Cảnh 1 phải có dắt xe đi học');
  assert.match(text1, /nhẩm/i, 'Cảnh 1 phải có nhẩm lại từng câu');

  // Chặng 2: Đường đi & Giảng đường
  const c2 = getCutsceneByStageId(2);
  const text2 = c2.lines.join(' ');
  assert.match(text2, /đèn đỏ/i, 'Cảnh 2 phải có dừng đèn đỏ');
  assert.match(text2, /biển hiệu|tờ rơi/i, 'Cảnh 2 phải có biển hiệu / tờ rơi chữ lộn xộn');
  assert.match(text2, /thư viện/i, 'Cảnh 2 phải có thư viện giảng đường');

  // Chặng 3: Chỗ làm thêm
  const c3 = getCutsceneByStageId(3);
  const text3 = c3.lines.join(' ');
  assert.match(text3, /bê đồ/i, 'Cảnh 3 phải có bê đồ cho khách');
  assert.match(text3, /lau/i, 'Cảnh 3 phải có lau bàn');
  assert.match(text3, /mỏi/i, 'Cảnh 3 phải có chân tay mỏi nhừ');
  assert.match(text3, /nhẩm/i, 'Cảnh 3 phải có nhẩm từng từ');

  // Chặng 4: Đêm về phòng trọ & Cổng phán xét
  const c4 = getCutsceneByStageId(4);
  const text4 = c4.lines.join(' ');
  assert.match(text4, /đêm|phòng trọ/i, 'Cảnh 4 phải có phòng trọ đêm');
  assert.match(text4, /ngọn đèn/i, 'Cảnh 4 phải có thắp ngọn đèn');
  assert.match(text4, /đọc thầm/i, 'Cảnh 4 phải có đọc thầm lại');
  assert.match(text4, /Cổng Ánh Sáng|Cổng phán xét/i, 'Cảnh 4 phải có Cổng Ánh Sáng hoặc Cổng phán xét');
});

test('Theme CSS: Kiểm tra đầy đủ 4 chặng class, biến chuẩn và media queries', () => {
  const cssPath = path.resolve('./src/styles/theme.css');
  assert.ok(fs.existsSync(cssPath), 'File src/styles/theme.css phải tồn tại');

  const css = fs.readFileSync(cssPath, 'utf8');

  // 4 class chặng
  assert.ok(css.includes('.theme-stage-1'), 'Phải có .theme-stage-1');
  assert.ok(css.includes('.theme-stage-2'), 'Phải có .theme-stage-2');
  assert.ok(css.includes('.theme-stage-3'), 'Phải có .theme-stage-3');
  assert.ok(css.includes('.theme-stage-4'), 'Phải có .theme-stage-4');

  // Các biến chuẩn
  const requiredVars = [
    '--bg-gradient',
    '--text-primary',
    '--text-secondary',
    '--card-bg',
    '--accent-warm',
    '--road-glow',
    '--light-intensity',
    '--touch-target-size'
  ];

  requiredVars.forEach(v => {
    assert.ok(css.includes(v), `Theme CSS phải định nghĩa biến ${v}`);
  });

  // min 44px
  assert.match(css, /--touch-target-size:\s*44px/);

  // prefers-reduced-motion
  assert.ok(css.includes('prefers-reduced-motion'), 'Phải hỗ trợ prefers-reduced-motion');
});

test('Bảng màu tập trung: Kiểm tra file colors.css và colors.js tồn tại và cung cấp đầy đủ tokens', () => {
  const colorsCssPath = path.resolve('./src/styles/colors.css');
  const colorsJsPath = path.resolve('./src/styles/colors.js');

  assert.ok(fs.existsSync(colorsCssPath), 'File src/styles/colors.css phải tồn tại');
  assert.ok(fs.existsSync(colorsJsPath), 'File src/styles/colors.js phải tồn tại');

  const css = fs.readFileSync(colorsCssPath, 'utf8');
  assert.ok(css.includes('--color-primary:'), 'colors.css phải có --color-primary');
  assert.ok(css.includes('--color-primary-deep:'), 'colors.css phải có --color-primary-deep');
  assert.ok(css.includes('--color-text-main:'), 'colors.css phải có --color-text-main');
  assert.ok(css.includes('--color-border:'), 'colors.css phải có --color-border');
  assert.ok(css.includes('--color-bg-ice:'), 'colors.css phải có --color-bg-ice');
  assert.ok(css.includes('--color-white:'), 'colors.css phải có --color-white');

  const themeCss = fs.readFileSync(path.resolve('./src/styles/theme.css'), 'utf8');
  assert.ok(themeCss.includes("import './colors.css'"), 'theme.css phải import colors.css');
});

