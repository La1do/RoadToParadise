import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { compareAnswer } from '../src/core/gradeEngine.js';
import {
  getStickerFeedback,
  EXTENDED_REACTION_POOLS,
  SORA_CAT_STICKERS,
  SMILE_MEME_STICKERS
} from '../src/components/common/stickerFeedback.js';

test('all seven supplied cat assets are available locally', () => {
  for (const name of ['confused', 'please', 'happy', 'fist', 'angry', 'loading', 'revenge']) {
    assert.ok(existsSync(new URL(`../public/stickers/cats/${name}.png`, import.meta.url)));
  }
});

test('all 40 deduplicated Sora cat assets exist locally and are defined', () => {
  const keys = Object.keys(SORA_CAT_STICKERS);
  assert.equal(keys.length, 40);
  for (const key of keys) {
    const [file, alt, text, mood] = SORA_CAT_STICKERS[key];
    assert.ok(existsSync(new URL(`../public/stickers/cats/${file}.png`, import.meta.url)), `File cats/${file}.png must exist`);
    assert.ok(alt && text && mood);
  }
});

test('all 29 Smile meme assets exist locally and are defined', () => {
  const keys = Object.keys(SMILE_MEME_STICKERS);
  assert.equal(keys.length, 29);
  for (const key of keys) {
    const [file, alt, text, mood] = SMILE_MEME_STICKERS[key];
    assert.ok(existsSync(new URL(`../public/stickers/smilekv16/${file}.png`, import.meta.url)), `File smilekv16/${file}.png must exist`);
    assert.ok(alt && text && mood);
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

test('tapping cycles into extended reaction pools with new sora and smile stickers', () => {
  const tappedFeedback = getStickerFeedback('determined', undefined, 'inst:1');
  assert.ok(EXTENDED_REACTION_POOLS.determined.includes(tappedFeedback.type));
});
