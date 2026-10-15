import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  STAGES_CONFIG,
  getMasteryGlowClass,
  getMasteryLabel,
  calculateRoadmapStats
} from '../src/components/map/dayRoadMapConfig.js';
import questionsData from '../src/data/questions.json' with { type: 'json' };

test('DayRoadMap Config: Đầy đủ 4 chặng theo đúng phạm vi câu hỏi và cốt truyện', () => {
  assert.equal(STAGES_CONFIG.length, 4, 'Bản đồ phải chia làm 4 chặng');

  // Chặng 1: Sáng phòng trọ (Câu 1 - 5)
  const s1 = STAGES_CONFIG[0];
  assert.equal(s1.id, 1);
  assert.match(s1.title, /Sáng phòng trọ/i);
  assert.deepEqual(s1.questionRange, [1, 5]);

  // Chặng 2: Đường & Giảng đường (Câu 6 - 10)
  const s2 = STAGES_CONFIG[1];
  assert.equal(s2.id, 2);
  assert.match(s2.title, /Đường & Giảng đường/i);
  assert.deepEqual(s2.questionRange, [6, 10]);

  // Chặng 3: Chỗ làm thêm (Câu 11 - 15)
  const s3 = STAGES_CONFIG[2];
  assert.equal(s3.id, 3);
  assert.match(s3.title, /Chỗ làm thêm/i);
  assert.deepEqual(s3.questionRange, [11, 15]);

  // Chặng 4: Đêm phòng trọ & Cổng phán xét (Câu 16 - 20)
  const s4 = STAGES_CONFIG[3];
  assert.equal(s4.id, 4);
  assert.match(s4.title, /Đêm phòng trọ & Cổng phán xét/i);
  assert.deepEqual(s4.questionRange, [16, 20]);
});

test('DayRoadMap Mastery Glow: 4 mức phát sáng ấm dần theo độ thuộc', () => {
  // Level 0: xám mờ
  assert.equal(getMasteryGlowClass(0), 'slot-glow-0');

  // Level 1-2: vàng nhạt
  assert.equal(getMasteryGlowClass(1), 'slot-glow-1-2');
  assert.equal(getMasteryGlowClass(2), 'slot-glow-1-2');

  // Level 3-4: vàng rực
  assert.equal(getMasteryGlowClass(3), 'slot-glow-3-4');
  assert.equal(getMasteryGlowClass(4), 'slot-glow-3-4');

  // Level 5: hào quang sáng chói
  assert.equal(getMasteryGlowClass(5), 'slot-glow-5');

  // Label mô tả
  assert.match(getMasteryLabel(0), /xám mờ/i);
  assert.match(getMasteryLabel(1), /vàng nhạt/i);
  assert.match(getMasteryLabel(3), /vàng rực/i);
  assert.match(getMasteryLabel(5), /hào quang sáng chói/i);
});

test('DayRoadMap Data: 20 câu hỏi tương ứng tổng cộng chính xác 50 ô', () => {
  assert.equal(questionsData.questions.length, 20);

  const totalSlots = questionsData.questions.reduce((sum, q) => sum + q.slots.length, 0);
  assert.equal(totalSlots, 50, 'Tổng số ô của 20 câu phải chính xác là 50 ô');

  // Mỗi câu có ít nhất 1 ô tròn
  questionsData.questions.forEach((q) => {
    assert.ok(q.slots.length >= 1, `Câu ${q.id} phải có ít nhất 1 slot`);
    q.slots.forEach((s) => {
      assert.ok(s.label, `Slot trong câu ${q.id} phải có nhãn (vd: ①)`);
      assert.ok(s.answer, `Slot trong câu ${q.id} phải có đáp án`);
    });
  });

  // Kiểm tra hàm calculateRoadmapStats với data mẫu
  const mockSRS = {
    'q1_s1': { masteryLevel: 3 },
    'q1_s2': { masteryLevel: 5 },
    'q2_s1': { masteryLevel: 2 }
  };
  const mockMistake = {
    slots: {
      'q1_s1': { failCount: 2, isResolved: false },
      'q1_s2': { failCount: 1, isResolved: true }
    }
  };
  const stats = calculateRoadmapStats(questionsData.questions, mockSRS, mockMistake);
  assert.equal(stats.totalSlots, 50);
  assert.equal(stats.totalScore, 10); // 3 + 5 + 2
  assert.equal(stats.masteredCount, 2); // q1_s1 (lvl 3) & q1_s2 (lvl 5)
  assert.equal(stats.masteryRatio, 10 / 250);
  assert.equal(stats.masteryPercentage, 4);
  assert.equal(stats.unresolvedMistakes, 1);
});

test('DayRoadMap CSS: Chứa cấu hình mobile-first (360-430px) và biến --do-thuoc', () => {
  const cssPath = path.resolve('src/components/map/DayRoadMap.css');
  assert.ok(fs.existsSync(cssPath), 'DayRoadMap.css phải tồn tại');

  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Kiểm tra mobile-first 360 - 430px
  assert.match(cssContent, /max-width:\s*430px/i, 'CSS phải có max-width 430px');
  assert.match(cssContent, /min-width:\s*320px/i, 'CSS phải hỗ trợ min-width 320px');

  // Kiểm tra biến --do-thuoc
  assert.match(cssContent, /--do-thuoc/i, 'CSS phải dùng biến --do-thuoc');

  // Kiểm tra 4 class phát sáng
  assert.match(cssContent, /\.slot-glow-0/, 'CSS phải có class slot-glow-0 (xám mờ)');
  assert.match(cssContent, /\.slot-glow-1-2/, 'CSS phải có class slot-glow-1-2 (vàng nhạt)');
  assert.match(cssContent, /\.slot-glow-3-4/, 'CSS phải có class slot-glow-3-4 (vàng rực)');
  assert.match(cssContent, /\.slot-glow-5/, 'CSS phải có class slot-glow-5 (hào quang sáng chói)');

  // Kiểm tra hiệu ứng con đường và Cổng Thiên Đàng
  assert.match(cssContent, /\.road-svg-glow/, 'CSS phải có đường phát sáng');
  assert.match(cssContent, /\.heaven-aurora-glow/, 'CSS phải có hào quang Cổng Thiên Đàng');
});
