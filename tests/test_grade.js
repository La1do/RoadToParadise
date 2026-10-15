import { tokenize, compareAnswer } from '../src/utils/grade.js';
import fs from 'fs';

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  } else {
    console.log('PASS:', msg);
  }
}

console.log('--- TEST 1: Tokenize ---');
const t1 = tokenize('Đức Chúa Trời → Đức Chúa Jesus → Thiên sứ → Giăng Mới → Các đầy tớ');
assert(t1.length === 13, `Token count should be 13, got ${t1.length}`);
assert(t1[0] === 'đức' && t1[3] === 'đức' && t1[5] === 'jesus', 'Tokens value check');

console.log('--- TEST 2: Dấu tiếng Việt (sai dấu = sai chữ) ---');
const cmpWrongAccent = compareAnswer('thuc the', 'thực thể');
assert(!cmpWrongAccent.isExact, 'thuc the should NOT match thực thể');
assert(cmpWrongAccent.matchedCount === 0, 'Matched count should be 0');
assert(cmpWrongAccent.userTokensResult[0].status === 'wrong', 'User token should be marked wrong');

const cmpCorrectAccent = compareAnswer('thực thể', 'Khải thị thực thể');
assert(!cmpCorrectAccent.isExact, 'Partial match should not be exact');
assert(cmpCorrectAccent.matchedCount === 2, 'Should match 2 tokens (thực, thể)');
assert(cmpCorrectAccent.targetTokensResult.find(t => t.text === 'khải').status === 'missing', 'Khải should be missing');

console.log('--- TEST 3: Gạch nối và dấu ~ / - ---');
const cmpExe = compareAnswer('ê xê mat 15 24', 'Ê-xê, Mat 15:24');
assert(cmpExe.isExact, 'Ê-xê should match ê xê');

const cmpRange = compareAnswer('Kh 17:5-7', 'Kh 17:5~7');
assert(cmpRange.isExact, 'Range with - should match ~');

console.log('--- TEST 4: Unicode NFC / NFD normalization ---');
// NFD decomposed
const nfd = 'thực thể'.normalize('NFD');
const nfc = 'thực thể'.normalize('NFC');
const cmpUnicode = compareAnswer(nfd, nfc);
assert(cmpUnicode.isExact, 'NFD and NFC should match 100%');

console.log('--- TEST 5: All 20 questions target tokenization ---');
const raw = fs.readFileSync('./src/data/questions.json', 'utf8');
const data = JSON.parse(raw);
let totalSlots = 0;
data.questions.forEach(q => {
  q.slots.forEach(slot => {
    totalSlots++;
    const toks = tokenize(slot.answer);
    assert(toks.length > 0, `Q${q.id} ${slot.label} should have tokens`);
    const selfCmp = compareAnswer(slot.answer, slot.answer);
    assert(selfCmp.isExact && selfCmp.accuracy === 100, `Q${q.id} ${slot.label} exact match self`);
  });
});
console.log(`Verified all ${totalSlots} slots across 20 questions!`);

console.log('ALL TESTS PASSED!');
