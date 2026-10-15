import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('MinhCharacter: Kiểm tra các file tồn tại và không dùng hình ảnh ngoài', () => {
  const jsxPath = './src/components/character/MinhCharacter.jsx';
  const cssPath = './src/components/character/MinhCharacter.css';
  const demoPath = './src/components/character/CharacterDemo.jsx';

  assert.ok(fs.existsSync(jsxPath), 'File MinhCharacter.jsx phải tồn tại');
  assert.ok(fs.existsSync(cssPath), 'File MinhCharacter.css phải tồn tại');
  assert.ok(fs.existsSync(demoPath), 'File CharacterDemo.jsx phải tồn tại');

  const jsxContent = fs.readFileSync(jsxPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const demoContent = fs.readFileSync(demoPath, 'utf8');

  // Không dùng hình ảnh ngoài (png, jpg, webp, http/https link ảnh)
  assert.ok(!jsxContent.includes('<img'), 'Không dùng thẻ <img> ngoài trong MinhCharacter');
  assert.ok(!demoContent.includes('<img'), 'Không dùng thẻ <img> ngoài trong CharacterDemo');
  assert.ok(!cssContent.includes('url('), 'Không dùng url(...) hình ảnh ngoài trong CSS');
});

test('MinhCharacter: Kiểm tra cấu trúc SVG và 14 nhóm <g> theo yêu cầu', () => {
  const jsxContent = fs.readFileSync('./src/components/character/MinhCharacter.jsx', 'utf8');

  // Khung vẽ viewBox 0 0 300 600
  assert.match(jsxContent, /viewBox=["']0 0 300 600["']/, 'SVG phải có viewBox="0 0 300 600"');

  // 14 nhóm <g> có class riêng biệt
  const requiredGroups = [
    'dau',
    'toc-truoc',
    'toc-sau',
    'mat-trai',
    'mat-phai',
    'long-may',
    'mieng',
    'co',
    'than',
    'tay-trai',
    'tay-phai',
    'chan',
    'giay',
    'phu-kien',
  ];

  for (const group of requiredGroups) {
    const regex = new RegExp(`className=["'][^"']*\\b${group}\\b[^"']*["']`);
    assert.match(jsxContent, regex, `Phải có nhóm <g> với class "${group}"`);
  }

  // Nét nhận diện: thẻ sinh viên và balo
  assert.match(jsxContent, /the-sinh-vien|the_sinh_vien/i, 'Phải có thẻ sinh viên đeo cổ');
  assert.match(jsxContent, /balo/i, 'Phải có balo một bên vai');

  // Mắt có highlight 2 chấm trắng
  assert.match(jsxContent, /Highlight 1/i, 'Phải có đốm highlight trắng 1');
  assert.match(jsxContent, /Highlight 2/i, 'Phải có đốm highlight trắng 2');
});

test('MinhCharacter CSS: Kiểm tra các khớp transform-origin', () => {
  const cssContent = fs.readFileSync('./src/components/character/MinhCharacter.css', 'utf8');

  // Khớp vai, khuỷu, hông, gối
  assert.match(cssContent, /transform-origin:\s*108px\s+162px/, 'Khớp vai trái có transform-origin');
  assert.match(cssContent, /transform-origin:\s*192px\s+162px/, 'Khớp vai phải có transform-origin');
  assert.match(cssContent, /transform-origin:\s*100px\s+222px/, 'Khớp khuỷu trái có transform-origin');
  assert.match(cssContent, /transform-origin:\s*198px\s+222px/, 'Khớp khuỷu phải có transform-origin');
  assert.match(cssContent, /transform-origin:\s*132px\s+308px/, 'Khớp hông trái có transform-origin');
  assert.match(cssContent, /transform-origin:\s*168px\s+308px/, 'Khớp hông phải có transform-origin');
  assert.match(cssContent, /transform-origin:\s*130px\s+415px/, 'Khớp gối trái có transform-origin');
  assert.match(cssContent, /transform-origin:\s*170px\s+415px/, 'Khớp gối phải có transform-origin');
});

test('MinhCharacter CSS: 6 Biểu cảm khuôn mặt', () => {
  const cssContent = fs.readFileSync('./src/components/character/MinhCharacter.css', 'utf8');

  const expressions = ['dung-yen', 'vui', 'buon', 'suy-nghi', 'met', 'bat-ngo'];
  for (const exp of expressions) {
    assert.match(cssContent, new RegExp(`\\.${exp}`), `CSS phải hỗ trợ biểu cảm .${exp}`);
  }

  // Kiểm tra mồ hôi, dấu hỏi, bất ngờ, má hồng
  assert.match(cssContent, /\.bieu-cam-mo-hoi/, 'Có hiệu ứng mồ hôi cho biểu cảm .met');
  assert.match(cssContent, /\.bieu-cam-dau-hoi/, 'Có hiệu ứng dấu hỏi cho biểu cảm .suy-nghi');
  assert.match(cssContent, /\.bieu-cam-bat-ngo/, 'Có hiệu ứng dấu chấm than cho biểu cảm .bat-ngo');
  assert.match(cssContent, /\.ma-hong/, 'Có hiệu ứng má hồng khi vui');
});

test('MinhCharacter CSS: 5 Tư thế toàn thân', () => {
  const cssContent = fs.readFileSync('./src/components/character/MinhCharacter.css', 'utf8');

  const poses = ['dung', 'di-bo', 'ngoi-chay-xe', 'ngoi-ban-hoc', 'cui-nhin-dien-thoai'];
  for (const pose of poses) {
    assert.match(cssContent, new RegExp(`\\.${pose}`), `CSS phải hỗ trợ tư thế .${pose}`);
  }

  // Đạo cụ hỗ trợ tư thế
  assert.match(cssContent, /\.dao-cu-xe-may/, 'Có đạo cụ ghi-đông xe máy');
  assert.match(cssContent, /\.dao-cu-ban-hoc/, 'Có đạo cụ bàn học');
  assert.match(cssContent, /\.dao-cu-dien-thoai/, 'Có đạo cụ điện thoại');
});

test('MinhCharacter CSS: 4 Bộ trang phục qua CSS Variables', () => {
  const cssContent = fs.readFileSync('./src/components/character/MinhCharacter.css', 'utf8');

  // Các biến CSS bắt buộc
  assert.match(cssContent, /--mau-ao:/, 'Có biến --mau-ao');
  assert.match(cssContent, /--mau-quan:/, 'Có biến --mau-quan');
  assert.match(cssContent, /--mau-giay:/, 'Có biến --mau-giay');
  assert.match(cssContent, /--mau-toc:/, 'Có biến --mau-toc');
  assert.match(cssContent, /--phu-kien:/, 'Có biến --phu-kien');

  // 4 bộ đồ
  const outfits = ['di-hoc', 'lam-them', 'o-nha', 'cong-phan-xet'];
  for (const outfit of outfits) {
    assert.match(cssContent, new RegExp(`\\.${outfit}`), `CSS phải định nghĩa bộ đồ .${outfit}`);
  }
});

test('MinhCharacter CSS: Animation (thở, chớp mắt, tóc đung đưa, đi bộ, hào quang, prefers-reduced-motion)', () => {
  const cssContent = fs.readFileSync('./src/components/character/MinhCharacter.css', 'utf8');

  // Thở, chớp mắt, tóc
  assert.match(cssContent, /@keyframes tho-nguc/, 'Có keyframes thở');
  assert.match(cssContent, /@keyframes chop-mat/, 'Có keyframes chớp mắt');
  assert.match(cssContent, /@keyframes toc-rung/, 'Có keyframes tóc đung đưa');

  // Bước đi (khi .di-bo)
  assert.match(cssContent, /@keyframes buoc-chan-trai/, 'Có keyframes bước chân trái');
  assert.match(cssContent, /@keyframes buoc-chan-phai/, 'Có keyframes bước chân phải');

  // Hào quang drop-shadow với biến --do-thuoc
  assert.match(cssContent, /var\(--do-thuoc/, 'CSS drop-shadow dùng biến --do-thuoc');

  // Hỗ trợ prefers-reduced-motion
  assert.match(cssContent, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'Hỗ trợ prefers-reduced-motion');
});

test('CharacterDemo: Trang demo có đầy đủ nút bấm và thanh trượt', () => {
  const demoContent = fs.readFileSync('./src/components/character/CharacterDemo.jsx', 'utf8');

  // Biểu cảm, tư thế, trang phục
  assert.match(demoContent, /DS_BIEU_CAM/, 'Demo có danh sách biểu cảm');
  assert.match(demoContent, /DS_TU_THE/, 'Demo có danh sách tư thế');
  assert.match(demoContent, /DS_TRANG_PHUC/, 'Demo có danh sách trang phục');

  // Thanh trượt --do-thuoc
  assert.match(demoContent, /type=["']range["']/, 'Demo có input range cho --do-thuoc');
  assert.match(demoContent, /setDoThuoc/, 'Demo có hàm cập nhật doThuoc');

  // Nhúng component MinhCharacter
  assert.match(demoContent, /<MinhCharacter/, 'Demo render MinhCharacter');
});
