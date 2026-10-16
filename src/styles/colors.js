/**
 * colors.js - Bảng mã màu tập trung cho JavaScript & JSX
 * Dùng khi cần lấy mã màu trực tiếp trong code JS/JSX (Canvas, inline style, config).
 * Khi muốn đổi màu, chỉ cần đổi tại đây và colors.css!
 */

export const COLORS = {
  // Theme chính: Xanh pastel chủ đạo, trắng nhẹ phụ trợ
  primary: '#7bb5e8',        // Xanh pastel chủ đạo
  primarySoft: '#9ecaf1',    // Xanh pastel dịu mát bổ trợ
  primaryDeep: '#4a82b8',    // Xanh đậm nhấn mạnh, nút chính
  textDark: '#1c3553',       // Xanh than đậm chữ chính
  borderLight: '#b8daf5',    // Viền xanh pastel rõ nét
  bgIce: '#dcedfa',          // Nền xanh pastel băng tuyết chủ đạo
  white: '#f5f9fd',          // Trắng nhẹ dịu mắt (auxiliary soft off-white)
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
