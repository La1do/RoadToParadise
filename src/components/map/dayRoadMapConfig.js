/**
 * dayRoadMapConfig.js - Cấu hình 4 chặng và các hàm tính toán độ thuộc cho Bản đồ một ngày
 */

import { LEARNING_STEPS } from '../../core/index.js';

export const STAGES_CONFIG = [
  {
    id: 1,
    title: 'Chặng 1: Sáng phòng trọ',
    subtitle: 'Chuông báo thức 5:30 & Tĩnh nguyện đầu ngày',
    timeSlot: '05:30 - 07:00',
    location: 'Phòng trọ sinh viên',
    desc: 'Bắt đầu ngày mới trong căn phòng nhỏ, đọc lại những câu khải thị căn bản trước khi bước ra phố.',
    questionRange: [1, 5],
    color: '#f59e0b',
    accentColor: '#fbbf24'
  },
  {
    id: 2,
    title: 'Chặng 2: Đường & Giảng đường',
    subtitle: 'Chuyến xe buýt & Giờ học giảng đường',
    timeSlot: '07:30 - 16:30',
    location: 'Giảng đường Đại học',
    desc: 'Vượt qua ồn ào phố thị, giữ tâm trí trong sáng giữa những bài giảng và cuộc trò chuyện bạn bè.',
    questionRange: [6, 10],
    color: '#4a82b8',
    accentColor: '#7bb5e8'
  },
  {
    id: 3,
    title: 'Chặng 3: Chỗ làm thêm',
    subtitle: 'Ca làm mồ hôi & Áp lực cơm áo gạo tiền',
    timeSlot: '17:00 - 21:30',
    location: 'Quán ăn & Cửa hàng tiện lợi',
    desc: 'Lao động mệt nhoài, va chạm thực tế, lời dạy khải thị nhắc nhở giữ mình trung tín và kiên định.',
    questionRange: [11, 15],
    color: '#ec4899',
    accentColor: '#f472b6'
  },
  {
    id: 4,
    title: 'Chặng 4: Đêm phòng trọ & Cổng phán xét',
    subtitle: 'Đêm khuya thanh vắng & Về đích khải hoàn',
    timeSlot: '22:00 - 24:00',
    location: 'Phòng trọ & Cổng Thiên Đàng',
    desc: 'Trở về phòng trọ, soi xét một ngày đã qua dưới ánh sáng lời Chúa, hướng về đích đến cuối cùng.',
    questionRange: [16, 20],
    color: '#8b5cf6',
    accentColor: '#c084fc'
  }
];

/**
 * Tính class độ phát sáng theo Level thuộc (0 - 5)
 * - Level 0: xám mờ
 * - Level 1-2: vàng nhạt
 * - Level 3-4: vàng rực
 * - Level 5: hào quang sáng chói
 */
export function getMasteryGlowClass(level) {
  if (level >= 5) return 'slot-glow-5'; // Hào quang sáng chói
  if (level >= 3) return 'slot-glow-3-4'; // Vàng rực
  if (level >= 1) return 'slot-glow-1-2'; // Vàng nhạt
  return 'slot-glow-0'; // Xám mờ
}

/**
 * Mô tả text độ thuộc
 */
export function getMasteryLabel(level) {
  switch (level) {
    case 5:
      return 'Hào quang sáng chói (Level 5)';
    case 4:
      return 'Vàng rực (Level 4)';
    case 3:
      return 'Vàng rực (Level 3)';
    case 2:
      return 'Vàng nhạt (Level 2)';
    case 1:
      return 'Vàng nhạt (Level 1)';
    default:
      return 'Xám mờ (Level 0 - Chưa học)';
  }
}

/**
 * Tính toán thống kê toàn diện cho 20 câu / 50 ô
 * @param {Array} questions - Danh sách câu hỏi
 * @param {Object} srsMap - Dữ liệu SRS của từng slot
 * @param {Object} mistakeData - Dữ liệu sổ tiếc nuối
 * @returns {Object} stats
 */
export function calculateRoadmapStats(questions, srsMap = {}, mistakeData = {}) {
  let totalScore = 0;
  let masteredCount = 0;
  let totalSlots = 0;

  questions.forEach((q) => {
    q.slots.forEach((s) => {
      totalSlots++;
      const key = `q${q.id}_s${s.slotIndex}`;
      const level = srsMap[key]?.masteryLevel || 0;
      totalScore += level;
      if (level >= 3) {
        masteredCount++;
      }
    });
  });

  const maxScore = (totalSlots || 50) * 5;
  const masteryRatio = maxScore > 0 ? Math.min(1, Math.max(0, totalScore / maxScore)) : 0;
  const masteryPercentage = Math.round(masteryRatio * 100);

  const unresolvedMistakes = Object.values(mistakeData.slots || {}).filter(
    (entry) => !entry.isResolved && entry.failCount > 0
  ).length;

  return {
    totalSlots,
    totalScore,
    masteredCount,
    masteryRatio,
    masteryPercentage,
    unresolvedMistakes
  };
}
