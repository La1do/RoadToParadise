/**
 * colors.js - Bảng mã màu tập trung cho JavaScript & JSX
 * Dùng khi cần lấy mã màu trực tiếp trong code JS/JSX (Canvas, inline style, config).
 * Khi muốn đổi màu, chỉ cần đổi tại đây và colors.css!
 */

export const COLORS = {
  // Theme chính
  primary: '#7bb5e8',        // Xanh pastel chủ đạo
  primaryDeep: '#4a82b8',    // Xanh đậm nhấn mạnh, nút chính
  textDark: '#1c3553',       // Xanh than đậm chữ chính
  borderLight: '#c5def3',    // Viền xanh sáng
  bgIce: '#eef6fc',          // Nền sữa ánh băng
  white: '#ffffff',          // Trắng tinh
  blush: '#fca5a5',          // Hồng nhẹ má hồng
  beak: '#fbd38d',           // Vàng mỏ chim cánh cụt
  gold: '#f59e0b',           // Vàng cam ấm

  // Trạng thái chấm điểm & sửa bài
  correctText: '#15803d',
  correctBg: '#dcfce7',
  correctBorder: '#86efac',

  wrongText: '#991b1b',
  wrongBg: '#f8d7da',
  wrongBorder: '#fca5a5',

  missingText: '#92400e',
  missingBg: '#fef3c7',
  missingBorder: '#fde68a',
};

export default COLORS;
