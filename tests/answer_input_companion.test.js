import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { compareAnswer } from '../src/core/gradeEngine.js';

let server;
let Companion;
let getState;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  const module = await server.ssrLoadModule('/src/components/common/AnswerInputCompanion.jsx');
  Companion = module.default;
  getState = module.getInputCompanionState;
});
after(async () => { await server?.close(); });

test('input cat distinguishes idle, focus, typing, pause and revision without grading drafts', () => {
  assert.equal(getState({}).phase, 'idle');
  assert.equal(getState({ focused: true }).phase, 'ready');
  assert.equal(getState({ value: 'bài đang gõ', focused: true, typing: true }).phase, 'typing');
  assert.equal(getState({ value: 'bài đang gõ' }).phase, 'draft');
  assert.equal(getState({ value: 'đang sửa', revising: true }).phase, 'revising');
});

test('submitted results take priority over typing and revision', () => {
  assert.equal(getState({ grade: compareAnswer('đúng', 'đúng'), typing: true, revising: true }).phase, 'correct');
  assert.equal(getState({ grade: compareAnswer('sai', 'đúng'), typing: true }).phase, 'incorrect');
});

test('large interactive cat and textarea render inside one shared input frame', () => {
  const html = renderToStaticMarkup(React.createElement(Companion, {}, React.createElement('textarea', { 'aria-label': 'Bài làm' })));
  assert.match(html, /answer-input-companion phase-idle/);
  assert.match(html, /<textarea/);
  assert.match(html, /size-xl/);
  assert.match(html, /answer-input-companion__resident/);
  assert.match(html, /<button type="button"/);
  assert.match(html, /Đổi biểu cảm của mèo/);
});

test('exam companion encourages without revealing answers or claiming correctness', () => {
  const html = renderToStaticMarkup(React.createElement(Companion, { value: 'bài làm', exam: true }, React.createElement('textarea', { defaultValue: 'bài làm' })));
  assert.match(html, /Đọc lại ý này trước khi nộp bài/);
  assert.doesNotMatch(html, /Chuẩn rồi|từ sai\/thừa|cần bổ sung/);
});

test('wrong result feedback appears inside the input companion', () => {
  const html = renderToStaticMarkup(React.createElement(Companion, { value: 'xin', grade: compareAnswer('xin', 'xin chào') }));
  assert.match(html, /phase-incorrect/);
  assert.match(html, /Bổ sung 1 từ/);
});
