import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compareAnswer } from '../src/core/gradeEngine.js';
import { SAMPLE_MOTORBIKE_SLOTS } from '../src/components/games/motorbike/sampleMotorbikeData.js';

test('Motorbike: Kiểm tra tất cả các file cấu trúc tồn tại và không dùng ảnh ngoài', () => {
  const files = [
    './src/components/games/motorbike/FirstPersonMotorbikeGame2.jsx',
    './src/components/games/motorbike/FirstPersonMotorbikeGame2.css',
    './src/components/games/motorbike/HondaWaveHandlebar.jsx',
    './src/components/games/motorbike/ParallaxRoadScene.jsx',
    './src/components/games/motorbike/useMotorbikeAudio.js',
    './src/components/games/motorbike/sampleMotorbikeData.js',
    './src/components/games/motorbike/index.js'
  ];

  for (const f of files) {
    assert.ok(fs.existsSync(f), `File ${f} phải tồn tại`);
    const content = fs.readFileSync(f, 'utf8');
    // Không dùng thẻ <img> ngoài
    assert.ok(!content.includes('<img'), `${f} không được chứa thẻ <img>`);
    // Không dùng url(...) ảnh bitmap ngoài
    if (f.endsWith('.css')) {
      assert.ok(!content.includes('url(http'), `${f} không dùng url ảnh http/https`);
      assert.ok(!content.includes('.png') && !content.includes('.jpg') && !content.includes('.webp'), `${f} không được trỏ file ảnh`);
    }
  }
});

test('Motorbike: Cấu tạo xe Honda Wave SVG chuẩn xe số bán tự động', () => {
  const handlebarJsx = fs.readFileSync('./src/components/games/motorbike/HondaWaveHandlebar.jsx', 'utf8');

  // Đèn pha tròn ở trung tâm
  assert.match(handlebarJsx, /headlightLens|Đèn pha tròn/, 'Phải có đèn pha tròn ở giữa');

  // Đồng hồ cơ: tốc độ và xăng
  assert.match(handlebarJsx, /km\/h/, 'Đồng hồ tốc độ kim có đơn vị km/h');
  assert.match(handlebarJsx, /speedNeedleAngle/, 'Có góc quay kim tốc độ theo km/h');
  assert.match(handlebarJsx, /fuelNeedleAngle/, 'Có góc quay kim xăng');

  // Hai gương chiếu hậu
  assert.match(handlebarJsx, /mirror-left/, 'Có gương chiếu hậu trái');
  assert.match(handlebarJsx, /mirror-right/, 'Có gương chiếu hậu phải');

  // Tay lái xe Wave: tay phải ga + phanh trước, tay trái cao su + phanh sau (KHÔNG CÔN)
  assert.match(handlebarJsx, /handlebar-right/, 'Có cụm tay lái phải');
  assert.match(handlebarJsx, /handlebar-left/, 'Có cụm tay lái trái');
  assert.match(handlebarJsx, /minh-hand-left/, 'Có bàn tay trái của Minh');
  assert.match(handlebarJsx, /minh-hand-right/, 'Có bàn tay phải của Minh');
  assert.match(handlebarJsx, /cần phanh sau|phanh sau/i, 'Có cần phanh sau');
  assert.match(handlebarJsx, /cần phanh trước|phanh trước/i, 'Có cần phanh trước');
  assert.ok(!handlebarJsx.toLowerCase().includes('tay côn'), 'Xe Wave số tự động không có tay côn');

  // Viền mũ bảo hiểm hạ xuống ở Intro
  assert.match(handlebarJsx, /helmet-visor-frame/, 'Có viền kính mũ bảo hiểm hạ xuống');
});

test('Motorbike: Parallax road animation chỉ dùng transform và opacity', () => {
  const css = fs.readFileSync('./src/components/games/motorbike/FirstPersonMotorbikeGame2.css', 'utf8');

  // Kiểm tra keyframes vạch kẻ đường tiến tới
  assert.match(css, /@keyframes roadStripeRoll/, 'Có keyframes vạch kẻ đường lăn tới');
  assert.match(css, /transform:\s*translateX\(-50%\)\s*translateY/, 'Animate vạch đường bằng transform translateY');

  // Kiểm tra cây cối ven đường trượt ra rìa
  assert.match(css, /@keyframes treeSlideLeft/, 'Cây trượt ra rìa trái');
  assert.match(css, /@keyframes treeSlideRight/, 'Cây trượt ra rìa phải');

  // Đồng hồ rung và tay lái rung nhẹ
  assert.match(css, /@keyframes handlebarVibrate/, 'Có hiệu ứng rung tay lái');

  // Focus mode giảm tốc còn 30-40% và blur
  assert.match(css, /\.is-focus-mode/, 'Có class .is-focus-mode');
  assert.match(css, /--road-speed-focus/, 'Có biến tốc độ chậm khi tập trung');
  assert.match(css, /backdrop-filter:\s*blur/, 'Có làm mờ hậu cảnh khi tập trung');

  // Hỗ trợ prefers-reduced-motion
  assert.match(css, /prefers-reduced-motion/, 'Có hỗ trợ prefers-reduced-motion');
  assert.match(css, /\.reduced-motion/, 'Có class .reduced-motion');
});

test('Motorbike: Responsive Breakpoints (<600px, 600-1100px, >1100px) và touch target >= 44px', () => {
  const css = fs.readFileSync('./src/components/games/motorbike/FirstPersonMotorbikeGame2.css', 'utf8');

  // Breakpoints chuẩn
  assert.match(css, /@media\s*\(max-width:\s*600px\)/, 'Hỗ trợ điện thoại <600px');
  assert.match(css, /@media\s*\(min-width:\s*601px\)\s*and\s*\(max-width:\s*1100px\)/, 'Hỗ trợ iPad 600-1100px');
  assert.match(css, /@media\s*\(min-width:\s*1101px\)/, 'Hỗ trợ laptop >1100px');

  // Cố định aspect ratio 16/9 cho laptop
  assert.match(css, /--motorbike-aspect:\s*16\s*\/\s*9/, 'Tỉ lệ 16:9');
  assert.match(css, /max-width:\s*1440px/, 'Khung tối đa 1440px');

  // Nút bấm và thẻ chạm touch-target >= 44px
  assert.match(css, /min-height:\s*44px/, 'Mục tiêu chạm >= 44px');
  assert.match(css, /border-radius:\s*22px/, 'Thẻ từ bo tròn 22px');

  // Dùng clamp() cho chữ và khoảng cách
  assert.match(css, /clamp\(/, 'Dùng clamp() co giãn linh hoạt');
});

test('Motorbike: Web Audio API tổng hợp âm thanh xe Wave và còi xe', () => {
  const audioHook = fs.readFileSync('./src/components/games/motorbike/useMotorbikeAudio.js', 'utf8');

  // Đề nổ và vòng lặp máy 110cc
  assert.match(audioHook, /playIgnition/, 'Có hàm đề nổ máy');
  assert.match(audioHook, /startEngine/, 'Có vòng lặp động cơ');
  assert.match(audioHook, /setEngineSpeed/, 'Có hàm đổi tốc độ máy');
  assert.match(audioHook, /playHorn/, 'Có tiếng còi xe bíp bíp');

  // Ducking khi gõ
  assert.match(audioHook, /setDucking/, 'Có tự động giảm âm lượng khi gõ');

  // Mute & localStorage
  assert.match(audioHook, /toggleMute/, 'Có nút bật tắt tiếng');
  assert.match(audioHook, /motorbike_audio_muted/, 'Lưu mute vào localStorage');
});

test('Motorbike: State machine và logic kéo thả, chấm chuẩn tiếng Việt', () => {
  const gameJsx = fs.readFileSync('./src/components/games/motorbike/FirstPersonMotorbikeGame2.jsx', 'utf8');

  // State machine các bước
  const states = ['introLenXe', 'chay', 'nghi', 'sapThe', 'nhap', 'xong'];
  for (const s of states) {
    assert.match(gameJsx, new RegExp(s), `Phải hỗ trợ trạng thái ${s}`);
  }

  // Pointer events kéo thả
  assert.match(gameJsx, /onPointerDown/, 'Hỗ trợ onPointerDown');
  assert.match(gameJsx, /onPointerMove/, 'Hỗ trợ onPointerMove');
  assert.match(gameJsx, /onPointerUp/, 'Hỗ trợ onPointerUp');

  // Dữ liệu mẫu 2 ô
  assert.equal(SAMPLE_MOTORBIKE_SLOTS.length, 2, 'Có 2 ô dữ liệu mẫu để thử nghiệm');

  // Chấm chuẩn tiếng Việt
  const sample = SAMPLE_MOTORBIKE_SLOTS[1];
  const exactCheck = compareAnswer('Giăng Mới đã nhận ăn sách mở Kh 10', sample.dapAnChuan);
  assert.equal(exactCheck.isExact, true);

  const wrongAccentCheck = compareAnswer('Giang Mới đã nhận ăn sách mở Kh 10', sample.dapAnChuan);
  assert.equal(wrongAccentCheck.isExact, false, 'Sai dấu tiếng Việt (Giang thay vì Giăng) phải bị chấm sai');
});
