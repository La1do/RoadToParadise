import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  parseUpperNoAccent,
  getStoredUserName,
  setStoredUserName,
  isUserAuthenticated,
  setUserAuthenticated,
  logoutUser
} from '../src/utils/cookie.js';

test('Auth: parseUpperNoAccent chuẩn hóa viết hoa và không dấu', () => {
  // 1. Kiểm tra chủ đề Thể thao (Câu 1)
  assert.equal(parseUpperNoAccent('Thể thao'), 'THETHAO');
  assert.equal(parseUpperNoAccent('thể thao'), 'THETHAO');
  assert.equal(parseUpperNoAccent('THE THAO'), 'THETHAO');
  assert.equal(parseUpperNoAccent('the thao'), 'THETHAO');
  assert.equal(parseUpperNoAccent('  ThỂ   ThAo  '), 'THETHAO');

  // 2. Kiểm tra KV hiện tại B6 (Câu 2)
  assert.equal(parseUpperNoAccent('B6'), 'B6');
  assert.equal(parseUpperNoAccent('b6'), 'B6');
  assert.equal(parseUpperNoAccent(' b 6 '), 'B6');
  assert.equal(parseUpperNoAccent('B 6'), 'B6');
});

test('Auth: File .env và biến môi trường cấu hình đúng', () => {
  const envPath = fs.existsSync('.env') ? '.env' : '.env.example';
  const envContent = fs.readFileSync(envPath, 'utf8');
  assert.match(envContent, /VITE_KV_CURRENT_ANSWER\s*=\s*B6/);
  assert.match(envContent, /VITE_KV_TOPIC_ANSWER\s*=\s*Thể thao/);
});

test('Auth: Cookie và lưu trữ tên người dùng', () => {
  // Giả lập document.cookie trong môi trường test Node.js
  let mockCookieStore = '';
  globalThis.document = {
    get cookie() {
      return mockCookieStore;
    },
    set cookie(val) {
      const pair = val.split(';')[0];
      const [k, v] = pair.split('=');
      const existing = mockCookieStore.split('; ').filter(p => p && !p.startsWith(`${k}=`));
      existing.push(`${k}=${v}`);
      mockCookieStore = existing.join('; ');
    }
  };

  // Test set and get
  setUserAuthenticated('Bảo Trương');
  assert.equal(isUserAuthenticated(), true);
  assert.equal(getStoredUserName(), 'Bảo Trương');

  // Test logout
  logoutUser();
  assert.equal(isUserAuthenticated(), false);
  assert.equal(getStoredUserName(), '');
});

test('Auth: LoginModal chứa đầy đủ 2 ô và nút đổi câu hỏi, đã ẩn gợi ý placeholder', () => {
  const jsx = fs.readFileSync('./src/components/auth/LoginModal.jsx', 'utf8');
  const css = fs.readFileSync('./src/components/auth/LoginModal.css', 'utf8');

  // Ô 1: Tên
  assert.match(jsx, /Tên:/, 'Có ô nhập Tên');
  assert.match(jsx, /user-name-input/);

  // Ô 2: Câu hỏi bảo mật
  assert.match(jsx, /Chủ đề của KV sẽ quay video là gì\?/, 'Câu hỏi 1');
  assert.match(jsx, /KV của bạn là gì\?/, 'Câu hỏi 2');
  assert.match(jsx, /VITE_KV_CURRENT_ANSWER/, 'Lấy đáp án câu 2 từ file .env');
  assert.match(jsx, /Đổi câu hỏi/, 'Có nút đổi câu hỏi');

  // Đã ẩn gợi ý đáp án ở placeholder theo yêu cầu người dùng
  assert.doesNotMatch(jsx, /VD:\s*Thể thao/, 'Đã ẩn gợi ý Thể thao');
  assert.doesNotMatch(jsx, /VD:\s*B6/, 'Đã ẩn gợi ý B6');

  // Parse viết hoa không dấu
  assert.match(jsx, /parseUpperNoAccent/, 'Parse viết hoa không dấu');

  // CSS đồng bộ
  assert.match(css, /login-modal-overlay/);
  assert.match(css, /login-modal-dialog/);
});

test('Sticker: Tự động chèn tên người dùng vào reaction và comment của sticker', () => {
  const stickerJsx = fs.readFileSync('./src/components/common/StickerReaction.jsx', 'utf8');
  assert.match(stickerJsx, /formatWithUserName/, 'Hàm định dạng chèn tên người dùng vào bình luận');
  assert.match(stickerJsx, /getStoredUserName/, 'Lấy tên người dùng từ cookie');
  assert.match(stickerJsx, /nameSuffix|namePrefix/, 'Thêm hậu tố/tiền tố tên vào nhận xét');
});

test('Sticker: Hỗ trợ case bỏ trống với sticker Tỉnh táo lên (wake_up)', () => {
  const stickerJsx = fs.readFileSync('./src/components/common/StickerReaction.jsx', 'utf8');
  assert.match(stickerJsx, /wake_up/, 'Có cấu hình sticker wake_up');
  assert.match(stickerJsx, /Tỉnh táo lên/, 'Thông điệp nhắc nhở tỉnh táo');
  assert.match(stickerJsx, /đừng bỏ trống/, 'Nhắc nhở đừng bỏ trống');

  const g1Jsx = fs.readFileSync('./src/components/games/Game1Copy.jsx', 'utf8');
  assert.match(g1Jsx, /wake_up/, 'Game1Copy xử lý trường hợp bỏ trống');
  assert.match(g1Jsx, /đừng bỏ trống/, 'Game1Copy có thông điệp đừng bỏ trống');

  const g2Jsx = fs.readFileSync('./src/components/games/Game2Scramble.jsx', 'utf8');
  assert.match(g2Jsx, /wake_up/, 'Game2Scramble xử lý trường hợp bỏ trống');

  const modalJsx = fs.readFileSync('./src/components/games/GameResultModal.jsx', 'utf8');
  assert.match(modalJsx, /isAllBlank/, 'GameResultModal phát hiện bỏ trống');

  assert.ok(fs.existsSync('./public/stickers/wake_up.png'), 'File wake_up.png tồn tại trong public/stickers');
});
