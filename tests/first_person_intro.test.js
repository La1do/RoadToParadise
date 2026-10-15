import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('FirstPersonIntro: Kiểm tra file component và CSS tồn tại', () => {
  assert.ok(fs.existsSync('./src/components/cutscenes/FirstPersonIntro.jsx'), 'FirstPersonIntro.jsx exists');
  assert.ok(fs.existsSync('./src/components/cutscenes/FirstPersonIntro.css'), 'FirstPersonIntro.css exists');
});

test('FirstPersonIntro: Kiểm tra trạng thái tương tác điện thoại rung và mở', () => {
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  assert.ok(css.includes('phone-vibrating'), 'Has phone-vibrating class for ring state');
  assert.ok(css.includes('phone-active') || css.includes('is-opened'), 'Has opened/active state');
  assert.ok(css.includes('fp-tap-guide-bubble'), 'Has tap guide bubble');
  assert.ok(css.includes('fp-vibe-ripples'), 'Has vibration ripple effect');
});

test('FirstPersonIntro: Hiển thị cả Câu hỏi và Đáp án chuẩn', () => {
  const jsx = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.jsx', 'utf8');
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  assert.ok(jsx.includes('question-card'), 'Contains question card');
  assert.ok(jsx.includes('answer-card'), 'Contains answer card');
  assert.ok(jsx.includes('noiDungCauHoi'), 'Renders noiDungCauHoi');
  assert.ok(jsx.includes('dapAnMau'), 'Renders dapAnMau');
  assert.ok(css.includes('.question-card') && css.includes('.answer-card'), 'Styles both question and answer cards');
});

test('FirstPersonIntro: Kích thước mobile-first 360-430px và touch target >= 44px', () => {
  const css = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.css', 'utf8');

  assert.ok(css.includes('max-width: 430px'), 'Enforces mobile-first max-width 430px');
  assert.ok(css.includes('min-height: 44px') || css.includes('min-height: 48px'), 'Buttons have min-height >= 44px');
  assert.ok(css.includes('prefers-reduced-motion'), 'Supports prefers-reduced-motion');
});

test('FirstPersonIntro: Component JSX export và props', () => {
  const jsx = fs.readFileSync('./src/components/cutscenes/FirstPersonIntro.jsx', 'utf8');

  assert.ok(jsx.includes('export default function FirstPersonIntro'), 'Default export exists');
  assert.ok(jsx.includes('tenNhanVat'), 'Has tenNhanVat prop');
  assert.ok(jsx.includes('soCau'), 'Has soCau prop');
  assert.ok(jsx.includes('chang'), 'Has chang prop');
  assert.ok(jsx.includes('handleOpenPhone') || jsx.includes('setIsOpened'), 'Has open handler on tap');
  assert.ok(jsx.includes('handleSkip'), 'Has skip handler');
  assert.ok(jsx.includes('onStartGame1'), 'Calls onStartGame1 to begin practice');
});
