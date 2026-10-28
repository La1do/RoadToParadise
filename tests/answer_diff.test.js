import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { compareAnswer } from '../src/core/gradeEngine.js';

let server;
let AnswerDiff;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  ({ default: AnswerDiff } = await server.ssrLoadModule('/src/components/common/AnswerDiff.jsx'));
});
after(async () => { await server?.close(); });

const render = props => renderToStaticMarkup(React.createElement(AnswerDiff, props));

test('AnswerDiff groups consecutive missing words into one (+ phrase)', () => {
  const grade = compareAnswer('đức trời', 'đức chúa yêu thương trời');
  const html = render(grade);
  assert.equal((html.match(/<ins /g) || []).length, 1);
  assert.match(html, />\(\+ chúa yêu thương\)<\/ins>/);
  assert.match(html, /answer-diff__token--correct/);
});

test('AnswerDiff keeps separate omissions in alignment and strikes wrong/extra words', () => {
  const html = render({ diff: [
    { type: 'missing', text: 'đầu' },
    { type: 'correct', text: 'đúng' },
    { type: 'wrong', text: 'sai' },
    { type: 'missing', text: 'phần' },
    { type: 'missing', text: 'cuối' }
  ] });
  assert.equal((html.match(/<ins /g) || []).length, 2);
  assert.match(html, /<del [^>]*answer-diff__token--wrong[^>]*>sai<\/del>/);
  assert.ok(html.indexOf('(+ đầu)') < html.indexOf('>đúng</span>'));
  assert.ok(html.indexOf('>sai</del>') < html.indexOf('(+ phần cuối)'));
});

test('AnswerDiff renders a blank answer as one missing phrase, not an empty state', () => {
  const html = render(compareAnswer('', 'khải thị thực thể'));
  assert.match(html, />\(\+ khải thị thực thể\)<\/ins>/);
  assert.doesNotMatch(html, /answer-diff__empty/);
});

test('AnswerDiff leaves exact answers unmarked and extra-only answers deleted', () => {
  const exact = render(compareAnswer('chính xác', 'chính xác'));
  assert.doesNotMatch(exact, /<ins |<del /);
  const extra = render(compareAnswer('thừa', ''));
  assert.match(extra, /<del [^>]*>thừa<\/del>/);
  assert.doesNotMatch(extra, /<ins /);
});

test('AnswerDiff does not mutate frozen grading tokens while grouping', () => {
  const diff = Object.freeze([
    Object.freeze({ type: 'missing', text: 'bổ' }),
    Object.freeze({ type: 'missing', text: 'sung' })
  ]);
  assert.match(render({ diff }), /\(\+ bổ sung\)/);
  assert.deepEqual(diff.map(token => token.text), ['bổ', 'sung']);
});

test('AnswerDiff prefers the ordered diff over legacy tokens and supports legacy fallback', () => {
  const userTokensResult = [{ status: 'wrong', text: 'dư' }];
  assert.match(render({ userTokensResult }), /<del [^>]*>dư<\/del>/);
  assert.match(render({ diff: [], userTokensResult }), /<del [^>]*>dư<\/del>/);
  const html = render({ diff: [{ type: 'missing', text: 'thiếu' }], userTokensResult });
  assert.match(html, /\(\+ thiếu\)/);
  assert.doesNotMatch(html, />dư<\/del>/);
});

test('AnswerDiff handles empty results, variants, and HTML safely', () => {
  assert.match(render({}), /\(Chưa nhập câu trả lời\)/);
  const html = render({ variant: 'motorbike', diff: [{ type: 'wrong', text: '<script>alert(1)</script>' }] });
  assert.match(html, /answer-diff--motorbike/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
