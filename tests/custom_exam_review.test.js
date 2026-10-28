import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('CustomExamReview: Kiểm tra files tồn tại và export', () => {
  assert.ok(fs.existsSync('./src/components/exam/CustomExamReview.jsx'), 'CustomExamReview.jsx exists');
  assert.ok(fs.existsSync('./src/components/exam/CustomExamReview.css'), 'CustomExamReview.css exists');
  assert.ok(fs.existsSync('./src/components/exam/index.js'), 'index.js exists');
});

test('CustomExamReview: Kiểm tra hỗ trợ chế độ Ôn xáo từ và Thi riêng', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');

  assert.ok(jsx.includes("mode === 'copy'"), 'Supports copy practice mode');
  assert.ok(jsx.includes("mode === 'scramble'"), 'Supports scramble practice mode');
  assert.ok(jsx.includes("mode === 'exam'"), 'Supports real exam mode');
  assert.ok(jsx.includes('showReferenceAnswer'), 'Supports show/hide reference answer toggle');
  assert.ok(jsx.includes('Game2Scramble'), 'Integrates Game2Scramble in scramble mode');
  assert.ok(jsx.includes('handleSubmitExam'), 'Supports submit exam logic');
  assert.ok(jsx.includes('handleRetryWrongQuestions'), 'Supports retry wrong questions');
});

test('CustomExamReview: Tách riêng từng ô input cho từng ý trong bài thi', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');

  assert.ok(jsx.includes('exam-slots-inputs'), 'Has exam slots inputs container');
  assert.ok(jsx.includes('exam-slot-textarea'), 'Has separate textarea for each slot');
  assert.ok(css.includes('.exam-slots-inputs'), 'Has CSS for exam slots inputs');
  assert.ok(css.includes('.exam-slot-textarea'), 'Has CSS for exam slot textarea');
});

test('CustomExamReview: Bố cục responsive cho Laptop, iPad và Mobile', () => {
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');

  assert.ok(css.includes('max-width: 1040px'), 'Has comfortable wide container for desktop/laptop');
  assert.ok(css.includes('grid-template-columns: 1fr 1fr') || css.includes('@media'), 'Has responsive layout');
  assert.ok(css.includes('min-height: 48px') || css.includes('min-height: 52px'), 'Has touch-friendly buttons >= 48px');
});

test('CustomExamReview: Giữ nguyên đáp án khi chuyển câu trong chế độ Xáo từ (Scramble)', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');

  // Quản lý state scrambleProgress để lưu đáp án của từng câu hỏi
  assert.ok(jsx.includes('scrambleProgress'), 'Có state scrambleProgress để lưu tiến độ các câu xáo từ');
  assert.ok(jsx.includes('initialState={scrambleProgress[currentQ.id]}'), 'Truyền initialState vào Game2Scramble');
  assert.ok(jsx.includes('onStateChange='), 'Có onStateChange để lưu lại trạng thái các thẻ khi người dùng thao tác');
  assert.ok(jsx.includes('handleSubmitScramble'), 'Hỗ trợ tổng kết đợt ôn xáo từ');

  // Đánh dấu nav-pill khi đã làm câu đó trong chế độ xáo từ
  assert.ok(jsx.includes('scrambleProgress[q.id]'), 'Đánh dấu ô câu hỏi đã làm trên thanh điều hướng nav-pill');
});

test('CustomExamReview: Cấu trúc 2 cột trên Laptop và lưới ô số trên Mobile', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  assert.ok(jsx.includes('setup-grid-container'), 'Có container chia 2 cột setup');
  assert.ok(jsx.includes('setup-col-left'), 'Có cột trái chứa chế độ và nút bắt đầu');
  assert.ok(jsx.includes('setup-col-right'), 'Có cột phải chứa câu hỏi');
});

test('CustomExamReview: CSS bố cục 2 cột vừa khít 1 màn hình', () => {
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');
  assert.ok(css.includes('.setup-grid-container'), 'Có selector .setup-grid-container');
  assert.ok(css.includes('.setup-col-left'), 'Có selector .setup-col-left');
  assert.ok(css.includes('.setup-col-right'), 'Có selector .setup-col-right');
  assert.ok(css.includes('grid-template-columns: 360px 1fr') || css.includes('grid-template-columns: 380px 1fr') || css.includes('@media (min-width: 820px)'), 'Có media query 2 cột');
  assert.ok(css.includes('.setup-start-wrap'), 'Có selector .setup-start-wrap');
});

test('CustomExamReview: Tinh gọn trên Mobile dạng Pop-up và không bị mất chữ ở thẻ câu hỏi', () => {
  const jsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  const css = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');

  // Kiểm tra hiển thị hint câu hỏi không bị cắt cụt
  assert.ok(jsx.includes('q-hint-text'), 'Dùng class q-hint-text hiển thị hint câu hỏi');
  assert.ok(css.includes('.q-hint-text'), 'Có CSS cho q-hint-text');

  // Kiểm tra giao diện mobile pop-up
  assert.ok(jsx.includes('setup-mobile-view'), 'Có giao diện setup-mobile-view chuyên biệt');
  assert.ok(jsx.includes('mobile-trigger-card'), 'Có các thẻ trigger mở pop-up');
  assert.ok(jsx.includes('mobile-modal-sheet'), 'Có bottom sheet modal cho mobile');
  assert.ok(jsx.includes('mobile-num-grid'), 'Có lưới ô số 1..20 trên mobile');
});

test('App: Thanh header trên Mobile có sidebar drawer khi nhiều tab', () => {
  const appJsx = fs.readFileSync('./src/App.jsx', 'utf8');

  assert.ok(appJsx.includes('app-mobile-menu-btn'), 'Có nút menu hamburger trên mobile');
  assert.ok(appJsx.includes('app-sidebar-drawer'), 'Có sidebar drawer trượt ra khi bấm');
  assert.ok(appJsx.includes('hasMultipleTabs'), 'Chỉ hiện nút mở sidebar khi có nhiều hơn 1 tab');
});

test('CustomExamReview & Game1Copy: Nút hiện đáp án chỉ ở chế độ copy và ẩn/hiện độc lập từng ý', () => {
  const customReviewJsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8').replace(/\r\n/g, '\n');
  const game1Jsx = fs.readFileSync('./src/components/games/Game1Copy.jsx', 'utf8').replace(/\r\n/g, '\n');

  // Nút toggle đáp án tham khảo ở header chỉ xuất hiện khi mode === 'copy'
  assert.ok(customReviewJsx.includes("mode === 'copy' && (\n                <button\n                  type=\"button\"\n                  className=\"toggle-ref-action-btn\""), 'Nút toggle-ref-action-btn chỉ xuất hiện ở chế độ copy');

  // Hộp đáp án tham khảo floating-ref-drawer chỉ xuất hiện khi mode === 'copy'
  assert.ok(customReviewJsx.includes("mode === 'copy' && showReferenceAnswer"), 'floating-ref-drawer chỉ hiển thị ở chế độ copy');

  // Game1Copy hỗ trợ ẩn/hiện độc lập từng ý
  assert.ok(game1Jsx.includes('toggleSlotRef'), 'Game1Copy có hàm toggle riêng cho từng ý');
  assert.ok(game1Jsx.includes('isSlotRefVisible'), 'Game1Copy kiểm tra hiển thị riêng cho từng ý');
});

test('Chấm bài & Sửa bài: Trực quan (xanh lá đúng, gạch bỏ từ dư, vàng thay thế) & Đáp án full nguyên mẫu', () => {
  const g1Jsx = fs.readFileSync('./src/components/games/Game1Copy.jsx', 'utf8');
  const g1Css = fs.readFileSync('./src/components/games/Game1Copy.css', 'utf8');
  const examJsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8');
  const examCss = fs.readFileSync('./src/components/exam/CustomExamReview.css', 'utf8');
  const g2Css = fs.readFileSync('./src/components/games/Game2Scramble.css', 'utf8');

  // 1. Nút kiểm tra kết quả các ý ở Game 2 có CSS chuẩn
  assert.ok(g2Css.includes('.game2-check-all-btn'), 'Có CSS cho nút game2-check-all-btn');
  assert.ok(g2Css.includes('.game2-main-actions'), 'Có CSS cho game2-main-actions');
  assert.match(g2Css, /\.game2-check-all-btn\s*\{[^}]*min-height:\s*48px/, 'Nút kiểm tra Game 2 min-height >= 48px');

  // 2. Game 1 delegates correction rendering to the shared component.
  assert.match(g1Jsx, /<AnswerDiff diff=\{result\.diff\}/, 'Game 1 sử dụng diff có cả từ thiếu');
  assert.ok(g1Jsx.includes('diff-full-answer-box'), 'Có hộp đáp án full nguyên mẫu trong Game 1');
  assert.match(g1Css, /\.token-wrong\s*\{[^}]*line-through/, 'Từ dư được gạch ngang line-through');
  assert.match(g1Css, /\.token-correct\s*\{[^}]*background:\s*#dcfce7/, 'Từ đúng có màu xanh lá');
  assert.match(g1Css, /\.token-missing\s*\{[^}]*background:\s*#fef3c7/, 'Từ đúng thay thế có màu vàng');

  // 3. Màn hình phân tích chi tiết bài thi CustomExamReview
  assert.match(examJsx, /<AnswerDiff\s+diff=\{sr\.grade\.diff\}/, 'Chi tiết thi sử dụng chung AnswerDiff');
  const sharedCss = fs.readFileSync('./src/components/common/AnswerDiff.css', 'utf8');
  assert.match(sharedCss, /\.answer-diff__token--wrong\s*\{[^}]*line-through/, 'Từ sai vẫn gạch bỏ trong renderer dùng chung');
  assert.match(sharedCss, /\.answer-diff__token--missing\s*\{[^}]*text-decoration:\s*none/, 'Phần thiếu không bị gạch ngang');
  assert.ok(examJsx.includes('full-answer-text'), 'Có đáp án full nguyên mẫu trong chi tiết thi');
  assert.match(examCss, /\.tok-wrong\s*\{[^}]*line-through/, 'Từ dư trong bài thi được gạch ngang');
  assert.match(examCss, /\.tok-correct\s*\{[^}]*background:\s*#dcfce7/, 'Từ đúng trong bài thi màu xanh lá');
  assert.match(examCss, /\.tok-missing\s*\{[^}]*background:\s*#fef3c7/, 'Từ đúng thay thế trong bài thi màu vàng');
});

test('Chép lại & Xáo từ: Luôn có nút Làm lại câu này ở câu cuối cùng và hỗ trợ đợt ôn 1 câu', () => {
  const g1Jsx = fs.readFileSync('./src/components/games/Game1Copy.jsx', 'utf8').replace(/\r\n/g, '\n');
  const g2Jsx = fs.readFileSync('./src/components/games/Game2Scramble.jsx', 'utf8').replace(/\r\n/g, '\n');
  const customReviewJsx = fs.readFileSync('./src/components/exam/CustomExamReview.jsx', 'utf8').replace(/\r\n/g, '\n');

  // 1. Game 1 luôn luôn có nút "Làm lại câu này" bất kể là câu cuối cùng hay không
  assert.match(g1Jsx, /<button[^>]*className="game1-retry-btn"[^>]*onClick=\{handleResetCurrentQuestion\}[^>]*>[\s\S]*?Làm lại câu này/, 'Game 1 luôn có nút Làm lại câu này gọi handleResetCurrentQuestion');

  // 2. Game 1 ở câu cuối cùng có cả nút "Làm lại cả bài" (nếu có nhiều hơn 1 câu) và "Kết thúc"
  assert.match(g1Jsx, /hasMultipleQuestions\s*&&\s*onResetAll/, 'Game 1 kiểm tra hasMultipleQuestions trước khi hiện Làm lại cả bài');
  assert.match(g1Jsx, /handleResetCurrentQuestion\(\);\s*onResetAll\(\);/, 'Khi bấm Làm lại cả bài phải reset câu hiện tại và reset cả bài');

  // 3. Game 2 tương tự Game 1
  assert.match(g2Jsx, /<button[^>]*className="game2-retry-btn"[^>]*onClick=\{handleResetCurrentQuestion\}[^>]*>[\s\S]*?Làm lại câu này/, 'Game 2 luôn có nút Làm lại câu này');
  assert.match(g2Jsx, /hasMultipleQuestions\s*&&\s*onResetAll/, 'Game 2 kiểm tra hasMultipleQuestions trước khi hiện Làm lại cả bài');

  // 4. CustomExamReview truyền totalQuestions và sessionKey để remount sạch khi làm lại cả bài
  assert.match(customReviewJsx, /key=\{`\$\{sessionKey\}-\$\{currentQ\.id\}`\}/, 'CustomExamReview dùng sessionKey trong key để reset hoàn toàn');
  assert.match(customReviewJsx, /totalQuestions=\{sessionQuestions\.length\}/, 'CustomExamReview truyền totalQuestions vào game component');
});




