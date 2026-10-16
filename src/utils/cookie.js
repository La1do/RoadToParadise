/**
 * cookie.js - Quản lý cookie và lưu trữ thông tin đăng nhập của người dùng
 * Lưu tên người dùng để chèn vào sticker, không bị mất khi tải lại trang.
 */

export const USER_NAME_KEY = 'road_user_name';
export const AUTH_STATUS_KEY = 'road_auth_status';

/**
 * Parse chuỗi thành VIẾT HOA TOÀN BỘ và KHÔNG DẤU, loại bỏ khoảng trắng và ký tự đặc biệt
 * Đảm bảo so sánh chính xác tuyệt đối không bị lỗi gõ phím / bộ gõ Unikey / Telex / VNI.
 * Ví dụ: "Thể thao", "thể thao", "the thao" -> "THETHAO"
 *        "B6", "b6", " b 6 "                -> "B6"
 */
export function parseUpperNoAccent(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Ghi cookie với thời hạn (mặc định 60 ngày)
 */
export function setCookie(name, value, days = 60) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  try {
    localStorage.setItem(name, value);
  } catch (e) {
    // Private mode fallback
  }
}

/**
 * Đọc cookie theo tên (kèm fallback localStorage)
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  if (matches) {
    return decodeURIComponent(matches[1]);
  }
  try {
    return localStorage.getItem(name);
  } catch (e) {
    return null;
  }
}

/**
 * Xóa cookie
 */
export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  try {
    localStorage.removeItem(name);
  } catch (e) {}
}

/**
 * Lấy tên người dùng hiện tại từ cookie
 */
export function getStoredUserName() {
  return getCookie(USER_NAME_KEY) || '';
}

/**
 * Lưu tên người dùng vào cookie
 */
export function setStoredUserName(name) {
  if (!name) return;
  setCookie(USER_NAME_KEY, name.trim(), 60);
}

/**
 * Kiểm tra trạng thái đã đăng nhập hay chưa
 */
export function isUserAuthenticated() {
  return Boolean(getCookie(AUTH_STATUS_KEY) === 'true' && getStoredUserName());
}

/**
 * Đánh dấu đăng nhập thành công
 */
export function setUserAuthenticated(name) {
  setStoredUserName(name);
  setCookie(AUTH_STATUS_KEY, 'true', 60);
}

/**
 * Đăng xuất
 */
export function logoutUser() {
  removeCookie(USER_NAME_KEY);
  removeCookie(AUTH_STATUS_KEY);
}
