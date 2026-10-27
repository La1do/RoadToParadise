import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { compareAnswer } from '../src/core/gradeEngine.js';
import { getStickerFeedback } from '../src/components/common/stickerFeedback.js';

test('all seven supplied cat assets are available locally', () => {
  for (const name of ['confused', 'please', 'happy', 'fist', 'angry', 'loading', 'revenge']) {
    assert.ok(existsSync(new URL(`../public/stickers/cats/${name}.png`, import.meta.url)));
  }
});

test('correct answers get a celebratory cat', () => {
  const feedback = getStickerFeedback('shocked', compareAnswer('xin chào', 'xin chào'));
  assert.ok(['cat_happy', 'cat_fist'].includes(feedback.type));
  assert.match(feedback.text, /Chuẩn rồi/);
});

test('missing words get a helpful cat and addition instructions', () => {
  const feedback = getStickerFeedback('shocked', compareAnswer('xin', 'xin chào bạn'));
  assert.ok(['cat_loading', 'cat_confused'].includes(feedback.type));
  assert.match(feedback.text, /2 từ.*\(\+\)/);
});

test('extra words get strikethrough instructions', () => {
  const feedback = getStickerFeedback('shocked', compareAnswer('xin chào nhé', 'xin chào'));
  assert.ok(['cat_angry', 'cat_revenge'].includes(feedback.type));
  assert.match(feedback.text, /1 từ thừa.*gạch ngang/);
});

test('wrong answers distinguish wrong words from missing words', () => {
  const feedback = getStickerFeedback('shocked', compareAnswer('xin bạn', 'xin chào'));
  assert.match(feedback.text, /1 từ sai\/thừa và 1 từ cần bổ sung/);
});

test('blank input gets encouragement, not a wrong-word accusation', () => {
  const feedback = getStickerFeedback('angry', compareAnswer('', 'xin chào'));
  assert.ok(['cat_please', 'cat_loading'].includes(feedback.type));
  assert.match(feedback.text, /Đừng để trống/);
});

test('a zero-score nonblank answer is not treated as blank', () => {
  const feedback = getStickerFeedback('wake_up', compareAnswer('khác', 'xin chào'));
  assert.ok(['cat_angry', 'cat_revenge'].includes(feedback.type));
  assert.match(feedback.text, /1 từ sai\/thừa và 2 từ cần bổ sung/);
});

test('reaction remains stable until its input or variation changes', () => {
  const grade = compareAnswer('xin', 'xin chào');
  assert.deepEqual(getStickerFeedback('shocked', grade, 'a:0'), getStickerFeedback('shocked', grade, 'a:0'));
  assert.notEqual(getStickerFeedback('shocked', grade, 'a:0').type, getStickerFeedback('shocked', grade, 'a:1').type);
});
