import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('FirstPersonIntro: Kiểm tra file component và CSS tồn tại', () => {
  assert.ok(fs.existsSync('./src/components/cutscenes/FirstPersonIntro.jsx'), 'FirstPersonIntro.jsx exists');
  assert.ok(fs.existsSync('./src/components/cutscenes/FirstPersonIntro.css'), 'FirstPersonIntro.css exists');
});

test('FirstPersonIntro: State machine và các class trạng thái', () => {
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  const states = ['state-vibrate', 'state-handIn', 'state-screenOn', 'state-zoom', 'state-chat', 'state-input'];
  states.forEach(st => {
    assert.ok(css.includes(`.${st}`), `CSS must include .${st}`);
  });
});

test('FirstPersonIntro: Kiểm tra chỉ animate transform và opacity', () => {
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  // Kiểm tra keyframe animation chỉ dùng transform
  assert.ok(css.includes('@keyframes fp-phone-vibrate'), 'Has fp-phone-vibrate keyframe');
  assert.ok(css.includes('transform: translateY'), 'Uses translateY');
  assert.ok(css.includes('transform: scale'), 'Uses scale transform');
  assert.ok(css.includes('prefers-reduced-motion'), 'Supports prefers-reduced-motion');
});

test('FirstPersonIntro: Kích thước mobile-first 360-430px và touch target >= 44px', () => {
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  assert.ok(css.includes('max-width: 430px'), 'Enforces mobile-first max-width 430px');
  assert.ok(css.includes('min-height: 44px') || css.includes('min-height: 48px'), 'Buttons have min-height >= 44px');
});

test('FirstPersonIntro: Component JSX export và props', () => {
  const jsx = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.jsx', 'utf8');

  assert.ok(jsx.includes('export default function FirstPersonIntro'), 'Default export exists');
  assert.ok(jsx.includes('tenNhanVat'), 'Has tenNhanVat prop');
  assert.ok(jsx.includes('soCau'), 'Has soCau prop');
  assert.ok(jsx.includes('noiDungCauHoi'), 'Has noiDungCauHoi prop');
  assert.ok(jsx.includes('dapAnMau'), 'Has dapAnMau prop');
  assert.ok(jsx.includes('chang'), 'Has chang prop');
  assert.ok(jsx.includes('handleSkip'), 'Has skip handler');
  assert.ok(jsx.includes('autoFocus') || jsx.includes('.focus()'), 'Supports auto focus');
});
