import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Permissions Config: Kiểm tra file permissions.json tồn tại và cấu hình hợp lệ', () => {
  const filePath = './src/config/permissions.json';
  assert.ok(fs.existsSync(filePath), 'src/config/permissions.json phải tồn tại');

  const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.ok(config.defaultTab, 'Phải có defaultTab');
  assert.ok(config.tabs && typeof config.tabs === 'object', 'Phải có object tabs');
  assert.equal(typeof config.tabs['custom-practice'], 'boolean', 'custom-practice phải là boolean');
});

test('App Integration: App.jsx nhập permissions.json và lọc nav items', () => {
  const appJsx = fs.readFileSync('./src/App.jsx', 'utf8');

  assert.ok(appJsx.includes("import permissions from './config/permissions.json'"), 'Phải import permissions.json');
  assert.ok(appJsx.includes('isTabEnabled'), 'Phải có hàm kiểm tra isTabEnabled');
  assert.ok(appJsx.includes('visibleNavItems'), 'Phải lọc danh sách tab hiển thị theo permissions');
});
